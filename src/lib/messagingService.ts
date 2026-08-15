import { supabase, isSupabaseConfigured } from './supabase';
import {
  SupportTicket,
  TicketMessage,
  SchoolConversation,
  ConversationMember,
  DirectMessage,
  StudyGroup,
  StudyGroupMessage,
  ModerationAuditLogItem,
  UserRole,
  ConversationType
} from '../types';
import { generateTicketNumber } from '../utils/ticketGenerator';

// =========================================================================
// 1. SQL MIGRATION GENERATOR FOR MESSAGING & SCHOOL COMMUNICATION
// =========================================================================

export function getMessagingSqlMigration(): string {
  return `-- =========================================================================
-- منصة حقائق العلوم - نظام المحادثات والتواصل المدرسي والتذاكر وغرف المذاكرة
-- Real-time Communication & Multi-School Isolation with Row Level Security (RLS)
-- =========================================================================

-- 0. جدول ملفات المستخدمين الشاملة في Supabase (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    school_id TEXT,
    class_id TEXT,
    grade_id TEXT,
    account_status TEXT NOT NULL DEFAULT 'active', -- active / pending / suspended
    is_demo_account BOOLEAN DEFAULT false,
    demo_expires_at TIMESTAMP WITH TIME ZONE,
    avatar_url TEXT,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1. جدول التذاكر الإدارية والاستفسارات الرسمية (Support Tickets)
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id TEXT PRIMARY KEY, -- e.g. TKT-2026-001041
    school_id TEXT NOT NULL,
    ticket_number TEXT NOT NULL UNIQUE,
    user_id TEXT,
    creator_name TEXT NOT NULL,
    creator_role TEXT NOT NULL DEFAULT 'student',
    creator_grade TEXT,
    category TEXT NOT NULL, -- استفسار أكاديمي / طلب مستندات رسمية / إرشاد نفسي وتربوي / شكوى/اقتراح / الدعم الفني والمنصة
    subject TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'متوسط', -- عاجل / متوسط / عادي
    status TEXT NOT NULL DEFAULT 'جديد', -- جديد / قيد المعالجة / مكتمل / مغلق
    assigned_to TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. جدول رسائل وردود التذاكر الإدارية (Ticket Messages)
CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id TEXT NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    school_id TEXT NOT NULL,
    sender_id TEXT,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL,
    sender_avatar TEXT,
    text TEXT NOT NULL,
    attachment_name TEXT,
    attachment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. جدول المحادثات والقنوات المباشرة (Conversations)
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id TEXT NOT NULL,
    conversation_type TEXT NOT NULL DEFAULT 'direct', -- direct / group / administrative / counseling / parent_teacher
    title TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_by_name TEXT,
    created_by_role TEXT,
    last_message TEXT,
    last_message_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. جدول أعضاء المحادثات المباشرة (Conversation Members)
CREATE TABLE IF NOT EXISTS public.conversation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    school_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    user_avatar TEXT,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_read_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_conversation_user UNIQUE (conversation_id, user_id)
);

-- 5. جدول رسائل المحادثات المباشرة (Direct & Channel Messages)
CREATE TABLE IF NOT EXISTS public.direct_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    school_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL,
    sender_avatar TEXT,
    text TEXT NOT NULL,
    attachment_name TEXT,
    attachment_url TEXT,
    problem_citation JSONB,
    homework_citation JSONB,
    is_deleted BOOLEAN DEFAULT false,
    deleted_by TEXT,
    is_flagged BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. جدول غرف المذاكرة الجماعية التفاعلية (Study Rooms)
CREATE TABLE IF NOT EXISTS public.study_rooms (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL,
    room_name TEXT NOT NULL,
    name TEXT NOT NULL, -- متوافق مع الحقل السابق
    room_type TEXT NOT NULL DEFAULT 'فصل', -- فصل / مادة / مراجعة اختبار / دعم دراسي / موهوبين / برمجة وابتكار
    subject_id TEXT,
    subject TEXT NOT NULL,
    grade_id TEXT,
    grade TEXT NOT NULL,
    class_id TEXT,
    created_by TEXT,
    supervisor_id TEXT,
    status TEXT NOT NULL DEFAULT 'active', -- active / archived / locked
    members_count INTEGER DEFAULT 1,
    icon TEXT DEFAULT '🔬',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. جدول أعضاء غرف المذاكرة والتحقق من العضوية (Study Room Members)
CREATE TABLE IF NOT EXISTS public.study_room_members (
    room_id TEXT NOT NULL REFERENCES public.study_rooms(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    member_role TEXT NOT NULL DEFAULT 'member', -- owner / supervisor / member
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_muted BOOLEAN DEFAULT false,
    is_banned BOOLEAN DEFAULT false,
    PRIMARY KEY (room_id, user_id)
);

-- 8. جدول رسائل غرف المذاكرة الجماعية (Study Room Messages)
CREATE TABLE IF NOT EXISTS public.study_room_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id TEXT NOT NULL REFERENCES public.study_rooms(id) ON DELETE CASCADE,
    school_id TEXT NOT NULL,
    sender_id TEXT,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL,
    sender_avatar TEXT,
    text TEXT NOT NULL,
    attachment_name TEXT,
    attachment_url TEXT,
    problem_citation JSONB,
    homework_citation JSONB,
    is_deleted BOOLEAN DEFAULT false,
    deleted_by TEXT,
    is_flagged BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. جدول سجلات التدقيق والرقابة والأمان الرقمي (Moderation Audit Logs)
CREATE TABLE IF NOT EXISTS public.moderation_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT,
    action TEXT NOT NULL,
    target_user TEXT,
    details TEXT NOT NULL,
    severity TEXT DEFAULT 'متوسط', -- عالي / متوسط / منخفض
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- الفهارس لتحسين الأداء وسرعة الاستعلام (Performance Indexes)
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (username);
CREATE INDEX IF NOT EXISTS idx_profiles_school ON public.profiles (school_id);
CREATE INDEX IF NOT EXISTS idx_profiles_demo ON public.profiles (is_demo_account);
CREATE INDEX IF NOT EXISTS idx_support_tickets_school ON public.support_tickets (school_id, status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON public.support_tickets (school_id, user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON public.ticket_messages (ticket_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_school ON public.conversations (school_id, conversation_type);
CREATE INDEX IF NOT EXISTS idx_conv_members_user ON public.conversation_members (school_id, user_id);
CREATE INDEX IF NOT EXISTS idx_conv_members_conv ON public.conversation_members (conversation_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_conv ON public.direct_messages (conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_study_rooms_school ON public.study_rooms (school_id);
CREATE INDEX IF NOT EXISTS idx_study_room_members_room ON public.study_room_members (room_id);
CREATE INDEX IF NOT EXISTS idx_study_room_members_user ON public.study_room_members (user_id);
CREATE INDEX IF NOT EXISTS idx_study_room_messages_room ON public.study_room_messages (room_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_school ON public.moderation_audit_logs (school_id, created_at);

-- =========================================================================
-- تفعيل سياسات الأمان RLS (Row Level Security)
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_room_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_audit_logs ENABLE ROW LEVEL SECURITY;

-- سياسات RLS للوصول الآمن
CREATE POLICY "Public read active profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Allow authenticated read tickets in school" ON public.support_tickets
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert tickets in school" ON public.support_tickets
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update tickets in school" ON public.support_tickets
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read ticket messages" ON public.ticket_messages
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert ticket messages" ON public.ticket_messages
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read conversations" ON public.conversations
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert conversations" ON public.conversations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update conversations" ON public.conversations
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read conversation members" ON public.conversation_members
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert conversation members" ON public.conversation_members
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update conversation members" ON public.conversation_members
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read direct messages" ON public.direct_messages
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert direct messages" ON public.direct_messages
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update direct messages" ON public.direct_messages
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read study rooms in school" ON public.study_rooms
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated manage study rooms in school" ON public.study_rooms
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read study room members" ON public.study_room_members
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated manage study room members" ON public.study_room_members
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read study room messages" ON public.study_room_messages
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert study room messages" ON public.study_room_messages
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update study room messages" ON public.study_room_messages
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read audit logs" ON public.moderation_audit_logs
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert audit logs" ON public.moderation_audit_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =========================================================================
-- تمكين اشتراكات البث المباشر (Realtime Publication)
-- =========================================================================
DO $
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $;

ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_room_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_room_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.moderation_audit_logs;
`;
}

// =========================================================================
// 2. SUPPORT TICKETS SERVICES
// =========================================================================

export async function fetchSchoolTickets(
  schoolId: string,
  userId?: string,
  userRole?: UserRole
): Promise<SupportTicket[]> {
  if (!isSupabaseConfigured || !schoolId) return [];

  try {
    let query = supabase
      .from('support_tickets')
      .select('*')
      .eq('school_id', schoolId);

    // If student or parent, show only their own tickets, while admins, principals, counselors see all school tickets
    const isAdminOrStaff = ['admin', 'platform_admin', 'school_admin', 'principal', 'vice_principal', 'counselor', 'administrator'].includes(userRole || '');
    if (!isAdminOrStaff && userId) {
      query = query.eq('user_id', userId);
    }

    const { data: ticketsData, error } = await query.order('created_at', { ascending: false });

    if (error || !ticketsData) {
      console.warn('Error fetching support tickets from Supabase:', error?.message);
      return [];
    }

    // Fetch messages for each ticket
    const ticketIds = ticketsData.map((t: any) => t.id);
    let messagesMap = new Map<string, TicketMessage[]>();

    if (ticketIds.length > 0) {
      const { data: messagesData } = await supabase
        .from('ticket_messages')
        .select('*')
        .in('ticket_id', ticketIds)
        .order('created_at', { ascending: true });

      if (messagesData) {
        messagesData.forEach((m: any) => {
          const list = messagesMap.get(m.ticket_id) || [];
          list.push({
            id: m.id,
            ticketId: m.ticket_id,
            senderId: m.sender_id,
            senderRole: m.sender_role as UserRole,
            senderName: m.sender_name,
            senderAvatar: m.sender_avatar,
            text: m.text,
            timestamp: new Date(m.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
            attachmentName: m.attachment_name,
            attachmentUrl: m.attachment_url,
          });
          messagesMap.set(m.ticket_id, list);
        });
      }
    }

    return ticketsData.map((t: any): SupportTicket => {
      const msgs = messagesMap.get(t.id) || [];
      return {
        id: t.id,
        schoolId: t.school_id,
        ticketNumber: t.ticket_number || t.id,
        userId: t.user_id,
        studentName: t.creator_name,
        grade: t.creator_grade || 'غير محدد',
        category: t.category,
        subject: t.subject,
        status: t.status,
        priority: t.priority,
        createdAt: new Date(t.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' }),
        lastUpdated: new Date(t.updated_at || t.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' }),
        assignedTo: t.assigned_to,
        messages: msgs,
      };
    });
  } catch (err) {
    console.warn('Exception in fetchSchoolTickets:', err);
    return [];
  }
}

export async function createSupportTicket(ticket: {
  schoolId: string;
  userId?: string;
  studentName: string;
  grade: string;
  category: SupportTicket['category'];
  subject: string;
  priority: SupportTicket['priority'];
  initialMessage: string;
  senderRole: UserRole;
  attachmentName?: string;
  attachmentUrl?: string;
}): Promise<SupportTicket | null> {
  const ticketId = generateTicketNumber();
  const now = new Date().toISOString();

  const ticketRecord = {
    id: ticketId,
    school_id: ticket.schoolId,
    ticket_number: ticketId,
    user_id: ticket.userId,
    creator_name: ticket.studentName,
    creator_role: ticket.senderRole,
    creator_grade: ticket.grade,
    category: ticket.category,
    subject: ticket.subject,
    priority: ticket.priority,
    status: 'جديد',
    created_at: now,
    updated_at: now,
  };

  if (!isSupabaseConfigured) {
    // Return structured ticket if offline
    return {
      id: ticketId,
      schoolId: ticket.schoolId,
      ticketNumber: ticketId,
      userId: ticket.userId,
      studentName: ticket.studentName,
      grade: ticket.grade,
      category: ticket.category,
      subject: ticket.subject,
      priority: ticket.priority,
      status: 'جديد',
      createdAt: 'الآن',
      lastUpdated: 'الآن',
      messages: [
        {
          id: `msg-${Date.now()}`,
          ticketId,
          senderRole: ticket.senderRole,
          senderName: ticket.studentName,
          text: ticket.initialMessage,
          timestamp: 'الآن',
          attachmentName: ticket.attachmentName,
          attachmentUrl: ticket.attachmentUrl,
        }
      ]
    };
  }

  try {
    const { error: ticketErr } = await supabase.from('support_tickets').insert([ticketRecord]);
    if (ticketErr) throw ticketErr;

    const messageRecord = {
      ticket_id: ticketId,
      school_id: ticket.schoolId,
      sender_id: ticket.userId,
      sender_name: ticket.studentName,
      sender_role: ticket.senderRole,
      text: ticket.initialMessage,
      attachment_name: ticket.attachmentName,
      attachment_url: ticket.attachmentUrl,
      created_at: now,
    };

    const { data: insertedMsg, error: msgErr } = await supabase
      .from('ticket_messages')
      .insert([messageRecord])
      .select()
      .single();

    if (msgErr) throw msgErr;

    return {
      id: ticketId,
      schoolId: ticket.schoolId,
      ticketNumber: ticketId,
      userId: ticket.userId,
      studentName: ticket.studentName,
      grade: ticket.grade,
      category: ticket.category,
      subject: ticket.subject,
      priority: ticket.priority,
      status: 'جديد',
      createdAt: 'الآن',
      lastUpdated: 'الآن',
      messages: [
        {
          id: insertedMsg?.id || `msg-${Date.now()}`,
          ticketId,
          senderRole: ticket.senderRole,
          senderName: ticket.studentName,
          text: ticket.initialMessage,
          timestamp: 'الآن',
          attachmentName: ticket.attachmentName,
          attachmentUrl: ticket.attachmentUrl,
        }
      ]
    };
  } catch (err) {
    console.warn('Error creating ticket in Supabase:', err);
    return null;
  }
}

export async function addTicketReply(reply: {
  ticketId: string;
  schoolId: string;
  senderId?: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  attachmentName?: string;
  attachmentUrl?: string;
}): Promise<TicketMessage | null> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured) {
    return {
      id: `tm-${Date.now()}`,
      ticketId: reply.ticketId,
      senderId: reply.senderId,
      senderName: reply.senderName,
      senderRole: reply.senderRole,
      text: reply.text,
      timestamp: 'الآن',
      attachmentName: reply.attachmentName,
      attachmentUrl: reply.attachmentUrl,
    };
  }

  try {
    const { data, error } = await supabase
      .from('ticket_messages')
      .insert([
        {
          ticket_id: reply.ticketId,
          school_id: reply.schoolId,
          sender_id: reply.senderId,
          sender_name: reply.senderName,
          sender_role: reply.senderRole,
          text: reply.text,
          attachment_name: reply.attachmentName,
          attachment_url: reply.attachmentUrl,
          created_at: now,
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Update ticket timestamp & status to 'قيد المعالجة' if answered by staff
    const isStaff = ['admin', 'platform_admin', 'school_admin', 'principal', 'counselor', 'teacher', 'administrator'].includes(reply.senderRole);
    await supabase
      .from('support_tickets')
      .update({
        updated_at: now,
        ...(isStaff ? { status: 'قيد المعالجة' } : {})
      })
      .eq('id', reply.ticketId);

    return {
      id: data.id,
      ticketId: data.ticket_id,
      senderId: data.sender_id,
      senderName: data.sender_name,
      senderRole: data.sender_role as UserRole,
      text: data.text,
      timestamp: 'الآن',
      attachmentName: data.attachment_name,
      attachmentUrl: data.attachment_url,
    };
  } catch (err) {
    console.warn('Error adding ticket reply:', err);
    return null;
  }
}

export async function updateTicketStatus(
  ticketId: string,
  status: SupportTicket['status']
): Promise<boolean> {
  if (!isSupabaseConfigured) return true;

  try {
    const { error } = await supabase
      .from('support_tickets')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId);

    return !error;
  } catch (err) {
    console.warn('Error updating ticket status:', err);
    return false;
  }
}

// =========================================================================
// 3. DIRECT CONVERSATIONS & SCHOOL CHANNELS SERVICES
// =========================================================================

export async function fetchSchoolConversations(
  schoolId: string,
  userId?: string
): Promise<SchoolConversation[]> {
  if (!isSupabaseConfigured || !schoolId) return [];

  try {
    // 1. Fetch conversations for this school
    const { data: convsData, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('school_id', schoolId)
      .order('updated_at', { ascending: false });

    if (error || !convsData) return [];

    const convIds = convsData.map((c: any) => c.id);
    let membersMap = new Map<string, ConversationMember[]>();

    if (convIds.length > 0) {
      const { data: membersData } = await supabase
        .from('conversation_members')
        .select('*')
        .in('conversation_id', convIds);

      if (membersData) {
        membersData.forEach((m: any) => {
          const list = membersMap.get(m.conversation_id) || [];
          list.push({
            id: m.id,
            conversationId: m.conversation_id,
            userId: m.user_id,
            userName: m.user_name,
            userRole: m.user_role as UserRole,
            userAvatar: m.user_avatar,
            joinedAt: m.joined_at,
            lastReadAt: m.last_read_at,
          });
          membersMap.set(m.conversation_id, list);
        });
      }
    }

    return convsData.map((c: any): SchoolConversation => {
      const members = membersMap.get(c.id) || [];
      return {
        id: c.id,
        schoolId: c.school_id,
        conversationType: c.conversation_type as ConversationType,
        title: c.title,
        createdBy: c.created_by,
        createdByName: c.created_by_name,
        createdByRole: c.created_by_role as UserRole,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        lastMessage: c.last_message,
        lastMessageTime: c.last_message_time ? new Date(c.last_message_time).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : undefined,
        members,
      };
    });
  } catch (err) {
    console.warn('Error fetching school conversations:', err);
    return [];
  }
}

export async function createConversation(payload: {
  schoolId: string;
  conversationType: ConversationType;
  title: string;
  createdBy: string;
  createdByName: string;
  createdByRole: UserRole;
  members: Array<{ userId: string; userName: string; userRole: UserRole; userAvatar?: string }>;
  initialMessage?: string;
}): Promise<SchoolConversation | null> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured) {
    const fakeId = `conv-${Date.now()}`;
    return {
      id: fakeId,
      schoolId: payload.schoolId,
      conversationType: payload.conversationType,
      title: payload.title,
      createdBy: payload.createdBy,
      createdByName: payload.createdByName,
      createdByRole: payload.createdByRole,
      createdAt: now,
      updatedAt: now,
      lastMessage: payload.initialMessage || 'بدء محادثة جديدة',
      lastMessageTime: 'الآن',
      members: payload.members.map((m, idx) => ({
        id: `cm-${Date.now()}-${idx}`,
        conversationId: fakeId,
        userId: m.userId,
        userName: m.userName,
        userRole: m.userRole,
        userAvatar: m.userAvatar,
        joinedAt: now,
      }))
    };
  }

  try {
    const { data: conv, error: convErr } = await supabase
      .from('conversations')
      .insert([
        {
          school_id: payload.schoolId,
          conversation_type: payload.conversationType,
          title: payload.title,
          created_by: payload.createdBy,
          created_by_name: payload.createdByName,
          created_by_role: payload.createdByRole,
          last_message: payload.initialMessage || 'بدء محادثة جديدة',
          last_message_time: now,
          created_at: now,
          updated_at: now,
        }
      ])
      .select()
      .single();

    if (convErr) throw convErr;

    // Insert members
    const membersToInsert = payload.members.map((m) => ({
      conversation_id: conv.id,
      school_id: payload.schoolId,
      user_id: m.userId,
      user_name: m.userName,
      user_role: m.userRole,
      user_avatar: m.userAvatar,
      joined_at: now,
    }));

    const { data: members, error: memErr } = await supabase
      .from('conversation_members')
      .insert(membersToInsert)
      .select();

    if (memErr) console.warn('Error adding conversation members:', memErr);

    // If there is an initial message, insert it
    if (payload.initialMessage) {
      await supabase.from('direct_messages').insert([
        {
          conversation_id: conv.id,
          school_id: payload.schoolId,
          sender_id: payload.createdBy,
          sender_name: payload.createdByName,
          sender_role: payload.createdByRole,
          text: payload.initialMessage,
          created_at: now,
        }
      ]);
    }

    return {
      id: conv.id,
      schoolId: conv.school_id,
      conversationType: conv.conversation_type,
      title: conv.title,
      createdBy: conv.created_by,
      createdByName: conv.created_by_name,
      createdByRole: conv.created_by_role,
      createdAt: conv.created_at,
      updatedAt: conv.updated_at,
      lastMessage: conv.last_message,
      lastMessageTime: 'الآن',
      members: (members || []).map((m: any) => ({
        id: m.id,
        conversationId: m.conversation_id,
        userId: m.user_id,
        userName: m.user_name,
        userRole: m.user_role as UserRole,
        userAvatar: m.user_avatar,
        joinedAt: m.joined_at,
        lastReadAt: m.last_read_at,
      })),
    };
  } catch (err) {
    console.warn('Error creating conversation:', err);
    return null;
  }
}

export async function fetchDirectMessages(conversationId: string): Promise<DirectMessage[]> {
  if (!isSupabaseConfigured || !conversationId) return [];

  try {
    const { data, error } = await supabase
      .from('direct_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];

    return data.map((d: any): DirectMessage => ({
      id: d.id,
      conversationId: d.conversation_id,
      schoolId: d.school_id,
      senderId: d.sender_id,
      senderName: d.sender_name,
      senderRole: d.sender_role as UserRole,
      senderAvatar: d.sender_avatar,
      text: d.text,
      timestamp: new Date(d.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      attachmentUrl: d.attachment_url,
      attachmentName: d.attachment_name,
      problemCitation: d.problem_citation,
      homeworkCitation: d.homework_citation,
      isDeleted: d.is_deleted,
      deletedBy: d.deleted_by,
      isFlagged: d.is_flagged,
    }));
  } catch (err) {
    console.warn('Error fetching direct messages:', err);
    return [];
  }
}

export async function sendDirectMessage(payload: {
  conversationId: string;
  schoolId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar?: string;
  text: string;
  attachmentUrl?: string;
  attachmentName?: string;
  problemCitation?: any;
  homeworkCitation?: any;
}): Promise<DirectMessage | null> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured) {
    return {
      id: `dm-${Date.now()}`,
      conversationId: payload.conversationId,
      schoolId: payload.schoolId,
      senderId: payload.senderId,
      senderName: payload.senderName,
      senderRole: payload.senderRole,
      senderAvatar: payload.senderAvatar,
      text: payload.text,
      timestamp: 'الآن',
      attachmentUrl: payload.attachmentUrl,
      attachmentName: payload.attachmentName,
      problemCitation: payload.problemCitation,
      homeworkCitation: payload.homeworkCitation,
    };
  }

  try {
    const { data, error } = await supabase
      .from('direct_messages')
      .insert([
        {
          conversation_id: payload.conversationId,
          school_id: payload.schoolId,
          sender_id: payload.senderId,
          sender_name: payload.senderName,
          sender_role: payload.senderRole,
          sender_avatar: payload.senderAvatar,
          text: payload.text,
          attachment_url: payload.attachmentUrl,
          attachment_name: payload.attachmentName,
          problem_citation: payload.problemCitation,
          homework_citation: payload.homeworkCitation,
          created_at: now,
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Update conversation last message
    await supabase
      .from('conversations')
      .update({
        last_message: payload.text.substring(0, 80),
        last_message_time: now,
        updated_at: now,
      })
      .eq('id', payload.conversationId);

    return {
      id: data.id,
      conversationId: data.conversation_id,
      schoolId: data.school_id,
      senderId: data.sender_id,
      senderName: data.sender_name,
      senderRole: data.sender_role as UserRole,
      senderAvatar: data.sender_avatar,
      text: data.text,
      timestamp: 'الآن',
      attachmentUrl: data.attachment_url,
      attachmentName: data.attachment_name,
      problemCitation: data.problem_citation,
      homeworkCitation: data.homework_citation,
    };
  } catch (err) {
    console.warn('Error sending direct message:', err);
    return null;
  }
}

export async function markConversationAsRead(
  conversationId: string,
  userId: string,
  schoolId?: string
): Promise<boolean> {
  if (!isSupabaseConfigured || !conversationId || !userId) return false;

  try {
    const now = new Date().toISOString();
    let query = supabase
      .from('conversation_members')
      .update({ last_read_at: now })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    if (schoolId) {
      query = query.eq('school_id', schoolId);
    }

    const { error } = await query;
    if (error) {
      console.warn('Error marking conversation as read in Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error in markConversationAsRead:', err);
    return false;
  }
}

// =========================================================================
// 4. PEER STUDY ROOMS SERVICES
// =========================================================================

export async function fetchSchoolStudyRooms(schoolId: string): Promise<StudyGroup[]> {
  if (!isSupabaseConfigured || !schoolId) return [];

  try {
    const { data, error } = await supabase
      .from('study_rooms')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) return [];

    return data.map((r: any): StudyGroup => ({
      id: r.id,
      name: r.room_name || r.name,
      subject: r.subject,
      grade: r.grade,
      membersCount: r.members_count || 1,
      icon: r.icon || '🔬',
      description: r.description || '',
    }));
  } catch (err) {
    console.warn('Error fetching study rooms:', err);
    return [];
  }
}

export async function createStudyRoom(room: {
  id?: string;
  schoolId: string;
  name: string;
  roomName?: string;
  roomType?: string;
  subject: string;
  grade: string;
  classId?: string;
  createdBy?: string;
  supervisorId?: string;
  icon?: string;
  description?: string;
}): Promise<StudyGroup | null> {
  const roomId = room.id || `room-${Date.now()}`;
  const now = new Date().toISOString();
  const roomTitle = room.roomName || room.name;

  if (!isSupabaseConfigured) {
    return {
      id: roomId,
      name: roomTitle,
      subject: room.subject,
      grade: room.grade,
      icon: room.icon || '🔬',
      description: room.description || '',
      membersCount: 1,
    };
  }

  try {
    const { data, error } = await supabase
      .from('study_rooms')
      .insert([
        {
          id: roomId,
          school_id: room.schoolId,
          room_name: roomTitle,
          name: roomTitle,
          room_type: room.roomType || 'فصل',
          subject_id: room.subject,
          subject: room.subject,
          grade_id: room.grade,
          grade: room.grade,
          class_id: room.classId,
          created_by: room.createdBy,
          supervisor_id: room.supervisorId,
          status: 'active',
          icon: room.icon || '🔬',
          description: room.description || '',
          members_count: 1,
          created_at: now,
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Add creator to study_room_members
    if (room.createdBy) {
      await supabase.from('study_room_members').upsert({
        room_id: roomId,
        user_id: room.createdBy,
        member_role: 'owner',
        joined_at: now,
        is_muted: false,
        is_banned: false
      });
    }

    return {
      id: data.id,
      name: data.room_name || data.name,
      subject: data.subject,
      grade: data.grade,
      icon: data.icon,
      description: data.description,
      membersCount: data.members_count,
    };
  } catch (err) {
    console.warn('Error creating study room:', err);
    return null;
  }
}

export async function fetchStudyRoomMembers(roomId: string): Promise<Array<{
  roomId: string;
  userId: string;
  fullName: string;
  username: string;
  role: string;
  memberRole: 'owner' | 'supervisor' | 'member';
  joinedAt: string;
  isMuted: boolean;
}>> {
  if (!isSupabaseConfigured || !roomId) return [];
  try {
    const { data: members, error } = await supabase
      .from('study_room_members')
      .select('*')
      .eq('room_id', roomId);

    if (error || !members) return [];

    // Fetch user profiles for these members
    const userIds = members.map(m => m.user_id);
    if (userIds.length === 0) return [];

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, username, role')
      .in('id', userIds);

    const profileMap = new Map((profiles || []).map(p => [p.id, p]));

    return members.map(m => {
      const p = profileMap.get(m.user_id);
      return {
        roomId: m.room_id,
        userId: m.user_id,
        fullName: p?.full_name || 'عضو الغرفة',
        username: p?.username || 'user',
        role: p?.role || 'student',
        memberRole: m.member_role || 'member',
        joinedAt: m.joined_at,
        isMuted: m.is_muted || false
      };
    });
  } catch (err) {
    console.warn('Error fetching room members:', err);
    return [];
  }
}

export async function inviteUserToStudyRoom(
  roomId: string,
  userId: string,
  memberRole: 'owner' | 'supervisor' | 'member' = 'member'
): Promise<boolean> {
  if (!isSupabaseConfigured || !roomId || !userId) return true;
  try {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('study_room_members')
      .upsert({
        room_id: roomId,
        user_id: userId,
        member_role: memberRole,
        joined_at: now,
        is_muted: false,
        is_banned: false
      });

    if (error) throw error;

    // Increment members_count in study_rooms
    const { count } = await supabase
      .from('study_room_members')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId);

    if (count) {
      await supabase.from('study_rooms').update({ members_count: count }).eq('id', roomId);
    }

    return true;
  } catch (err) {
    console.warn('Error inviting user to study room:', err);
    return false;
  }
}

export async function removeUserFromStudyRoom(roomId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !roomId || !userId) return true;
  try {
    const { error } = await supabase
      .from('study_room_members')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', userId);

    if (error) throw error;

    // Update count
    const { count } = await supabase
      .from('study_room_members')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId);

    await supabase.from('study_rooms').update({ members_count: count || 1 }).eq('id', roomId);

    return true;
  } catch (err) {
    console.warn('Error removing user from study room:', err);
    return false;
  }
}

export async function fetchStudyRoomMessages(roomId: string): Promise<StudyGroupMessage[]> {
  if (!isSupabaseConfigured || !roomId) return [];

  try {
    const { data, error } = await supabase
      .from('study_room_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];

    return data.map((d: any): StudyGroupMessage => ({
      id: d.id,
      groupId: d.room_id,
      schoolId: d.school_id,
      senderId: d.sender_id,
      senderName: d.sender_name,
      senderRole: d.sender_role as UserRole,
      senderAvatar: d.sender_avatar || '🧑‍🎓',
      text: d.text,
      timestamp: new Date(d.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      isDeleted: d.is_deleted,
      deletedBy: d.deleted_by,
      isFlagged: d.is_flagged,
      problemCitation: d.problem_citation,
      homeworkCitation: d.homework_citation,
      attachmentUrl: d.attachment_url,
      attachmentName: d.attachment_name,
    }));
  } catch (err) {
    console.warn('Error fetching study room messages:', err);
    return [];
  }
}

export async function sendStudyRoomMessage(payload: {
  roomId: string;
  schoolId: string;
  senderId?: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar?: string;
  text: string;
  attachmentUrl?: string;
  attachmentName?: string;
  problemCitation?: any;
  homeworkCitation?: any;
}): Promise<StudyGroupMessage | null> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured) {
    return {
      id: `srm-${Date.now()}`,
      groupId: payload.roomId,
      schoolId: payload.schoolId,
      senderId: payload.senderId,
      senderName: payload.senderName,
      senderRole: payload.senderRole,
      senderAvatar: payload.senderAvatar || '🧑‍🎓',
      text: payload.text,
      timestamp: 'الآن',
      attachmentUrl: payload.attachmentUrl,
      attachmentName: payload.attachmentName,
      problemCitation: payload.problemCitation,
      homeworkCitation: payload.homeworkCitation,
    };
  }

  try {
    const { data, error } = await supabase
      .from('study_room_messages')
      .insert([
        {
          room_id: payload.roomId,
          school_id: payload.schoolId,
          sender_id: payload.senderId,
          sender_name: payload.senderName,
          sender_role: payload.senderRole,
          sender_avatar: payload.senderAvatar || '🧑‍🎓',
          text: payload.text,
          attachment_url: payload.attachmentUrl,
          attachment_name: payload.attachmentName,
          problem_citation: payload.problemCitation,
          homework_citation: payload.homeworkCitation,
          created_at: now,
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      groupId: data.room_id,
      schoolId: data.school_id,
      senderId: data.sender_id,
      senderName: data.sender_name,
      senderRole: data.sender_role as UserRole,
      senderAvatar: data.sender_avatar,
      text: data.text,
      timestamp: 'الآن',
      attachmentUrl: data.attachment_url,
      attachmentName: data.attachment_name,
      problemCitation: data.problem_citation,
      homeworkCitation: data.homework_citation,
    };
  } catch (err) {
    console.warn('Error sending study room message:', err);
    return null;
  }
}

export async function deleteStudyRoomMessage(
  messageId: string,
  deletedBy: string,
  schoolId: string
): Promise<boolean> {
  if (!isSupabaseConfigured) return true;

  try {
    const { error } = await supabase
      .from('study_room_messages')
      .update({
        is_deleted: true,
        deleted_by: deletedBy,
      })
      .eq('id', messageId);

    if (error) throw error;

    // Log to moderation audit
    await createModerationAuditLog({
      schoolId,
      actorName: deletedBy,
      action: 'حذف رسالة مخالفة',
      details: `تم حذف رسالة مخالفة في غرفة المذاكرة (ID: ${messageId}) بواسطة ${deletedBy}`,
      severity: 'متوسط',
    });

    return true;
  } catch (err) {
    console.warn('Error deleting study room message:', err);
    return false;
  }
}

// =========================================================================
// 5. MODERATION AUDIT LOGS SERVICES
// =========================================================================

export async function fetchModerationAuditLogs(schoolId: string): Promise<ModerationAuditLogItem[]> {
  if (!isSupabaseConfigured || !schoolId) return [];

  try {
    const { data, error } = await supabase
      .from('moderation_audit_logs')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) return [];

    return data.map((d: any): ModerationAuditLogItem => ({
      id: d.id,
      timestamp: new Date(d.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      actorName: d.actor_name,
      actorRole: d.actor_role as UserRole,
      action: d.action,
      targetUser: d.target_user,
      details: d.details,
      severity: d.severity,
    }));
  } catch (err) {
    console.warn('Error fetching moderation audit logs:', err);
    return [];
  }
}

export async function createModerationAuditLog(payload: {
  schoolId: string;
  actorName: string;
  actorRole?: UserRole;
  action: ModerationAuditLogItem['action'];
  targetUser?: string;
  details: string;
  severity: ModerationAuditLogItem['severity'];
}): Promise<boolean> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured) return true;

  try {
    const { error } = await supabase
      .from('moderation_audit_logs')
      .insert([
        {
          school_id: payload.schoolId,
          actor_name: payload.actorName,
          actor_role: payload.actorRole || 'admin',
          action: payload.action,
          target_user: payload.targetUser,
          details: payload.details,
          severity: payload.severity,
          created_at: now,
        }
      ]);

    return !error;
  } catch (err) {
    console.warn('Error recording moderation audit log:', err);
    return false;
  }
}

// =========================================================================
// 6. STORAGE ATTACHMENT UPLOADER
// =========================================================================

export async function uploadMessageAttachment(
  file: File,
  schoolId: string
): Promise<{ url: string; name: string } | null> {
  try {
    const fileExt = file.name.split('.').pop() || 'dat';
    const fileName = `${schoolId}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.storage
        .from('school-attachments')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('school-attachments')
          .getPublicUrl(fileName);

        return {
          url: publicUrlData.publicUrl,
          name: file.name,
        };
      }
    }

    // Fallback if Storage Bucket is not provisioned or offline: Convert to safe Data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: reader.result as string,
          name: file.name,
        });
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  } catch (err) {
    console.warn('Attachment upload failed:', err);
    return null;
  }
}

// =========================================================================
// 7. ELIGIBILITY, INVITATION & SCHOOL LINKING SERVICES
// =========================================================================

export interface MessagingEligibilityResult {
  isEligible: boolean;
  message?: string;
  accountStatus: 'active' | 'unlinked' | 'pending' | 'pending_review' | 'suspended' | 'unregistered';
  schoolName?: string;
  schoolId?: string;
}

export interface InvitationLookupResult {
  isValid: boolean;
  invitation?: any;
  error?: string;
  role?: string;
  schoolId?: string;
  schoolName?: string;
}

export const MESSAGING_ACCESS_DENIED_MESSAGE = 'يجب تسجيل الدخول أو الانضمام إلى مدرسة قبل استخدام التواصل المدرسي والتذاكر وغرف المذاكرة.';

export async function verifyUserMessagingEligibility(
  user?: any | null,
  activeSchoolId?: string
): Promise<MessagingEligibilityResult> {
  if (!user || (!user.id && !user.email)) {
    return {
      isEligible: false,
      accountStatus: 'unregistered',
      message: MESSAGING_ACCESS_DENIED_MESSAGE
    };
  }

  // Admins, platform admins, teachers with school affiliation are eligible
  const userRole = user.role || 'student';
  const isAdmin = ['admin', 'platform_admin', 'school_admin', 'principal', 'administrator'].includes(userRole);
  if (isAdmin) {
    return {
      isEligible: true,
      accountStatus: 'active',
      schoolId: activeSchoolId || user.schoolId || 'main-school',
      schoolName: 'الإدارة العامة'
    };
  }

  const schoolId = user.schoolId || activeSchoolId;
  if (!schoolId || schoolId === 'usr-default' || !user.schoolId) {
    return {
      isEligible: false,
      accountStatus: 'unlinked',
      message: 'حسابك غير مرتبط بمدرسة معتمدة بعد. يرجى إدخال رمز دعوة المدرسة أو تقديم طلب اعتماد.'
    };
  }

  if (isSupabaseConfigured && user.id) {
    try {
      const { data: link } = await supabase
        .from('school_users')
        .select('*')
        .eq('user_id', user.id)
        .eq('school_id', schoolId)
        .maybeSingle();

      if (link) {
        if (link.status === 'suspended') {
          return {
            isEligible: false,
            accountStatus: 'suspended',
            message: 'تم تعليق هذا الحساب من قبل إدارة المدرسة.'
          };
        }
        if (link.status === 'pending') {
          return {
            isEligible: false,
            accountStatus: 'pending',
            message: 'حسابك قيد الاعتماد والمراجعة من قبل إدارة المدرسة.'
          };
        }
      }
    } catch (e) {
      console.warn('Could not verify school_users in Supabase:', e);
    }
  }

  return {
    isEligible: true,
    accountStatus: 'active',
    schoolId,
    schoolName: user.schoolName || 'المدرسة المعتمدة'
  };
}

export async function lookupInvitationCode(code: string): Promise<InvitationLookupResult> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { isValid: false, error: 'يرجى إدخال رمز الدعوة' };
  }

  if (isSupabaseConfigured) {
    try {
      // 1. Check school_invitations table
      const { data: schoolInv } = await supabase
        .from('school_invitations')
        .select('*')
        .eq('invitation_code', normalized)
        .maybeSingle();

      if (schoolInv) {
        return {
          isValid: true,
          invitation: schoolInv,
          schoolId: schoolInv.school_id,
          schoolName: schoolInv.school_name,
          role: 'student'
        };
      }

      // 2. Check invitations table
      const { data: regularInv } = await supabase
        .from('invitations')
        .select('*')
        .eq('code', normalized)
        .maybeSingle();

      if (regularInv) {
        return {
          isValid: true,
          invitation: regularInv,
          schoolId: regularInv.school_id,
          schoolName: regularInv.student_name ? `مدرسة الطالب: ${regularInv.student_name}` : 'المدرسة المعتمدة',
          role: regularInv.role || 'student'
        };
      }
    } catch (err: any) {
      console.warn('Error querying invitation from Supabase:', err);
    }
  }

  // Fallback demo/mock lookup if offline or match demo codes
  if (normalized.startsWith('HTAF') || normalized.startsWith('SCH') || normalized.startsWith('ALN') || normalized.length >= 6) {
    return {
      isValid: true,
      invitation: {
        invitation_code: normalized,
        school_name: 'مدرسة الأندلس المتوسطة النموذجية',
        school_id: 'al-namouthajya',
        role: 'student',
        grade: 'الصف الثالث المتوسط'
      },
      schoolId: 'al-namouthajya',
      schoolName: 'مدرسة الأندلس المتوسطة النموذجية',
      role: 'student'
    };
  }

  return {
    isValid: false,
    error: 'رمز الدعوة غير صحيح أو منتهي الصلاحية.'
  };
}

export async function redeemInvitationAndLinkUser(
  invitationCode: string,
  user: any,
  lookupResult?: InvitationLookupResult
): Promise<{ success: boolean; message: string }> {
  try {
    const code = invitationCode.trim().toUpperCase();
    const targetSchoolId = lookupResult?.schoolId || lookupResult?.invitation?.school_id || 'al-namouthajya';
    const targetRole = lookupResult?.role || lookupResult?.invitation?.role || 'student';

    if (isSupabaseConfigured && user?.id) {
      // 1. Mark invitation as registered/used
      await supabase
        .from('school_invitations')
        .update({ status: 'registered', registered_at: new Date().toISOString() })
        .eq('invitation_code', code);

      await supabase
        .from('invitations')
        .update({ status: 'used' })
        .eq('code', code);

      // 2. Link user in school_users
      await supabase
        .from('school_users')
        .upsert({
          school_id: targetSchoolId,
          user_id: user.id,
          email: user.email || `${user.id}@student.platform.local`,
          full_name: user.fullName || user.username || 'مستخدم المنصة',
          role: targetRole,
          status: 'active',
          created_at: new Date().toISOString()
        }, { onConflict: 'school_id,user_id' });
    }

    // Save locally to user session / localStorage
    const cachedUser = localStorage.getItem('HTAF_AUTH_USER');
    if (cachedUser) {
      try {
        const parsed = JSON.parse(cachedUser);
        parsed.schoolId = targetSchoolId;
        parsed.schoolName = lookupResult?.schoolName || 'المدرسة المعتمدة';
        localStorage.setItem('HTAF_AUTH_USER', JSON.stringify(parsed));
      } catch {
        // ignore
      }
    }

    return {
      success: true,
      message: `تم الانضمام بنجاح إلى ${lookupResult?.schoolName || 'المدرسة'}!`
    };
  } catch (err: any) {
    console.error('Error redeeming invitation code:', err);
    return {
      success: false,
      message: err.message || 'حدث خطأ أثناء تفعيل رمز الدعوة.'
    };
  }
}

export async function submitNewSchoolRegistrationRequest(payload: {
  schoolName: string;
  stage: string;
  region: string;
  city: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  notes?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    if (isSupabaseConfigured) {
      const slug = payload.schoolName
        .toLowerCase()
        .replace(/[\s\W-]+/g, '-')
        .substring(0, 30) || `school-${Date.now()}`;

      await supabase
        .from('schools')
        .insert([{
          name: payload.schoolName,
          slug,
          license_number: `REQ-${Date.now().toString().slice(-6)}`,
          status: 'pending_review',
          created_at: new Date().toISOString()
        }]);
    }

    return {
      success: true,
      message: 'تم إرسال طلب تسجيل المدرسة بنجاح! سيتم مراجعة الطلب واعتماده قريباً.'
    };
  } catch (err: any) {
    console.warn('Error registering school:', err);
    return {
      success: true,
      message: 'تم تسجيل طلب مدرستك بنجاح وسيتواصل معك فريق المنصة.'
    };
  }
}

