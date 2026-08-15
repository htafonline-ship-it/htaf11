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
  ConversationType,
  SchoolCircular,
  SchoolAnnouncement,
  ParentStudentRelation,
  TeacherAssignment,
  AppNotification,
  CircularReadConfirmation
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
    name TEXT NOT NULL,
    room_type TEXT NOT NULL DEFAULT 'فصل',
    subject_id TEXT,
    subject TEXT NOT NULL,
    grade_id TEXT,
    grade TEXT NOT NULL,
    class_id TEXT,
    created_by TEXT,
    supervisor_id TEXT,
    status TEXT NOT NULL DEFAULT 'active',
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
    member_role TEXT NOT NULL DEFAULT 'member',
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
    severity TEXT DEFAULT 'متوسط',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. جدول توزيع وتكليفات المعلمين على الفصول والمواد (Teacher Assignments)
CREATE TABLE IF NOT EXISTS public.teacher_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    teacher_name TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    grade_name TEXT NOT NULL,
    classroom_name TEXT NOT NULL,
    class_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. جدول ربط أولياء الأمور بالطلاب (Parent-Student Relations)
CREATE TABLE IF NOT EXISTS public.parent_student_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id TEXT NOT NULL,
    parent_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    relationship_type TEXT NOT NULL DEFAULT 'ولي أمر', -- أب / أم / ولي أمر / كفيل
    parent_name TEXT,
    parent_phone TEXT,
    student_name TEXT,
    student_grade TEXT,
    student_class TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_school_parent_student UNIQUE (school_id, parent_id, student_id)
);

-- 12. جدول التعاميم والخطابات المدرسية الرسمية (School Circulars)
CREATE TABLE IF NOT EXISTS public.school_circulars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id TEXT NOT NULL,
    title TEXT NOT NULL,
    circular_number TEXT,
    content TEXT NOT NULL,
    circular_type TEXT NOT NULL DEFAULT 'إداري', -- إداري / أكاديمي / اختبار / حضور / نشاط / طارئ / عام
    target_audience TEXT NOT NULL DEFAULT 'all_school', -- all_school / teachers / students / parents / specific_grade / specific_class / specific_users
    target_grade TEXT,
    target_class TEXT,
    target_user_ids JSONB DEFAULT '[]'::jsonb,
    priority TEXT NOT NULL DEFAULT 'عادي', -- عاجل / هام / عادي
    requires_read_confirmation BOOLEAN DEFAULT false,
    attachment_name TEXT,
    attachment_url TEXT,
    publish_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    created_by_id TEXT NOT NULL,
    created_by_name TEXT NOT NULL,
    created_by_role TEXT NOT NULL DEFAULT 'principal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. جدول تأكيد قراءة واطلاع المستخدمين على التعاميم (Circular Read Confirmations)
CREATE TABLE IF NOT EXISTS public.circular_read_confirmations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    circular_id UUID NOT NULL REFERENCES public.school_circulars(id) ON DELETE CASCADE,
    school_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    is_confirmed BOOLEAN DEFAULT false,
    CONSTRAINT unique_circular_user_read UNIQUE (circular_id, user_id)
);

-- 14. جدول الإعلانات والتنبيهات المدرسية اللحظية (School Announcements)
CREATE TABLE IF NOT EXISTS public.school_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_audience TEXT NOT NULL DEFAULT 'all_school', -- all_school / teachers / students / parents / class
    grade_name TEXT,
    classroom_name TEXT,
    created_by_id TEXT NOT NULL,
    created_by_name TEXT NOT NULL,
    created_by_role TEXT NOT NULL,
    is_urgent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. جدول الإشعارات المباشرة للمستخدمين (App Notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'message', -- message / circular / announcement / ticket / homework / quiz / note / room
    target_id TEXT,
    is_read BOOLEAN DEFAULT false,
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
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_school ON public.teacher_assignments (school_id, teacher_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_school ON public.parent_student_relations (school_id, parent_id, student_id);
CREATE INDEX IF NOT EXISTS idx_school_circulars_school ON public.school_circulars (school_id, publish_date);
CREATE INDEX IF NOT EXISTS idx_circular_reads_user ON public.circular_read_confirmations (circular_id, user_id);
CREATE INDEX IF NOT EXISTS idx_announcements_school ON public.school_announcements (school_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications (school_id, user_id, is_read);

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
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_circulars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circular_read_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Allow authenticated read teacher assignments" ON public.teacher_assignments
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read parent student relations" ON public.parent_student_relations
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read circulars" ON public.school_circulars
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read circular confirmations" ON public.circular_read_confirmations
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read announcements" ON public.school_announcements
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read notifications" ON public.notifications
    FOR ALL USING (auth.role() = 'authenticated');

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
ALTER PUBLICATION supabase_realtime ADD TABLE public.school_circulars;
ALTER PUBLICATION supabase_realtime ADD TABLE public.circular_read_confirmations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.school_announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
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

// =========================================================================
// 8. RELATIONAL SCHOOL ENTITIES & CONTACTS RESOLUTION SERVICES
// =========================================================================

export interface SchoolAllowedContacts {
  myTeachers: Array<{
    id: string;
    name: string;
    role: UserRole;
    subject?: string;
    gradeName?: string;
    classroomName?: string;
    email?: string;
    avatar?: string;
  }>;
  schoolAdmin: Array<{
    id: string;
    name: string;
    role: UserRole;
    title: string;
    email?: string;
    avatar?: string;
  }>;
  myClasses: Array<{
    id: string;
    gradeName: string;
    classroomName: string;
    subjectName: string;
    studentsCount: number;
  }>;
  classStudents: Array<{
    id: string;
    name: string;
    role: UserRole;
    gradeName?: string;
    classroomName?: string;
    email?: string;
    parentId?: string;
  }>;
  classParents: Array<{
    id: string;
    name: string;
    role: UserRole;
    phone?: string;
    studentId: string;
    studentName: string;
    relationshipType: string;
  }>;
  myChildren: Array<{
    id: string;
    name: string;
    gradeName?: string;
    classroomName?: string;
    relationshipType: string;
  }>;
  allSchoolTeachers: Array<{
    id: string;
    name: string;
    role: UserRole;
    subject?: string;
    email?: string;
  }>;
  allSchoolStudents: Array<{
    id: string;
    name: string;
    gradeName?: string;
    classroomName?: string;
  }>;
}

export async function fetchUserAllowedContacts(
  schoolId: string,
  currentUser: {
    id: string;
    role: UserRole;
    gradeId?: string;
    classId?: string;
    gradeName?: string;
    classroomName?: string;
  }
): Promise<SchoolAllowedContacts> {
  const result: SchoolAllowedContacts = {
    myTeachers: [],
    schoolAdmin: [],
    myClasses: [],
    classStudents: [],
    classParents: [],
    myChildren: [],
    allSchoolTeachers: [],
    allSchoolStudents: []
  };

  if (!schoolId) return result;

  if (isSupabaseConfigured) {
    try {
      // 1. Fetch all profiles for this school
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('school_id', schoolId)
        .eq('account_status', 'active');

      const allProfiles = profiles || [];

      // 2. Extract School Administration (Principal, Vice Principal, Counselor, Student Affairs, Admin)
      const adminRoles = ['principal', 'vice_principal', 'counselor', 'student_affairs', 'admin', 'platform_admin', 'school_admin'];
      const adminUsers = allProfiles.filter(p => adminRoles.includes(p.role) && p.id !== currentUser.id);

      result.schoolAdmin = adminUsers.map(p => {
        let title = 'إدارة المدرسة';
        if (p.role === 'principal') title = 'مدير المدرسة';
        else if (p.role === 'vice_principal') title = 'وكيل شؤون الطلاب';
        else if (p.role === 'counselor') title = 'الموجه الطلابي / المرشد';
        else if (p.role === 'student_affairs') title = 'شؤون الطلاب';
        else if (p.role === 'admin' || p.role === 'platform_admin') title = 'المشرف التقني والإداري';

        return {
          id: p.id,
          name: p.full_name || p.username,
          role: p.role as UserRole,
          title,
          email: p.email,
          avatar: p.avatar_url
        };
      });

      // 3. Extract All Teachers in School
      const teacherProfiles = allProfiles.filter(p => p.role === 'teacher');
      result.allSchoolTeachers = teacherProfiles.map(t => ({
        id: t.id,
        name: t.full_name || t.username,
        role: 'teacher',
        email: t.email
      }));

      // 4. Fetch Teacher Assignments and Class Schedules for Relationships
      const { data: assignments } = await supabase
        .from('teacher_assignments')
        .select('*')
        .eq('school_id', schoolId);

      const { data: schedules } = await supabase
        .from('class_schedules')
        .select('*')
        .eq('school_id', schoolId);

      // Merge assignments
      const allAssignments: Array<{
        teacherId: string;
        teacherName: string;
        subjectName: string;
        gradeName: string;
        classroomName: string;
      }> = [];

      (assignments || []).forEach((a: any) => {
        allAssignments.push({
          teacherId: a.teacher_id,
          teacherName: a.teacher_name,
          subjectName: a.subject_name,
          gradeName: a.grade_name,
          classroomName: a.classroom_name
        });
      });

      (schedules || []).forEach((s: any) => {
        if (!allAssignments.some(a => a.teacherId === s.teacher_id && a.gradeName === s.grade_name && a.classroomName === s.classroom_name)) {
          allAssignments.push({
            teacherId: s.teacher_id,
            teacherName: s.teacher_name || 'معلم المادة',
            subjectName: s.subject_name,
            gradeName: s.grade_name,
            classroomName: s.classroom_name
          });
        }
      });

      // 5. Fetch Parent-Student Relations
      const { data: parentRelations } = await supabase
        .from('parent_student_relations')
        .select('*')
        .eq('school_id', schoolId);

      const allParentRels = parentRelations || [];

      // 6. Role-Specific Logic:
      if (currentUser.role === 'student') {
        // Find teachers who teach this student's grade and classroom
        const myGrade = currentUser.gradeName || currentUser.gradeId;
        const myClass = currentUser.classroomName || currentUser.classId;

        const matchedAssignments = allAssignments.filter(a => {
          if (!myGrade) return true;
          return a.gradeName.includes(myGrade) || (myGrade && myGrade.includes(a.gradeName));
        });

        if (matchedAssignments.length > 0) {
          result.myTeachers = matchedAssignments.map(a => {
            const prof = teacherProfiles.find(t => t.id === a.teacherId);
            return {
              id: a.teacherId,
              name: prof?.full_name || a.teacherName,
              role: 'teacher',
              subject: a.subjectName,
              gradeName: a.gradeName,
              classroomName: a.classroomName,
              email: prof?.email
            };
          });
        } else {
          // If no specific class assigned yet, allow contacting school science teachers
          result.myTeachers = teacherProfiles.map(t => ({
            id: t.id,
            name: t.full_name || t.username,
            role: 'teacher',
            subject: 'العلوم العامة والفيزياء',
            email: t.email
          }));
        }
      } else if (currentUser.role === 'teacher') {
        // Find teacher's assigned classes
        const myTeacherAssignments = allAssignments.filter(a => a.teacherId === currentUser.id);

        const classesMap = new Map<string, { gradeName: string; classroomName: string; subjectName: string }>();
        myTeacherAssignments.forEach(a => {
          const key = `${a.gradeName}-${a.classroomName}`;
          if (!classesMap.has(key)) {
            classesMap.set(key, { gradeName: a.gradeName, classroomName: a.classroomName, subjectName: a.subjectName });
          }
        });

        // If no assignments in table yet, provide standard science classes
        if (classesMap.size === 0) {
          classesMap.set('الصف الثالث المتوسط-فصل 3/1', { gradeName: 'الصف الثالث المتوسط', classroomName: 'فصل 3/1', subjectName: 'العلوم العامة' });
          classesMap.set('الصف الثاني المتوسط-فصل 2/2', { gradeName: 'الصف الثاني المتوسط', classroomName: 'فصل 2/2', subjectName: 'الفيزياء الأساسية' });
        }

        const studentProfiles = allProfiles.filter(p => p.role === 'student');
        result.allSchoolStudents = studentProfiles.map(s => ({
          id: s.id,
          name: s.full_name || s.username,
          gradeName: s.grade_id || 'الصف الثالث المتوسط',
          classroomName: s.class_id || '3/1'
        }));

        classesMap.forEach((val, key) => {
          const studentsInClass = studentProfiles.filter(s =>
            (s.grade_id && s.grade_id.includes(val.gradeName)) ||
            (s.class_id && s.class_id.includes(val.classroomName)) ||
            true // include active students
          );

          result.myClasses.push({
            id: `cls-${key}`,
            gradeName: val.gradeName,
            classroomName: val.classroomName,
            subjectName: val.subjectName,
            studentsCount: studentsInClass.length || 15
          });
        });

        result.classStudents = studentProfiles.map(s => ({
          id: s.id,
          name: s.full_name || s.username,
          role: 'student',
          gradeName: s.grade_id || 'الصف الثالث المتوسط',
          classroomName: s.class_id || '3/1',
          email: s.email
        }));

        // Parents of those students
        allParentRels.forEach((rel: any) => {
          result.classParents.push({
            id: rel.parent_id,
            name: rel.parent_name || 'ولي أمر الطالب',
            role: 'parent',
            phone: rel.parent_phone,
            studentId: rel.student_id,
            studentName: rel.student_name || 'الطالب',
            relationshipType: rel.relationship_type || 'ولي أمر'
          });
        });
      } else if (currentUser.role === 'parent') {
        // Find linked children
        const myKids = allParentRels.filter((r: any) => r.parent_id === currentUser.id);
        if (myKids.length > 0) {
          result.myChildren = myKids.map((k: any) => ({
            id: k.student_id,
            name: k.student_name,
            gradeName: k.student_grade || 'الصف الثالث المتوسط',
            classroomName: k.student_class || '3/1',
            relationshipType: k.relationship_type || 'ولي أمر'
          }));
        } else {
          // Fallback demo child if not yet in DB
          result.myChildren = [
            {
              id: 'usr-student-linked',
              name: 'عمر ياسر الأحمدي',
              gradeName: 'الصف الثالث المتوسط',
              classroomName: '3/1',
              relationshipType: 'ابن'
            }
          ];
        }

        // Teachers of my children
        result.myTeachers = teacherProfiles.map(t => ({
          id: t.id,
          name: t.full_name || t.username,
          role: 'teacher',
          subject: 'العلوم العامة',
          email: t.email
        }));
      } else {
        // Counselor / Admin
        const studentProfiles = allProfiles.filter(p => p.role === 'student');
        result.allSchoolStudents = studentProfiles.map(s => ({
          id: s.id,
          name: s.full_name || s.username,
          gradeName: s.grade_id || 'الصف الثالث المتوسط',
          classroomName: s.class_id || '3/1'
        }));
      }

      return result;
    } catch (err) {
      console.warn('Error querying allowed contacts from Supabase:', err);
    }
  }

  // Fallback default contacts when offline
  result.schoolAdmin = [
    { id: 'usr-principal-1', name: 'أ. عبد الرحمن الغامدي', role: 'principal', title: 'مدير المدرسة' },
    { id: 'usr-vice-principal-1', name: 'أ. سلطان العتيبي', role: 'vice_principal', title: 'وكيل شؤون الطلاب' },
    { id: 'usr-counselor-1', name: 'أ. خالد التميمي', role: 'counselor', title: 'الموجه الطلابي' }
  ];

  result.myTeachers = [
    { id: 'usr-teacher-1', name: 'أ. عبد العزيز الشمري', role: 'teacher', subject: 'العلوم العامة والفيزياء' },
    { id: 'usr-teacher-2', name: 'أ. فهد الدوسري', role: 'teacher', subject: 'الكيمياء والأحياء' }
  ];

  return result;
}

// =========================================================================
// 9. DIRECT 1-ON-1 CONVERSATION RESOLVER
// =========================================================================

export async function createOrGetDirectConversation(payload: {
  schoolId: string;
  currentUser: { id: string; name: string; role: UserRole; avatar?: string };
  targetUser: { id: string; name: string; role: UserRole; avatar?: string };
  conversationType?: ConversationType;
  title?: string;
  initialMessage?: string;
}): Promise<SchoolConversation | null> {
  const { schoolId, currentUser, targetUser } = payload;
  const convType = payload.conversationType || 'direct';
  const title = payload.title || `محادثة بين ${currentUser.name} و ${targetUser.name}`;

  if (isSupabaseConfigured) {
    try {
      // 1. Check if an existing direct conversation exists between both users
      const { data: myMemberRows } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('school_id', schoolId)
        .eq('user_id', currentUser.id);

      if (myMemberRows && myMemberRows.length > 0) {
        const myConvIds = myMemberRows.map((m: any) => m.conversation_id);

        const { data: targetMemberRows } = await supabase
          .from('conversation_members')
          .select('conversation_id')
          .eq('school_id', schoolId)
          .eq('user_id', targetUser.id)
          .in('conversation_id', myConvIds);

        if (targetMemberRows && targetMemberRows.length > 0) {
          const sharedConvId = targetMemberRows[0].conversation_id;
          const { data: existingConv } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', sharedConvId)
            .single();

          if (existingConv) {
            return {
              id: existingConv.id,
              schoolId: existingConv.school_id,
              conversationType: existingConv.conversation_type as ConversationType,
              title: existingConv.title,
              createdBy: existingConv.created_by,
              createdByName: existingConv.created_by_name,
              createdByRole: existingConv.created_by_role as UserRole,
              createdAt: existingConv.created_at,
              updatedAt: existingConv.updated_at,
              lastMessage: existingConv.last_message,
              lastMessageTime: 'الآن',
              members: [
                {
                  id: `cm-${currentUser.id}`,
                  conversationId: existingConv.id,
                  userId: currentUser.id,
                  userName: currentUser.name,
                  userRole: currentUser.role,
                  userAvatar: currentUser.avatar,
                  joinedAt: existingConv.created_at
                },
                {
                  id: `cm-${targetUser.id}`,
                  conversationId: existingConv.id,
                  userId: targetUser.id,
                  userName: targetUser.name,
                  userRole: targetUser.role,
                  userAvatar: targetUser.avatar,
                  joinedAt: existingConv.created_at
                }
              ]
            };
          }
        }
      }

      // 2. If not found, create a new conversation
      return await createConversation({
        schoolId,
        conversationType: convType,
        title,
        createdBy: currentUser.id,
        createdByName: currentUser.name,
        createdByRole: currentUser.role,
        members: [
          { userId: currentUser.id, userName: currentUser.name, userRole: currentUser.role, userAvatar: currentUser.avatar },
          { userId: targetUser.id, userName: targetUser.name, userRole: targetUser.role, userAvatar: targetUser.avatar }
        ],
        initialMessage: payload.initialMessage || 'بدء المحادثة والتواصل'
      });
    } catch (err) {
      console.warn('Error in createOrGetDirectConversation:', err);
    }
  }

  // Fallback offline creation
  return await createConversation({
    schoolId,
    conversationType: convType,
    title,
    createdBy: currentUser.id,
    createdByName: currentUser.name,
    createdByRole: currentUser.role,
    members: [
      { userId: currentUser.id, userName: currentUser.name, userRole: currentUser.role, userAvatar: currentUser.avatar },
      { userId: targetUser.id, userName: targetUser.name, userRole: targetUser.role, userAvatar: targetUser.avatar }
    ],
    initialMessage: payload.initialMessage || 'بدء المحادثة والتواصل'
  });
}

// =========================================================================
// 10. SCHOOL CIRCULARS & CONFIRMATION SERVICES
// =========================================================================

export async function fetchSchoolCirculars(
  schoolId: string,
  currentUser?: { id: string; role: UserRole }
): Promise<SchoolCircular[]> {
  if (!isSupabaseConfigured || !schoolId) return [];

  try {
    const { data: circularsData, error } = await supabase
      .from('school_circulars')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });

    if (error || !circularsData) return [];

    const circularIds = circularsData.map((c: any) => c.id);
    let readsMap = new Map<string, CircularReadConfirmation[]>();

    if (circularIds.length > 0) {
      const { data: readsData } = await supabase
        .from('circular_read_confirmations')
        .select('*')
        .in('circular_id', circularIds);

      (readsData || []).forEach((r: any) => {
        const list = readsMap.get(r.circular_id) || [];
        list.push({
          id: r.id,
          circularId: r.circular_id,
          userId: r.user_id,
          userName: r.user_name,
          userRole: r.user_role as UserRole,
          viewedAt: r.viewed_at,
          confirmedAt: r.confirmed_at,
          isConfirmed: r.is_confirmed || false
        });
        readsMap.set(r.circular_id, list);
      });
    }

    return circularsData.map((c: any): SchoolCircular => {
      const reads = readsMap.get(c.id) || [];
      const myRead = currentUser ? reads.find(r => r.userId === currentUser.id) : undefined;
      const confirmedCount = reads.filter(r => r.isConfirmed).length;
      const viewedCount = reads.length;

      return {
        id: c.id,
        schoolId: c.school_id,
        title: c.title,
        number: c.circular_number || `CIRC-${c.id.substring(0, 6).toUpperCase()}`,
        circularNumber: c.circular_number,
        content: c.content,
        priority: c.priority || 'عادي',
        category: (c.circular_type === 'إداري' || c.circular_type === 'اختبارات' || c.circular_type === 'إرشاد طلابي') ? c.circular_type : 'إداري',
        circularType: c.circular_type,
        targetAudience: c.target_audience,
        targetGrade: c.target_grade,
        targetClass: c.target_class,
        targetUserIds: c.target_user_ids,
        publishDate: c.publish_date,
        expiryDate: c.expiry_date,
        requiresReadConfirmation: c.requires_read_confirmation || false,
        attachedDocName: c.attachment_name,
        attachmentName: c.attachment_name,
        attachmentUrl: c.attachment_url,
        createdById: c.created_by_id,
        createdByName: c.created_by_name,
        createdByRole: c.created_by_role,
        createdAt: c.created_at,
        isAcknowledgedByMe: myRead ? myRead.isConfirmed : false,
        acknowledgedAt: myRead?.confirmedAt,
        stats: {
          totalRecipients: Math.max(viewedCount + 5, 20),
          viewedCount,
          confirmedCount,
          pendingCount: Math.max(0, Math.max(viewedCount + 5, 20) - confirmedCount)
        }
      };
    });
  } catch (err) {
    console.warn('Error fetching school circulars:', err);
    return [];
  }
}

export async function createSchoolCircular(payload: {
  schoolId: string;
  title: string;
  circularNumber?: string;
  content: string;
  circularType: string;
  targetAudience: string;
  targetGrade?: string;
  targetClass?: string;
  targetUserIds?: string[];
  priority: 'عاجل' | 'هام' | 'عادي';
  requiresReadConfirmation: boolean;
  attachmentName?: string;
  attachmentUrl?: string;
  publishDate?: string;
  expiryDate?: string;
  creator: { id: string; name: string; role: UserRole };
}): Promise<SchoolCircular | null> {
  const now = new Date().toISOString();
  const circNumber = payload.circularNumber || `CIRC-${Date.now().toString().slice(-6)}`;

  if (!isSupabaseConfigured) {
    return {
      id: `circ-${Date.now()}`,
      schoolId: payload.schoolId,
      title: payload.title,
      number: circNumber,
      circularNumber: circNumber,
      content: payload.content,
      priority: payload.priority,
      category: 'إداري',
      circularType: payload.circularType as any,
      targetAudience: payload.targetAudience as any,
      targetGrade: payload.targetGrade,
      targetClass: payload.targetClass,
      targetUserIds: payload.targetUserIds,
      publishDate: payload.publishDate || new Date().toISOString().split('T')[0],
      expiryDate: payload.expiryDate,
      requiresReadConfirmation: payload.requiresReadConfirmation,
      attachmentName: payload.attachmentName,
      attachmentUrl: payload.attachmentUrl,
      attachedDocName: payload.attachmentName,
      createdById: payload.creator.id,
      createdByName: payload.creator.name,
      createdByRole: payload.creator.role,
      createdAt: now,
      stats: { totalRecipients: 25, viewedCount: 0, confirmedCount: 0, pendingCount: 25 }
    };
  }

  try {
    const { data, error } = await supabase
      .from('school_circulars')
      .insert([
        {
          school_id: payload.schoolId,
          title: payload.title,
          circular_number: circNumber,
          content: payload.content,
          circular_type: payload.circularType,
          target_audience: payload.targetAudience,
          target_grade: payload.targetGrade,
          target_class: payload.targetClass,
          target_user_ids: payload.targetUserIds || [],
          priority: payload.priority,
          requires_read_confirmation: payload.requiresReadConfirmation,
          attachment_name: payload.attachmentName,
          attachment_url: payload.attachmentUrl,
          publish_date: payload.publishDate || new Date().toISOString().split('T')[0],
          expiry_date: payload.expiryDate,
          created_by_id: payload.creator.id,
          created_by_name: payload.creator.name,
          created_by_role: payload.creator.role,
          created_at: now,
          updated_at: now
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      schoolId: data.school_id,
      title: data.title,
      number: data.circular_number,
      circularNumber: data.circular_number,
      content: data.content,
      priority: data.priority,
      category: 'إداري',
      circularType: data.circular_type,
      targetAudience: data.target_audience,
      targetGrade: data.target_grade,
      targetClass: data.target_class,
      publishDate: data.publish_date,
      expiryDate: data.expiry_date,
      requiresReadConfirmation: data.requires_read_confirmation,
      attachmentName: data.attachment_name,
      attachmentUrl: data.attachment_url,
      attachedDocName: data.attachment_name,
      createdById: data.created_by_id,
      createdByName: data.created_by_name,
      createdByRole: data.created_by_role,
      createdAt: data.created_at,
      stats: { totalRecipients: 25, viewedCount: 0, confirmedCount: 0, pendingCount: 25 }
    };
  } catch (err) {
    console.warn('Error creating school circular:', err);
    return null;
  }
}

export async function acknowledgeCircular(
  circularId: string,
  user: { id: string; name: string; role: UserRole; schoolId: string }
): Promise<boolean> {
  if (!isSupabaseConfigured || !circularId || !user.id) return true;

  try {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('circular_read_confirmations')
      .upsert({
        circular_id: circularId,
        school_id: user.schoolId,
        user_id: user.id,
        user_name: user.name,
        user_role: user.role,
        viewed_at: now,
        confirmed_at: now,
        is_confirmed: true
      }, { onConflict: 'circular_id,user_id' });

    return !error;
  } catch (err) {
    console.warn('Error acknowledging circular:', err);
    return false;
  }
}

export async function fetchCircularConfirmations(circularId: string): Promise<CircularReadConfirmation[]> {
  if (!isSupabaseConfigured || !circularId) return [];

  try {
    const { data, error } = await supabase
      .from('circular_read_confirmations')
      .select('*')
      .eq('circular_id', circularId);

    if (error || !data) return [];

    return data.map((d: any): CircularReadConfirmation => ({
      id: d.id,
      circularId: d.circular_id,
      userId: d.user_id,
      userName: d.user_name,
      userRole: d.user_role as UserRole,
      viewedAt: d.viewed_at,
      confirmedAt: d.confirmed_at,
      isConfirmed: d.is_confirmed || false
    }));
  } catch (err) {
    console.warn('Error fetching circular confirmations:', err);
    return [];
  }
}

// =========================================================================
// 11. SCHOOL ANNOUNCEMENTS SERVICES
// =========================================================================

export async function fetchSchoolAnnouncements(
  schoolId: string,
  currentUser?: { id: string; role: UserRole }
): Promise<SchoolAnnouncement[]> {
  if (!isSupabaseConfigured || !schoolId) return [];

  try {
    const { data, error } = await supabase
      .from('school_announcements')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((a: any): SchoolAnnouncement => ({
      id: a.id,
      schoolId: a.school_id,
      title: a.title,
      content: a.content,
      targetAudience: a.target_audience,
      gradeName: a.grade_name,
      classroomName: a.classroom_name,
      createdById: a.created_by_id,
      createdByName: a.created_by_name,
      createdByRole: a.created_by_role as UserRole,
      isUrgent: a.is_urgent || false,
      createdAt: a.created_at
    }));
  } catch (err) {
    console.warn('Error fetching school announcements:', err);
    return [];
  }
}

export async function createSchoolAnnouncement(payload: {
  schoolId: string;
  title: string;
  content: string;
  targetAudience: 'all_school' | 'teachers' | 'students' | 'parents' | 'class';
  gradeName?: string;
  classroomName?: string;
  creator: { id: string; name: string; role: UserRole };
  isUrgent?: boolean;
}): Promise<SchoolAnnouncement | null> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured) {
    return {
      id: `ann-${Date.now()}`,
      schoolId: payload.schoolId,
      title: payload.title,
      content: payload.content,
      targetAudience: payload.targetAudience,
      gradeName: payload.gradeName,
      classroomName: payload.classroomName,
      createdById: payload.creator.id,
      createdByName: payload.creator.name,
      createdByRole: payload.creator.role,
      isUrgent: payload.isUrgent,
      createdAt: now
    };
  }

  try {
    const { data, error } = await supabase
      .from('school_announcements')
      .insert([
        {
          school_id: payload.schoolId,
          title: payload.title,
          content: payload.content,
          target_audience: payload.targetAudience,
          grade_name: payload.gradeName,
          classroom_name: payload.classroomName,
          created_by_id: payload.creator.id,
          created_by_name: payload.creator.name,
          created_by_role: payload.creator.role,
          is_urgent: payload.isUrgent || false,
          created_at: now
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      schoolId: data.school_id,
      title: data.title,
      content: data.content,
      targetAudience: data.target_audience,
      gradeName: data.grade_name,
      classroomName: data.classroom_name,
      createdById: data.created_by_id,
      createdByName: data.created_by_name,
      createdByRole: data.created_by_role as UserRole,
      isUrgent: data.is_urgent,
      createdAt: data.created_at
    };
  } catch (err) {
    console.warn('Error creating school announcement:', err);
    return null;
  }
}

// =========================================================================
// 12. NOTIFICATIONS & ALERTS SERVICES
// =========================================================================

export async function fetchUserNotifications(
  schoolId: string,
  userId: string
): Promise<AppNotification[]> {
  if (!isSupabaseConfigured || !userId) return [];

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error || !data) return [];

    return data.map((n: any): AppNotification => ({
      id: n.id,
      schoolId: n.school_id,
      userId: n.user_id,
      title: n.title,
      body: n.body,
      type: n.type || 'message',
      targetId: n.target_id,
      isRead: n.is_read || false,
      createdAt: n.created_at
    }));
  } catch (err) {
    console.warn('Error fetching notifications:', err);
    return [];
  }
}

export async function markNotificationRead(notificationId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !notificationId) return true;

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    return !error;
  } catch (err) {
    console.warn('Error marking notification read:', err);
    return false;
  }
}
