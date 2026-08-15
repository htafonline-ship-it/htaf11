import React, { useState, useEffect, useRef } from 'react';
import {
  SupportTicket,
  StudyGroup,
  StudyGroupMessage,
  UserRole,
  StudentProfile,
  ModerationAuditLogItem,
  CurriculumBook,
  HomeworkCitation,
  SchoolConversation,
  DirectMessage,
  AuthUser,
  School as SchoolType
} from '../types';
import { AddHomeworkModal } from './AddHomeworkModal';
import {
  fetchSchoolTickets,
  createSupportTicket,
  addTicketReply,
  updateTicketStatus,
  fetchSchoolConversations,
  createConversation,
  fetchDirectMessages,
  sendDirectMessage,
  fetchSchoolStudyRooms,
  fetchStudyRoomMessages,
  sendStudyRoomMessage,
  deleteStudyRoomMessage,
  fetchModerationAuditLogs,
  createModerationAuditLog,
  uploadMessageAttachment,
  getMessagingSqlMigration,
  markConversationAsRead
} from '../lib/messagingService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  MessageSquare,
  Users,
  PlusCircle,
  Send,
  Trash2,
  ShieldAlert,
  Paperclip,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
  AlertTriangle,
  Search,
  Lock,
  MessageCircle,
  Copy,
  Check,
  Filter,
  User,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  Building,
  Upload,
  RefreshCw,
  Eye,
  Bell,
  Radio,
  CheckCheck,
  X
} from 'lucide-react';

interface MessagingViewProps {
  currentRole: UserRole;
  currentUser?: AuthUser | null;
  currentSchool?: SchoolType | null;
  studentProfile?: StudentProfile;
  tickets?: SupportTicket[];
  studyGroups?: StudyGroup[];
  groupMessages?: StudyGroupMessage[];
  centralBooks?: CurriculumBook[];
  onAddTicket?: (ticket: SupportTicket) => void;
  onAddTicketMessage?: (ticketId: string, text: string, senderRole: UserRole, senderName: string) => void;
  onSendGroupMessage?: (groupId: string, text: string, problemCitation?: any, homeworkCitation?: HomeworkCitation) => void;
  onDeleteGroupMessage?: (messageId: string, deletedBy: string) => void;
  onAddAuditLog?: (log: ModerationAuditLogItem) => void;
}

// Banned words filter list for real-time AI moderation guard
const BANNED_KEYWORDS = ['سباب', 'شتيمة', 'احتيال', 'سرقة', 'غش', 'تنمر', 'مخالف', 'شتيمة2', 'بذيء'];

export const MessagingView: React.FC<MessagingViewProps> = ({
  currentRole,
  currentUser,
  currentSchool,
  studentProfile: initialStudentProfile,
  tickets: propTickets = [],
  studyGroups: propStudyGroups = [],
  groupMessages: propGroupMessages = [],
  centralBooks,
  onAddTicket,
  onAddTicketMessage,
  onSendGroupMessage,
  onDeleteGroupMessage,
  onAddAuditLog
}) => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'groups' | 'direct'>('tickets');

  // School ID for multi-tenant isolation
  const activeSchoolId = currentSchool?.id || currentUser?.schoolId || 'al-namouthajya';
  const effectiveUserName = currentUser?.fullName || initialStudentProfile?.name || 'مستخدم المنصة';
  const effectiveUserId = currentUser?.id || 'usr-default';

  // -------------------------------------------------------------
  // 1. SUPPORT TICKETS STATE
  // -------------------------------------------------------------
  const [ticketsList, setTicketsList] = useState<SupportTicket[]>(propTickets);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [ticketAttachment, setTicketAttachment] = useState<{ file: File; name: string } | null>(null);
  const [isSubmittingTicketReply, setIsSubmittingTicketReply] = useState(false);
  const [ticketSearchQuery, setTicketSearchQuery] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'all' | 'جديد' | 'قيد المعالجة' | 'مكتمل'>('all');

  // New Ticket Modal State
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState<SupportTicket['category']>('استفسار أكاديمي');
  const [newTicketPriority, setNewTicketPriority] = useState<SupportTicket['priority']>('متوسط');
  const [newTicketInitialMsg, setNewTicketInitialMsg] = useState('');
  const [newTicketAttachment, setNewTicketAttachment] = useState<{ file: File; name: string } | null>(null);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);

  // -------------------------------------------------------------
  // 2. PEER STUDY ROOMS STATE
  // -------------------------------------------------------------
  const defaultStudyGroups: StudyGroup[] = [
    {
      id: 'group-1',
      name: 'غرفة مذاكرة العلوم - الثالث المتوسط',
      subject: 'العلوم العامة',
      grade: 'الصف الثالث المتوسط',
      membersCount: 28,
      icon: '🔬',
      description: 'مناقشة دروس الجدول الدوري، التفاعلات الكيميائية، وأسئلة الاختبارات الشهرية.'
    },
    {
      id: 'group-2',
      name: 'نادي الرياضيات والمسائل المتقدمة',
      subject: 'الرياضيات',
      grade: 'الصف الثالث المتوسط',
      membersCount: 34,
      icon: '📐',
      description: 'حل الواجبات والتمارين الرياضية الصعبة وتبادل خطوات الحل النموذجي.'
    },
    {
      id: 'group-3',
      name: 'ملتقى الكيمياء والأحياء العملي',
      subject: 'الأحياء والكيمياء',
      grade: 'الصف الثاني المتوسط',
      membersCount: 19,
      icon: '🧬',
      description: 'مناقشة التجارب المعملية والمجسمات ثلاثية الأبعاد التفاعلية.'
    }
  ];

  const [studyRooms, setStudyRooms] = useState<StudyGroup[]>(
    propStudyGroups.length > 0 ? propStudyGroups : defaultStudyGroups
  );
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup>(
    studyRooms[0] || defaultStudyGroups[0]
  );
  const [studyRoomMessages, setStudyRoomMessages] = useState<StudyGroupMessage[]>(propGroupMessages);
  const [groupMsgText, setGroupMsgText] = useState('');
  const [moderationWarning, setModerationWarning] = useState<string | null>(null);
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [studyAttachment, setStudyAttachment] = useState<{ file: File; name: string } | null>(null);

  // -------------------------------------------------------------
  // 3. DIRECT & ROLE-BASED CONVERSATIONS STATE
  // -------------------------------------------------------------
  const [conversations, setConversations] = useState<SchoolConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<SchoolConversation | null>(null);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [directMsgText, setDirectMsgText] = useState('');
  const [directAttachment, setDirectAttachment] = useState<{ file: File; name: string } | null>(null);
  const [showNewConvModal, setShowNewConvModal] = useState(false);
  const [newConvRole, setNewConvRole] = useState<UserRole>('teacher');
  const [newConvTitle, setNewConvTitle] = useState('');
  const [newConvTargetName, setNewConvTargetName] = useState('أ. عبد العزيز الشمري (معلم العلوم)');
  const [newConvInitialMsg, setNewConvInitialMsg] = useState('');
  const [isCreatingConv, setIsCreatingConv] = useState(false);

  // -------------------------------------------------------------
  // 4. SQL MIGRATION & SYSTEM MODALS & REALTIME NOTIFICATIONS
  // -------------------------------------------------------------
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Incoming realtime toast notification
  const [incomingToast, setIncomingToast] = useState<{
    id: string;
    senderName: string;
    senderRole?: string;
    text: string;
    channelTitle: string;
    type: 'direct' | 'ticket' | 'room';
    targetId: string;
  } | null>(null);

  // Idempotency tracking to prevent duplicate notifications & alerts
  const notifiedMessageIdsRef = useRef<Set<string>>(new Set());

  // Mutable refs to prevent stale closure in Realtime event handlers
  const selectedConversationRef = useRef<SchoolConversation | null>(selectedConversation);
  const selectedTicketRef = useRef<SupportTicket | null>(selectedTicket);
  const selectedGroupRef = useRef<StudyGroup | null>(selectedGroup);
  const activeTabRef = useRef<'tickets' | 'groups' | 'direct'>(activeTab);
  const effectiveUserIdRef = useRef<string>(effectiveUserId);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    selectedTicketRef.current = selectedTicket;
  }, [selectedTicket]);

  useEffect(() => {
    selectedGroupRef.current = selectedGroup;
  }, [selectedGroup]);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    effectiveUserIdRef.current = effectiveUserId;
  }, [effectiveUserId]);

  // Gentle audio chime for incoming messages
  const playNotificationSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio playback permission / safe fallback
    }
  };

  // Auto-dismiss incoming toast after 5.5 seconds
  useEffect(() => {
    if (incomingToast) {
      const timer = setTimeout(() => {
        setIncomingToast(null);
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [incomingToast]);

  const ticketFileInputRef = useRef<HTMLInputElement>(null);
  const replyFileInputRef = useRef<HTMLInputElement>(null);
  const directFileInputRef = useRef<HTMLInputElement>(null);
  const studyFileInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------
  // DATA LOADING & REALTIME SUBSCRIPTIONS
  // -------------------------------------------------------------
  const loadAllData = async () => {
    setIsLoadingData(true);
    try {
      // 1. Tickets
      const dbTickets = await fetchSchoolTickets(activeSchoolId, effectiveUserId, currentRole);
      if (dbTickets.length > 0) {
        setTicketsList(dbTickets);
        if (!selectedTicket || !dbTickets.some(t => t.id === selectedTicket.id)) {
          setSelectedTicket(dbTickets[0]);
        }
        dbTickets.forEach(t => t.messages.forEach(m => notifiedMessageIdsRef.current.add(m.id)));
      } else if (propTickets.length > 0) {
        setTicketsList(propTickets);
        if (!selectedTicket) setSelectedTicket(propTickets[0]);
      }

      // 2. Study Rooms
      const dbRooms = await fetchSchoolStudyRooms(activeSchoolId);
      if (dbRooms.length > 0) {
        setStudyRooms(dbRooms);
        setSelectedGroup(prev => dbRooms.find(r => r.id === prev.id) || dbRooms[0]);
      }

      // 3. Conversations
      const dbConvs = await fetchSchoolConversations(activeSchoolId, effectiveUserId);
      if (dbConvs.length > 0) {
        setConversations(dbConvs);
        if (!selectedConversation || !dbConvs.some(c => c.id === selectedConversation.id)) {
          setSelectedConversation(dbConvs[0]);
          markConversationAsRead(dbConvs[0].id, effectiveUserId, activeSchoolId);
        }
      } else {
        // Fallback default conversation if empty
        const sampleConvs: SchoolConversation[] = [
          {
            id: 'conv-counselor-1',
            schoolId: activeSchoolId,
            conversationType: 'counseling',
            title: 'استشارة فردية مع المرشد الطلابي',
            createdBy: 'counselor-1',
            createdByName: 'أ. خالد التميمي (الموجه الطلابي)',
            createdByRole: 'counselor',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastMessage: 'مرحباً بك، يسعدني تقديم أي توجيه أو دعم أكاديمي ونفسي.',
            lastMessageTime: 'اليوم',
            members: [
              {
                id: 'cm-1',
                conversationId: 'conv-counselor-1',
                userId: effectiveUserId,
                userName: effectiveUserName,
                userRole: currentRole,
                joinedAt: new Date().toISOString(),
                lastReadAt: new Date().toISOString()
              },
              {
                id: 'cm-2',
                conversationId: 'conv-counselor-1',
                userId: 'counselor-1',
                userName: 'أ. خالد التميمي (الموجه الطلابي)',
                userRole: 'counselor',
                joinedAt: new Date().toISOString()
              }
            ]
          },
          {
            id: 'conv-teacher-1',
            schoolId: activeSchoolId,
            conversationType: 'direct',
            title: 'قناة متابعة واجبات العلوم - الأستاذ عبد العزيز',
            createdBy: 'teacher-1',
            createdByName: 'أ. عبد العزيز الشمري',
            createdByRole: 'teacher',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastMessage: 'تم نشر نموذج حل تجربة الكيمياء للمراجعة.',
            lastMessageTime: 'أمس',
            members: [
              {
                id: 'cm-3',
                conversationId: 'conv-teacher-1',
                userId: effectiveUserId,
                userName: effectiveUserName,
                userRole: currentRole,
                joinedAt: new Date().toISOString(),
                lastReadAt: new Date().toISOString()
              }
            ]
          }
        ];
        setConversations(sampleConvs);
        if (!selectedConversation) setSelectedConversation(sampleConvs[0]);
      }
    } catch (err) {
      console.warn('Error loading messaging data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [activeSchoolId, effectiveUserId, currentRole]);

  // Select a conversation and update last_read_at in database & state
  const handleSelectConversation = (conv: SchoolConversation) => {
    setSelectedConversation(conv);
    markConversationAsRead(conv.id, effectiveUserId, activeSchoolId);
    setConversations(prev => prev.map(c => {
      if (c.id === conv.id) {
        const nowIso = new Date().toISOString();
        return {
          ...c,
          members: (c.members || []).map(m => m.userId === effectiveUserId ? { ...m, lastReadAt: nowIso } : m)
        };
      }
      return c;
    }));
  };

  // Helper to check if a conversation has unread messages for current user
  const isConvUnread = (conv: SchoolConversation) => {
    if (selectedConversation?.id === conv.id && activeTab === 'direct') return false;
    const myMember = conv.members?.find(m => m.userId === effectiveUserId);
    if (!myMember) {
      return !!conv.lastMessage && conv.createdBy !== effectiveUserId;
    }
    if (!myMember.lastReadAt) {
      return !!conv.lastMessage && conv.createdBy !== effectiveUserId;
    }
    const myReadTime = new Date(myMember.lastReadAt).getTime();
    const convUpdatedTime = conv.updatedAt ? new Date(conv.updatedAt).getTime() : 0;
    return convUpdatedTime > (myReadTime + 1000);
  };

  // Load direct messages when selected conversation changes & mark as read
  useEffect(() => {
    if (selectedConversation) {
      fetchDirectMessages(selectedConversation.id).then(msgs => {
        if (msgs && msgs.length > 0) {
          setDirectMessages(msgs);
          msgs.forEach(m => notifiedMessageIdsRef.current.add(m.id));
        } else {
          // Default initial greeting if newly created
          setDirectMessages([
            {
              id: `init-${selectedConversation.id}`,
              conversationId: selectedConversation.id,
              senderId: selectedConversation.createdBy,
              senderName: selectedConversation.createdByName || 'المشرف',
              senderRole: selectedConversation.createdByRole || 'teacher',
              text: selectedConversation.lastMessage || 'مرحباً بكم في هذه القناة الرسمية للتواصل المدرسي.',
              timestamp: 'الآن'
            }
          ]);
        }
      });

      // Update last_read_at in Supabase when opening conversation
      markConversationAsRead(selectedConversation.id, effectiveUserId, activeSchoolId);
      setConversations(prev => prev.map(c => {
        if (c.id === selectedConversation.id) {
          const nowIso = new Date().toISOString();
          return {
            ...c,
            members: (c.members || []).map(m => m.userId === effectiveUserId ? { ...m, lastReadAt: nowIso } : m)
          };
        }
        return c;
      }));
    }
  }, [selectedConversation?.id, effectiveUserId, activeSchoolId]);

  // Load study room messages when selected room changes
  useEffect(() => {
    if (selectedGroup) {
      fetchStudyRoomMessages(selectedGroup.id).then(msgs => {
        if (msgs && msgs.length > 0) {
          setStudyRoomMessages(msgs);
          msgs.forEach(m => notifiedMessageIdsRef.current.add(m.id));
        } else {
          const matchedPropMsgs = propGroupMessages.filter(m => m.groupId === selectedGroup.id);
          if (matchedPropMsgs.length > 0) {
            setStudyRoomMessages(matchedPropMsgs);
          }
        }
      });
    }
  }, [selectedGroup?.id, propGroupMessages]);

  // Supabase Realtime Channels setup for real-time synchronization with deduplication
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel(`school_messaging_${activeSchoolId}`)
      // 1. Listen to Conversations updates & new channels
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations', filter: `school_id=eq.${activeSchoolId}` },
        (payload) => {
          const updatedConv = payload.new as any;
          if (!updatedConv || !updatedConv.id) return;

          if (payload.eventType === 'INSERT') {
            setConversations(prev => {
              if (prev.some(c => c.id === updatedConv.id)) return prev;
              return [
                {
                  id: updatedConv.id,
                  schoolId: updatedConv.school_id,
                  conversationType: updatedConv.conversation_type,
                  title: updatedConv.title,
                  createdBy: updatedConv.created_by,
                  createdByName: updatedConv.created_by_name,
                  createdByRole: updatedConv.created_by_role,
                  createdAt: updatedConv.created_at,
                  updatedAt: updatedConv.updated_at,
                  lastMessage: updatedConv.last_message,
                  lastMessageTime: 'الآن',
                  members: []
                },
                ...prev
              ];
            });
          } else if (payload.eventType === 'UPDATE') {
            setConversations(prev => prev.map(c => {
              if (c.id === updatedConv.id) {
                return {
                  ...c,
                  title: updatedConv.title || c.title,
                  lastMessage: updatedConv.last_message || c.lastMessage,
                  lastMessageTime: 'الآن',
                  updatedAt: updatedConv.updated_at || new Date().toISOString()
                };
              }
              return c;
            }));
          }
        }
      )
      // 2. Listen to Support Tickets updates
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'support_tickets', filter: `school_id=eq.${activeSchoolId}` },
        () => {
          fetchSchoolTickets(activeSchoolId, effectiveUserIdRef.current, currentRole).then(data => {
            if (data.length > 0) setTicketsList(data);
          });
        }
      )
      // 3. Listen to Ticket Messages (Real-time reply feed with deduplication)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ticket_messages', filter: `school_id=eq.${activeSchoolId}` },
        (payload) => {
          const newMsg = payload.new as any;
          if (!newMsg || !newMsg.id) return;

          // Deduplication: prevent duplicate processing
          if (notifiedMessageIdsRef.current.has(newMsg.id)) return;
          notifiedMessageIdsRef.current.add(newMsg.id);

          const isCurrentTicket = selectedTicketRef.current?.id === newMsg.ticket_id;
          const currentUserId = effectiveUserIdRef.current;

          if (isCurrentTicket) {
            setSelectedTicket(prev => {
              if (!prev) return prev;
              if (prev.messages.some(m => m.id === newMsg.id)) return prev;
              return {
                ...prev,
                lastUpdated: 'الآن',
                messages: [
                  ...prev.messages,
                  {
                    id: newMsg.id,
                    ticketId: newMsg.ticket_id,
                    senderId: newMsg.sender_id,
                    senderRole: newMsg.sender_role,
                    senderName: newMsg.sender_name,
                    senderAvatar: newMsg.sender_avatar,
                    text: newMsg.text,
                    timestamp: 'الآن',
                    attachmentName: newMsg.attachment_name,
                    attachmentUrl: newMsg.attachment_url
                  }
                ]
              };
            });
          }

          // Update tickets list
          setTicketsList(prev => prev.map(t => {
            if (t.id === newMsg.ticket_id) {
              const alreadyHas = t.messages.some(m => m.id === newMsg.id);
              return {
                ...t,
                lastUpdated: 'الآن',
                messages: alreadyHas ? t.messages : [
                  ...t.messages,
                  {
                    id: newMsg.id,
                    ticketId: newMsg.ticket_id,
                    senderId: newMsg.sender_id,
                    senderRole: newMsg.sender_role,
                    senderName: newMsg.sender_name,
                    text: newMsg.text,
                    timestamp: 'الآن',
                    attachmentName: newMsg.attachment_name,
                    attachmentUrl: newMsg.attachment_url
                  }
                ]
              };
            }
            return t;
          }));

          // Trigger non-repeating toast if from another user and not currently active
          if (newMsg.sender_id !== currentUserId && (!isCurrentTicket || activeTabRef.current !== 'tickets')) {
            playNotificationSound();
            setIncomingToast({
              id: newMsg.id,
              senderName: newMsg.sender_name,
              senderRole: newMsg.sender_role,
              text: newMsg.text,
              channelTitle: `تذكرة استفسار #${newMsg.ticket_id}`,
              type: 'ticket',
              targetId: newMsg.ticket_id
            });
          }
        }
      )
      // 4. Listen to Direct Messages (Real-time chat feed with last_read_at update)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `school_id=eq.${activeSchoolId}` },
        (payload) => {
          const newDm = payload.new as any;
          if (!newDm || !newDm.id) return;

          // Deduplication: prevent duplicate processing
          if (notifiedMessageIdsRef.current.has(newDm.id)) return;
          notifiedMessageIdsRef.current.add(newDm.id);

          const currentUserId = effectiveUserIdRef.current;
          const isCurrentConv = selectedConversationRef.current?.id === newDm.conversation_id;
          const isDirectTab = activeTabRef.current === 'direct';

          // If the message is for the currently open conversation
          if (isCurrentConv) {
            setDirectMessages(prev => {
              if (prev.some(m => m.id === newDm.id)) return prev;
              return [
                ...prev,
                {
                  id: newDm.id,
                  conversationId: newDm.conversation_id,
                  senderId: newDm.sender_id,
                  senderName: newDm.sender_name,
                  senderRole: newDm.sender_role,
                  senderAvatar: newDm.sender_avatar,
                  text: newDm.text,
                  timestamp: 'الآن',
                  attachmentUrl: newDm.attachment_url,
                  attachmentName: newDm.attachment_name,
                  problemCitation: newDm.problem_citation,
                  homeworkCitation: newDm.homework_citation
                }
              ];
            });

            // Automatically mark conversation as read in DB and local state
            markConversationAsRead(newDm.conversation_id, currentUserId, activeSchoolId);
            setConversations(prev => prev.map(c => {
              if (c.id === newDm.conversation_id) {
                const nowIso = new Date().toISOString();
                return {
                  ...c,
                  lastMessage: newDm.text.substring(0, 80),
                  lastMessageTime: 'الآن',
                  updatedAt: nowIso,
                  members: (c.members || []).map(m => m.userId === currentUserId ? { ...m, lastReadAt: nowIso } : m)
                };
              }
              return c;
            }));
          } else {
            // Message in a different conversation: update last message
            setConversations(prev => prev.map(c => {
              if (c.id === newDm.conversation_id) {
                return {
                  ...c,
                  lastMessage: newDm.text.substring(0, 80),
                  lastMessageTime: 'الآن',
                  updatedAt: new Date().toISOString()
                };
              }
              return c;
            }));

            // If not sent by current user, trigger non-repeating toast & soft chime
            if (newDm.sender_id !== currentUserId) {
              playNotificationSound();
              setIncomingToast({
                id: newDm.id,
                senderName: newDm.sender_name,
                senderRole: newDm.sender_role,
                text: newDm.text,
                channelTitle: 'محادثة مباشرة',
                type: 'direct',
                targetId: newDm.conversation_id
              });
            }
          }
        }
      )
      // 5. Listen to Study Room Messages (Real-time study room feed & deletion sync)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'study_room_messages', filter: `school_id=eq.${activeSchoolId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newSrm = payload.new as any;
            if (!newSrm || !newSrm.id) return;
            if (notifiedMessageIdsRef.current.has(newSrm.id)) return;
            notifiedMessageIdsRef.current.add(newSrm.id);

            const isCurrentRoom = selectedGroupRef.current?.id === newSrm.room_id;
            const currentUserId = effectiveUserIdRef.current;

            if (isCurrentRoom) {
              setStudyRoomMessages(prev => {
                if (prev.some(m => m.id === newSrm.id)) return prev;
                return [
                  ...prev,
                  {
                    id: newSrm.id,
                    groupId: newSrm.room_id,
                    schoolId: newSrm.school_id,
                    senderId: newSrm.sender_id,
                    senderName: newSrm.sender_name,
                    senderRole: newSrm.sender_role,
                    senderAvatar: newSrm.sender_avatar || '🧑‍🎓',
                    text: newSrm.text,
                    timestamp: 'الآن',
                    isDeleted: newSrm.is_deleted,
                    deletedBy: newSrm.deleted_by,
                    isFlagged: newSrm.is_flagged,
                    problemCitation: newSrm.problem_citation,
                    homeworkCitation: newSrm.homework_citation,
                    attachmentUrl: newSrm.attachment_url,
                    attachmentName: newSrm.attachment_name
                  }
                ];
              });
            } else if (newSrm.sender_id !== currentUserId && activeTabRef.current !== 'groups') {
              playNotificationSound();
              setIncomingToast({
                id: newSrm.id,
                senderName: newSrm.sender_name,
                senderRole: newSrm.sender_role,
                text: newSrm.text,
                channelTitle: 'غرفة المذاكرة الجماعية',
                type: 'room',
                targetId: newSrm.room_id
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedSrm = payload.new as any;
            if (updatedSrm && updatedSrm.is_deleted) {
              setStudyRoomMessages(prev => prev.map(m => {
                if (m.id === updatedSrm.id) {
                  return { ...m, isDeleted: true, deletedBy: updatedSrm.deleted_by || 'المشرف' };
                }
                return m;
              }));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeSchoolId]);

  // -------------------------------------------------------------
  // HANDLERS: SUPPORT TICKETS
  // -------------------------------------------------------------
  const handleCreateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim() || !newTicketInitialMsg.trim()) return;

    setIsCreatingTicket(true);
    let uploadedAttUrl: string | undefined;
    let uploadedAttName: string | undefined;

    if (newTicketAttachment) {
      const uploadRes = await uploadMessageAttachment(newTicketAttachment.file, activeSchoolId);
      if (uploadRes) {
        uploadedAttUrl = uploadRes.url;
        uploadedAttName = uploadRes.name;
      }
    }

    const created = await createSupportTicket({
      schoolId: activeSchoolId,
      userId: effectiveUserId,
      studentName: effectiveUserName,
      grade: initialStudentProfile?.grade || 'الصف الثالث المتوسط',
      category: newTicketCategory,
      subject: newTicketSubject,
      priority: newTicketPriority,
      initialMessage: newTicketInitialMsg,
      senderRole: currentRole,
      attachmentName: uploadedAttName,
      attachmentUrl: uploadedAttUrl
    });

    setIsCreatingTicket(false);

    if (created) {
      setTicketsList(prev => [created, ...prev]);
      setSelectedTicket(created);
      if (onAddTicket) onAddTicket(created);
    }

    setShowNewTicketModal(false);
    setNewTicketSubject('');
    setNewTicketInitialMsg('');
    setNewTicketAttachment(null);
  };

  const handleSendTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || (!ticketReplyText.trim() && !ticketAttachment)) return;

    setIsSubmittingTicketReply(true);
    let uploadedAttUrl: string | undefined;
    let uploadedAttName: string | undefined;

    if (ticketAttachment) {
      const uploadRes = await uploadMessageAttachment(ticketAttachment.file, activeSchoolId);
      if (uploadRes) {
        uploadedAttUrl = uploadRes.url;
        uploadedAttName = uploadRes.name;
      }
    }

    const senderDisplayName =
      currentRole === 'student'
        ? effectiveUserName
        : currentRole === 'admin' || currentRole === 'school_admin' || currentRole === 'principal'
        ? `إدارة المدرسة - ${effectiveUserName}`
        : currentRole === 'counselor'
        ? `الموجه الطلابي - ${effectiveUserName}`
        : currentRole === 'parent'
        ? `ولي الأمر - ${effectiveUserName}`
        : `المعلم - ${effectiveUserName}`;

    const newReply = await addTicketReply({
      ticketId: selectedTicket.id,
      schoolId: activeSchoolId,
      senderId: effectiveUserId,
      senderName: senderDisplayName,
      senderRole: currentRole,
      text: ticketReplyText,
      attachmentName: uploadedAttName,
      attachmentUrl: uploadedAttUrl
    });

    setIsSubmittingTicketReply(false);

    if (newReply) {
      const updatedTicket: SupportTicket = {
        ...selectedTicket,
        lastUpdated: 'الآن',
        status: currentRole !== 'student' ? 'قيد المعالجة' : selectedTicket.status,
        messages: [...selectedTicket.messages, newReply]
      };

      setSelectedTicket(updatedTicket);
      setTicketsList(prev => prev.map(t => (t.id === selectedTicket.id ? updatedTicket : t)));

      if (onAddTicketMessage) {
        onAddTicketMessage(selectedTicket.id, ticketReplyText, currentRole, senderDisplayName);
      }
    }

    setTicketReplyText('');
    setTicketAttachment(null);
  };

  const handleTicketStatusChange = async (newStatus: SupportTicket['status']) => {
    if (!selectedTicket) return;
    await updateTicketStatus(selectedTicket.id, newStatus);
    const updated = { ...selectedTicket, status: newStatus, lastUpdated: 'الآن' };
    setSelectedTicket(updated);
    setTicketsList(prev => prev.map(t => (t.id === selectedTicket.id ? updated : t)));
  };

  // -------------------------------------------------------------
  // HANDLERS: DIRECT CONVERSATIONS
  // -------------------------------------------------------------
  const handleCreateConversationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConvTitle.trim()) return;

    setIsCreatingConv(true);

    const conv = await createConversation({
      schoolId: activeSchoolId,
      conversationType: newConvRole === 'counselor' ? 'counseling' : newConvRole === 'parent' ? 'parent_teacher' : 'direct',
      title: newConvTitle,
      createdBy: effectiveUserId,
      createdByName: effectiveUserName,
      createdByRole: currentRole,
      members: [
        {
          userId: effectiveUserId,
          userName: effectiveUserName,
          userRole: currentRole
        },
        {
          userId: `usr-${newConvRole}-target`,
          userName: newConvTargetName,
          userRole: newConvRole
        }
      ],
      initialMessage: newConvInitialMsg || 'السلام عليكم ورحمة الله وبركاته، تم فتح قناة التواصل الرسمية.'
    });

    setIsCreatingConv(false);

    if (conv) {
      setConversations(prev => [conv, ...prev]);
      setSelectedConversation(conv);
      setShowNewConvModal(false);
      setNewConvTitle('');
      setNewConvInitialMsg('');
    }
  };

  const handleSendDirectMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || (!directMsgText.trim() && !directAttachment)) return;

    // AI Moderation check
    const containsBanned = BANNED_KEYWORDS.some(w => directMsgText.includes(w));
    if (containsBanned) {
      setModerationWarning('عفواً، تم رصد محتوى غير لائق بقواعد الأمان المدرسي. تم حظر الإرسال.');
      await createModerationAuditLog({
        schoolId: activeSchoolId,
        actorName: effectiveUserName,
        actorRole: currentRole,
        action: 'تنبيه فلترة آلية',
        targetUser: selectedConversation.title,
        details: `محاولة إرسال محتوى مخالف في محادثة ${selectedConversation.title}: "${directMsgText.substring(0, 30)}..."`,
        severity: 'عالي'
      });
      return;
    }

    setModerationWarning(null);
    let attUrl: string | undefined;
    let attName: string | undefined;

    if (directAttachment) {
      const up = await uploadMessageAttachment(directAttachment.file, activeSchoolId);
      if (up) {
        attUrl = up.url;
        attName = up.name;
      }
    }

    const sent = await sendDirectMessage({
      conversationId: selectedConversation.id,
      schoolId: activeSchoolId,
      senderId: effectiveUserId,
      senderName: effectiveUserName,
      senderRole: currentRole,
      text: directMsgText,
      attachmentUrl: attUrl,
      attachmentName: attName
    });

    if (sent) {
      setDirectMessages(prev => [...prev, sent]);
      setConversations(prev =>
        prev.map(c =>
          c.id === selectedConversation.id
            ? { ...c, lastMessage: directMsgText, lastMessageTime: 'الآن', updatedAt: new Date().toISOString() }
            : c
        )
      );
    }

    setDirectMsgText('');
    setDirectAttachment(null);
  };

  // -------------------------------------------------------------
  // HANDLERS: STUDY ROOMS & AI CONTENT GUARD
  // -------------------------------------------------------------
  const handleSendGroupMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupMsgText.trim() && !studyAttachment) return;

    // AI Content Moderation Guard
    const containsBanned = BANNED_KEYWORDS.some(word => groupMsgText.includes(word));

    if (containsBanned) {
      setModerationWarning('عفواً، تم رصد محتوى غير لائق أو مخالف بقواعد الأمان الرقمي المدرسي. تم حظر النشر وإشعار المشرف.');

      const auditLogItem: ModerationAuditLogItem = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        actorName: 'نظام الفلترة الآلي (AI Content Guard)',
        actorRole: 'school_admin',
        action: 'تنبيه فلترة آلية',
        targetUser: effectiveUserName,
        details: `محاولة نشر محتوى مخالف في ${selectedGroup.name}: "${groupMsgText.substring(0, 30)}..."`,
        severity: 'عالي'
      };

      await createModerationAuditLog({
        schoolId: activeSchoolId,
        actorName: auditLogItem.actorName,
        actorRole: 'school_admin',
        action: auditLogItem.action,
        targetUser: auditLogItem.targetUser,
        details: auditLogItem.details,
        severity: auditLogItem.severity
      });

      if (onAddAuditLog) onAddAuditLog(auditLogItem);
      return;
    }

    setModerationWarning(null);

    let attUrl: string | undefined;
    let attName: string | undefined;
    if (studyAttachment) {
      const up = await uploadMessageAttachment(studyAttachment.file, activeSchoolId);
      if (up) {
        attUrl = up.url;
        attName = up.name;
      }
    }

    const sent = await sendStudyRoomMessage({
      roomId: selectedGroup.id,
      schoolId: activeSchoolId,
      senderId: effectiveUserId,
      senderName: currentRole === 'student' ? effectiveUserName : `المعلم ${effectiveUserName}`,
      senderRole: currentRole,
      senderAvatar: currentRole === 'student' ? '🧑‍🎓' : '👨‍🏫',
      text: groupMsgText,
      attachmentUrl: attUrl,
      attachmentName: attName
    });

    if (sent) {
      setStudyRoomMessages(prev => [...prev, sent]);
      if (onSendGroupMessage) {
        onSendGroupMessage(selectedGroup.id, groupMsgText);
      }
    }

    setGroupMsgText('');
    setStudyAttachment(null);
  };

  const handleHomeworkSubmit = async (citation: HomeworkCitation) => {
    const sent = await sendStudyRoomMessage({
      roomId: selectedGroup.id,
      schoolId: activeSchoolId,
      senderId: effectiveUserId,
      senderName: currentRole === 'student' ? effectiveUserName : `المعلم ${effectiveUserName}`,
      senderRole: currentRole,
      senderAvatar: currentRole === 'student' ? '🧑‍🎓' : '👨‍🏫',
      text: `📌 واجب دراسي جديد: ${citation.title}`,
      homeworkCitation: citation
    });

    if (sent) {
      setStudyRoomMessages(prev => [...prev, sent]);
    }
    setShowHomeworkModal(false);
  };

  const handleDeleteMessage = async (messageId: string) => {
    const actor = currentRole === 'admin' || currentRole === 'principal' ? 'المشرف الإداري' : effectiveUserName;
    await deleteStudyRoomMessage(messageId, actor, activeSchoolId);

    setStudyRoomMessages(prev =>
      prev.map(m => (m.id === messageId ? { ...m, isDeleted: true, deletedBy: actor } : m))
    );

    if (onDeleteGroupMessage) {
      onDeleteGroupMessage(messageId, actor);
    }
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(getMessagingSqlMigration());
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Filtered tickets
  const filteredTickets = ticketsList.filter(t => {
    const matchesFilter = ticketStatusFilter === 'all' || t.status === ticketStatusFilter;
    const matchesSearch =
      ticketSearchQuery === '' ||
      t.subject.toLowerCase().includes(ticketSearchQuery.toLowerCase()) ||
      t.studentName.toLowerCase().includes(ticketSearchQuery.toLowerCase()) ||
      (t.ticketNumber && t.ticketNumber.toLowerCase().includes(ticketSearchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-blue-500/30 shadow-xl shadow-blue-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30 shadow-inner">
            <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
            <span>نظام التواصل المدرسي والرقابة الآمنة</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white">
            التواصل المدرسي، التذاكر، وغرف المذاكرة
          </h2>

          <p className="text-blue-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
            منظومة متكاملة للتواصل الرسمي بين الطالب، ولي الأمر، المعلم، والإدارة المدرسية، مع تذاكر استفسارات رسمية وغرف مذاكرة جماعية خاضعة للذكاء الاصطناعي والأمان الرقمي.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-blue-200">
            <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
              المدرسة: <strong>{currentSchool?.name || 'مدرسة هتاف النموذجية'}</strong>
            </span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
              الحساب: <strong>{effectiveUserName}</strong> ({currentRole === 'student' ? 'طالب' : currentRole === 'teacher' ? 'معلم' : currentRole === 'counselor' ? 'مرشد طلابي' : currentRole === 'parent' ? 'ولي أمر' : 'إدارة'})
            </span>
          </div>
        </div>

        {/* Top Controls & Tab Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 relative z-10 w-full md:w-auto">
          {/* Tab Switcher */}
          <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 flex flex-wrap items-center gap-1">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-3 sm:px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 ${
                activeTab === 'tickets'
                  ? 'bg-white text-blue-900 shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              <span>التذاكر الرسمية ({ticketsList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('direct')}
              className={`px-3 sm:px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 relative ${
                activeTab === 'direct'
                  ? 'bg-white text-indigo-900 shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <MessageCircle className="w-4 h-4 text-indigo-600" />
              <span>المحادثات المباشرة ({conversations.length})</span>
              {conversations.some(c => isConvUnread(c)) && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('groups')}
              className={`px-3 sm:px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 ${
                activeTab === 'groups'
                  ? 'bg-white text-blue-900 shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-600" />
              <span>غرف المذاكرة ({studyRooms.length})</span>
            </button>
          </div>

          {/* SQL Migration & Refresh */}
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={loadAllData}
              title="تحديث البيانات"
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setShowSqlModal(true)}
              className="px-3 py-2.5 bg-slate-950/50 hover:bg-slate-950 text-amber-300 text-xs font-bold rounded-xl border border-amber-400/30 transition flex items-center gap-1.5 shadow-sm"
              title="عرض كود SQL لإنشاء جداول المحادثات في Supabase"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">كود SQL للجداول</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB A: SUPPORT TICKETS & ADMINISTRATIVE INQUIRIES                         */}
      {/* ========================================================================= */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Tickets List */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>تذاكر الاستفسار والتواصل ({filteredTickets.length})</span>
              </h3>

              <button
                onClick={() => setShowNewTicketModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5 transition shadow-blue-500/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>تكت جديد</span>
              </button>
            </div>

            {/* Search & Status Filter */}
            <div className="space-y-2 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="relative">
                <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={ticketSearchQuery}
                  onChange={(e) => setTicketSearchQuery(e.target.value)}
                  placeholder="بحث برقم التكت أو العنوان..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-1 text-[11px] font-bold">
                <span className="text-slate-400 text-[10px] me-1">الحالة:</span>
                {(['all', 'جديد', 'قيد المعالجة', 'مكتمل'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setTicketStatusFilter(st)}
                    className={`px-2 py-1 rounded-lg transition ${
                      ticketStatusFilter === st
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'all' ? 'الكل' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Ticket Cards */}
            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {filteredTickets.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200 text-xs">
                  لا توجد تذاكر مطابقة لخيارات البحث الحالية.
                </div>
              ) : (
                filteredTickets.map((tkt) => {
                  const isSelected = selectedTicket?.id === tkt.id;

                  return (
                    <div
                      key={tkt.id}
                      onClick={() => setSelectedTicket(tkt)}
                      className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 relative ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-800 shadow-xl'
                          : 'bg-white text-slate-900 border-slate-200/80 hover:border-blue-300 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            tkt.status === 'مكتمل'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : tkt.status === 'قيد المعالجة'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {tkt.status}
                        </span>
                        <span className={`text-[10px] font-mono ${isSelected ? 'text-blue-300' : 'text-slate-400'}`}>
                          {tkt.ticketNumber || tkt.id}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-xs leading-snug line-clamp-1">{tkt.subject}</h4>

                      <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100/10">
                        <span className={isSelected ? 'text-slate-300' : 'text-slate-500'}>{tkt.category}</span>
                        <span className={isSelected ? 'text-amber-300 font-bold' : 'text-blue-600 font-bold'}>
                          {tkt.studentName}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Selected Ticket Chat & Actions */}
          <div className="lg:col-span-8">
            {selectedTicket ? (
              <div className="bg-white rounded-3xl p-6 shadow-sm shadow-slate-200/50 border border-slate-200/80 space-y-6 flex flex-col min-h-[560px]">
                {/* Ticket Header */}
                <div className="border-b border-slate-100 pb-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">
                        {selectedTicket.category}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        الأولوية: <strong>{selectedTicket.priority}</strong>
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          selectedTicket.status === 'مكتمل'
                            ? 'bg-emerald-100 text-emerald-800'
                            : selectedTicket.status === 'قيد المعالجة'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {selectedTicket.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Status Changing controls for staff */}
                      {['admin', 'platform_admin', 'school_admin', 'principal', 'counselor'].includes(currentRole) && (
                        <select
                          value={selectedTicket.status}
                          onChange={(e) => handleTicketStatusChange(e.target.value as any)}
                          className="text-[11px] bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 font-bold outline-none"
                        >
                          <option value="جديد">حالة: جديد</option>
                          <option value="قيد المعالجة">حالة: قيد المعالجة</option>
                          <option value="مكتمل">حالة: مكتمل</option>
                          <option value="مغلق">حالة: مغلق</option>
                        </select>
                      )}

                      <div className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {selectedTicket.ticketNumber || selectedTicket.id}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-slate-900">{selectedTicket.subject}</h3>
                  <div className="text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
                    <span>مرسل التكت: <strong>{selectedTicket.studentName}</strong> ({selectedTicket.grade})</span>
                    <span>تاريخ الإنشاء: {selectedTicket.createdAt}</span>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 space-y-4 overflow-y-auto max-h-[360px] pr-2">
                  {selectedTicket.messages.map((msg) => {
                    const isFromMe = msg.senderRole === currentRole;

                    return (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-2xl max-w-xl space-y-1.5 ${
                          isFromMe
                            ? 'ms-auto bg-blue-600 text-white rounded-bl-none shadow-sm'
                            : 'me-auto bg-slate-100 text-slate-800 rounded-br-none border border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 text-[10px] opacity-90 font-bold">
                          <span>{msg.senderName}</span>
                          <span>{msg.timestamp}</span>
                        </div>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                        {/* Attachment Display */}
                        {msg.attachmentName && (
                          <div className="mt-2 bg-black/10 backdrop-blur-sm p-2.5 rounded-xl flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 truncate">
                              <Paperclip className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate font-bold text-[11px]">{msg.attachmentName}</span>
                            </div>
                            {msg.attachmentUrl && (
                              <a
                                href={msg.attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="underline text-[10px] shrink-0 font-extrabold ms-2 hover:text-amber-300"
                              >
                                معاينة / تحميل
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendTicketReply} className="pt-4 border-t border-slate-100 space-y-2">
                  {ticketAttachment && (
                    <div className="bg-blue-50 border border-blue-200 p-2 rounded-xl text-xs flex items-center justify-between text-blue-900">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-bold truncate max-w-xs">{ticketAttachment.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTicketAttachment(null)}
                        className="text-rose-500 font-bold text-xs hover:text-rose-700"
                      >
                        ✕ إزالة
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2 sm:gap-3">
                    <input
                      type="file"
                      ref={replyFileInputRef}
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setTicketAttachment({ file: e.target.files[0], name: e.target.files[0].name });
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => replyFileInputRef.current?.click()}
                      className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition shrink-0"
                      title="إرفاق مستند أو صورة"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    <input
                      type="text"
                      value={ticketReplyText}
                      onChange={(e) => setTicketReplyText(e.target.value)}
                      placeholder="اكتب ردك أو استفسارك هنا..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                      type="submit"
                      disabled={isSubmittingTicketReply}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-sm transition shrink-0"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmittingTicketReply ? 'جاري الإرسال...' : 'إرسال الرد'}</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-3xl p-16 text-center text-slate-400 border border-slate-200 flex flex-col items-center justify-center space-y-3">
                <FileText className="w-12 h-12 text-slate-300" />
                <p className="text-sm font-bold">اختر تكت استفسار لمشاهدة التفاصيل والردود المتبادلة</p>
                <button
                  onClick={() => setShowNewTicketModal(true)}
                  className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  فتح استفسار جديد
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB B: DIRECT & ROLE-BASED CHANNELS (STUDENT, PARENT, TEACHER, COUNSELOR) */}
      {/* ========================================================================= */}
      {activeTab === 'direct' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Conversations List */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-indigo-600" />
                <span>قنوات التواصل الرسمية ({conversations.length})</span>
              </h3>

              <button
                onClick={() => setShowNewConvModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>بدء محادثة</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {conversations.map((conv) => {
                const isSelected = selectedConversation?.id === conv.id;

                const getRoleBadge = (type: string) => {
                  switch (type) {
                    case 'counseling':
                      return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">إرشاد طلابي</span>;
                    case 'parent_teacher':
                      return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">ولي أمر ومعلم</span>;
                    case 'administrative':
                      return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">شؤون الطلاب</span>;
                    default:
                      return <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">مباشر</span>;
                  }
                };

                const unread = isConvUnread(conv);

                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 relative ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-800 shadow-xl'
                        : unread
                        ? 'bg-indigo-50/70 text-slate-900 border-indigo-200 hover:border-indigo-400 shadow-sm ring-1 ring-indigo-300/40'
                        : 'bg-white text-slate-900 border-slate-200 hover:border-indigo-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {getRoleBadge(conv.conversationType)}
                        {unread && !isSelected && (
                          <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse flex items-center gap-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                            <span>جديد</span>
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                        {conv.lastMessageTime || 'الآن'}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs leading-snug line-clamp-1">{conv.title}</h4>

                    <p className={`text-[11px] line-clamp-1 ${isSelected ? 'text-slate-300' : unread ? 'text-indigo-950 font-bold' : 'text-slate-500'}`}>
                      {conv.lastMessage || 'لا توجد رسائل سابقة'}
                    </p>

                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100/10">
                      <span className={isSelected ? 'text-indigo-300' : 'text-indigo-600'}>
                        {conv.createdByName || 'المشرف'}
                      </span>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold">
                          <CheckCheck className="w-3 h-3" />
                          <span>مقروءة</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Direct Messages Feed */}
          <div className="lg:col-span-8">
            {selectedConversation ? (
              <div className="bg-white rounded-3xl p-6 shadow-sm shadow-slate-200/50 border border-slate-200/80 space-y-6 flex flex-col min-h-[560px]">
                {/* Conversation Header */}
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <h3 className="text-base font-black text-slate-900">{selectedConversation.title}</h3>
                    </div>
                    <p className="text-xs text-slate-500">
                      القناة الرسمية للتواصل بين {selectedConversation.createdByName || 'المشرف'} والمستخدمين المعتمدين
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-200">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span>محادثة موثقة ومشفرة</span>
                  </div>
                </div>

                {/* Moderation Warning if triggered */}
                {moderationWarning && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2 animate-shake">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{moderationWarning}</span>
                  </div>
                )}

                {/* Messages List */}
                <div className="flex-1 space-y-4 overflow-y-auto max-h-[360px] pr-2">
                  {directMessages.map((msg) => {
                    const isFromMe = msg.senderId === effectiveUserId || msg.senderRole === currentRole;

                    return (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-2xl max-w-xl space-y-1.5 ${
                          isFromMe
                            ? 'ms-auto bg-indigo-600 text-white rounded-bl-none shadow-sm'
                            : 'me-auto bg-slate-100 text-slate-800 rounded-br-none border border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 text-[10px] opacity-90 font-bold">
                          <span>{msg.senderName}</span>
                          <span>{msg.timestamp}</span>
                        </div>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                        {/* Attachment Link */}
                        {msg.attachmentName && (
                          <div className="mt-2 bg-black/10 backdrop-blur-sm p-2 rounded-xl flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 truncate">
                              <Paperclip className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate font-bold text-[11px]">{msg.attachmentName}</span>
                            </div>
                            {msg.attachmentUrl && (
                              <a
                                href={msg.attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="underline text-[10px] shrink-0 font-extrabold ms-2 hover:text-amber-300"
                              >
                                معاينة
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Direct Message Input */}
                <form onSubmit={handleSendDirectMessageSubmit} className="pt-4 border-t border-slate-100 space-y-2">
                  {directAttachment && (
                    <div className="bg-indigo-50 border border-indigo-200 p-2 rounded-xl text-xs flex items-center justify-between text-indigo-900">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="font-bold truncate max-w-xs">{directAttachment.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDirectAttachment(null)}
                        className="text-rose-500 font-bold text-xs hover:text-rose-700"
                      >
                        ✕ إزالة
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2 sm:gap-3">
                    <input
                      type="file"
                      ref={directFileInputRef}
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setDirectAttachment({ file: e.target.files[0], name: e.target.files[0].name });
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => directFileInputRef.current?.click()}
                      className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition shrink-0"
                      title="إرفاق ملف"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    <input
                      type="text"
                      value={directMsgText}
                      onChange={(e) => {
                        setDirectMsgText(e.target.value);
                        if (moderationWarning) setModerationWarning(null);
                      }}
                      placeholder="اكتب رسالتك المباشرة هنا..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-sm transition shrink-0"
                    >
                      <Send className="w-4 h-4" />
                      <span>إرسال</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-3xl p-16 text-center text-slate-400 border border-slate-200 flex flex-col items-center justify-center space-y-3">
                <MessageCircle className="w-12 h-12 text-slate-300" />
                <p className="text-sm font-bold">اختر محادثة مباشرة أو أنشئ قناة تواصل جديدة</p>
                <button
                  onClick={() => setShowNewConvModal(true)}
                  className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  بدء محادثة رسمية
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB C: PEER STUDY ROOMS (غرف المذاكرة الجماعية)                             */}
      {/* ========================================================================= */}
      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Study Groups List */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>غرف المذاكرة الجماعية ({studyRooms.length})</span>
            </h3>

            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {studyRooms.map((grp) => {
                const isSelected = selectedGroup.id === grp.id;

                return (
                  <div
                    key={grp.id}
                    onClick={() => setSelectedGroup(grp)}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-800 shadow-xl'
                        : 'bg-white text-slate-900 border-slate-200 hover:border-indigo-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 text-2xl flex items-center justify-center shrink-0">
                        {grp.icon}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs">{grp.name}</h4>
                        <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {grp.grade}
                        </p>
                        <span className="text-[10px] font-bold text-indigo-400">
                          👥 {grp.membersCount} طالب نشط
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Study Room Chat Feed */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl p-6 shadow-sm shadow-slate-200/50 border border-slate-200/80 space-y-6 flex flex-col min-h-[560px]">
              {/* Group Room Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedGroup.icon}</span>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{selectedGroup.name}</h3>
                    <p className="text-xs text-slate-500">{selectedGroup.description}</p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-200">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>غرفة آمنة ومراقبة آلياً</span>
                </div>
              </div>

              {/* Warning Banner if blocked */}
              {moderationWarning && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2 animate-shake">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{moderationWarning}</span>
                </div>
              )}

              {/* Messages List */}
              <div className="flex-1 space-y-4 overflow-y-auto max-h-[380px] pr-2">
                {studyRoomMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-2xl border transition space-y-2 relative group ${
                      msg.isDeleted
                        ? 'bg-slate-100 text-slate-400 border-slate-200/60'
                        : 'bg-slate-50/80 border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{msg.senderAvatar || '🧑‍🎓'}</span>
                        <span className="text-xs font-extrabold text-slate-900">{msg.senderName}</span>
                        {msg.senderRole === 'teacher' && (
                          <span className="bg-indigo-100 text-indigo-900 text-[10px] font-bold px-2 py-0.5 rounded">
                            معلم
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold">{msg.timestamp}</span>

                        {/* Moderation Controls: Delete / Hide Message */}
                        {!msg.isDeleted && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            title="حذف الرسالة مع توثيق السجل الرقابي"
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {msg.isDeleted ? (
                      <p className="text-xs italic text-slate-400 font-semibold">
                        (تم حذف هذه الرسالة بواسطة {msg.deletedBy || 'المشرف الإداري'})
                      </p>
                    ) : (
                      <>
                        <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                        {/* Problem Citation */}
                        {msg.problemCitation && (
                          <div className="bg-blue-50/80 border border-blue-200/80 p-3 rounded-xl space-y-1 mt-2">
                            <div className="text-[10px] font-bold text-blue-800 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              <span>مسألة من كتاب: {msg.problemCitation.bookName} (ص {msg.problemCitation.page})</span>
                            </div>
                            <div className="text-xs font-bold text-slate-800">{msg.problemCitation.question}</div>
                            <div className="text-xs text-emerald-700 font-black">النتيجة: {msg.problemCitation.finalAnswer}</div>
                          </div>
                        )}

                        {/* Homework Citation Card */}
                        {msg.homeworkCitation && (
                          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-4 rounded-2xl space-y-3 mt-2 border border-indigo-500/40 shadow-lg">
                            <div className="flex items-center justify-between border-b border-indigo-800/60 pb-2">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-amber-400" />
                                <span className="text-xs font-black text-amber-300">{msg.homeworkCitation.title}</span>
                              </div>
                              <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 px-2.5 py-0.5 rounded-full">
                                {msg.homeworkCitation.sourceType === 'curriculum' ? '📚 من المقرر الوزاري' : '🌐 موضوع خارجي'}
                              </span>
                            </div>

                            <div className="text-xs text-slate-200 space-y-1">
                              {msg.homeworkCitation.bookName && (
                                <p className="text-[11px] font-semibold text-slate-300">
                                  الكتاب: <span className="text-white">{msg.homeworkCitation.bookName}</span> | الدرس: <span className="text-emerald-300">{msg.homeworkCitation.lessonName}</span>
                                </p>
                              )}
                              <p className="text-xs text-slate-200">{msg.homeworkCitation.description}</p>
                            </div>

                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 pt-1">
                              <span className="text-amber-300">⭐ الدرجة: {msg.homeworkCitation.totalPoints} درجات</span>
                              <span className="text-slate-400">📅 التسليم: {msg.homeworkCitation.dueDate}</span>
                            </div>
                          </div>
                        )}

                        {/* Attachment */}
                        {msg.attachmentName && (
                          <div className="mt-2 bg-slate-200/60 p-2.5 rounded-xl flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 truncate">
                              <Paperclip className="w-3.5 h-3.5 shrink-0 text-slate-600" />
                              <span className="truncate font-bold text-[11px] text-slate-800">{msg.attachmentName}</span>
                            </div>
                            {msg.attachmentUrl && (
                              <a
                                href={msg.attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="underline text-[10px] shrink-0 font-extrabold ms-2 text-indigo-600 hover:text-indigo-800"
                              >
                                تحميل
                              </a>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSendGroupMessageSubmit} className="pt-4 border-t border-slate-100 space-y-2">
                {studyAttachment && (
                  <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-xl text-xs flex items-center justify-between text-emerald-900">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-bold truncate max-w-xs">{studyAttachment.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStudyAttachment(null)}
                      className="text-rose-500 font-bold text-xs hover:text-rose-700"
                    >
                      ✕ إزالة
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setShowHomeworkModal(true)}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-3 rounded-2xl text-xs flex items-center gap-1.5 border border-indigo-200 transition shrink-0"
                    title="إضافة واجب دراسي (يدوي أو بالذكاء الاصطناعي)"
                  >
                    <PlusCircle className="w-4 h-4 text-indigo-600" />
                    <span className="hidden sm:inline">إضافة واجب</span>
                  </button>

                  <input
                    type="file"
                    ref={studyFileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setStudyAttachment({ file: e.target.files[0], name: e.target.files[0].name });
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => studyFileInputRef.current?.click()}
                    className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition shrink-0"
                    title="مرفق"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={groupMsgText}
                    onChange={(e) => {
                      setGroupMsgText(e.target.value);
                      if (moderationWarning) setModerationWarning(null);
                    }}
                    placeholder="شارِك سؤالك، فكرتك، أو مناقشتك مع الزملاء..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-sm transition shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span>نشر</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS: 1. NEW TICKET MODAL                                               */}
      {/* ========================================================================= */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>تقديم تكت استفسار جديد للإدارة المدرسية</span>
              </h3>
              <button
                onClick={() => setShowNewTicketModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">تصنيف الاستفسار:</label>
                <select
                  value={newTicketCategory}
                  onChange={(e) => setNewTicketCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-xs"
                >
                  <option value="استفسار أكاديمي">استفسار أكاديمي</option>
                  <option value="طلب مستندات رسمية">طلب مستندات رسمية (إثبات طالب/شهادة)</option>
                  <option value="إرشاد نفسي وتربوي">إرشاد نفسي وتربوي</option>
                  <option value="شكوى/اقتراح">شكوى أو اقتراح تحسين</option>
                  <option value="الدعم الفني والمنصة">الدعم الفني والمنصة</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">مستوى الأولوية:</label>
                <select
                  value={newTicketPriority}
                  onChange={(e) => setNewTicketPriority(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-xs"
                >
                  <option value="عادي">عادي</option>
                  <option value="متوسط">متوسط</option>
                  <option value="عاجل">عاجل</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان الاستفسار:</label>
                <input
                  type="text"
                  required
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                  placeholder="مثال: طلب مشهد إثبات طالب أو استفسار عن درجات الرياضيات..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تفاصيل الاستفسار والطلب:</label>
                <textarea
                  required
                  rows={4}
                  value={newTicketInitialMsg}
                  onChange={(e) => setNewTicketInitialMsg(e.target.value)}
                  placeholder="اكتب التوضيح كاملاً ليقوم الموظف المختص بالرد عليك مباشرة..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Attachment in Ticket */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">إرفاق مستند أو صورة (اختياري):</label>
                <input
                  type="file"
                  ref={ticketFileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setNewTicketAttachment({ file: e.target.files[0], name: e.target.files[0].name });
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => ticketFileInputRef.current?.click()}
                  className="w-full border border-dashed border-slate-300 rounded-xl p-3 text-slate-500 hover:border-blue-400 hover:bg-blue-50 transition flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>{newTicketAttachment ? newTicketAttachment.name : 'اختر ملف للإرفاق'}</span>
                </button>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTicket}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold shadow-md shadow-blue-500/20"
                >
                  {isCreatingTicket ? 'جاري الإنشاء...' : 'إرسال التكت الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS: 2. NEW DIRECT CONVERSATION MODAL                                  */}
      {/* ========================================================================= */}
      {showNewConvModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-indigo-600" />
                <span>بدء محادثة تواصل مدرسي جديدة</span>
              </h3>
              <button
                onClick={() => setShowNewConvModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateConversationSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">الجهة أو الطرف المستلم:</label>
                <select
                  value={newConvRole}
                  onChange={(e) => {
                    const role = e.target.value as UserRole;
                    setNewConvRole(role);
                    if (role === 'teacher') setNewConvTargetName('معلم المادة');
                    else if (role === 'counselor') setNewConvTargetName('الموجه الطلابي');
                    else if (role === 'parent') setNewConvTargetName('ولي أمر الطالب');
                    else if (role === 'principal') setNewConvTargetName('مدير المدرسة');
                    else setNewConvTargetName('إدارة المدرسة');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-xs"
                >
                  <option value="teacher">معلم المادة (Teacher)</option>
                  <option value="counselor">المرشد / الموجه الطلابي (Counselor)</option>
                  <option value="parent">ولي الأمر (Parent)</option>
                  <option value="principal">مدير المدرسة (Principal)</option>
                  <option value="school_admin">شؤون الطلاب وإدارة المدرسة (Administration)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان القناة / الموضوع:</label>
                <input
                  type="text"
                  required
                  value={newConvTitle}
                  onChange={(e) => setNewConvTitle(e.target.value)}
                  placeholder="مثال: متابعة المستوى التحصيلي لمادة العلوم..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رسالة البداية والتحية:</label>
                <textarea
                  rows={3}
                  value={newConvInitialMsg}
                  onChange={(e) => setNewConvInitialMsg(e.target.value)}
                  placeholder="اكتب رسالتك الافتتاحية للمحادثة..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewConvModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isCreatingConv}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold shadow-md shadow-indigo-500/20"
                >
                  {isCreatingConv ? 'جاري الفتح...' : 'بدء المحادثة الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS: 3. SQL MIGRATION VIEW MODAL                                       */}
      {/* ========================================================================= */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full space-y-6 shadow-2xl border border-slate-700 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black text-white">كود تفعيل جداول المحادثات والتذاكر في Supabase</h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              قم بنسخ هذا الكود ولصقه في <strong>SQL Editor</strong> في لوحة تحكم Supabase لتفعيل كافة جداول التذاكر، المحادثات المباشرة، غرف المذاكرة، وسجلات التدقيق والأمان مع تفعيل سياسات RLS و Realtime.
            </p>

            <div className="flex-1 bg-slate-950 p-4 rounded-2xl border border-slate-800 overflow-y-auto font-mono text-[11px] text-emerald-400 leading-relaxed dir-ltr">
              <pre>{getMessagingSqlMigration()}</pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={copySqlToClipboard}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition shadow-lg shadow-amber-500/20"
              >
                {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? 'تم نسخ كود SQL بنجاح!' : 'نسخ الكود بالكامل'}</span>
              </button>

              <button
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Homework Modal */}
      <AddHomeworkModal
        isOpen={showHomeworkModal}
        onClose={() => setShowHomeworkModal(false)}
        onSubmitHomework={handleHomeworkSubmit}
        centralBooks={centralBooks}
      />

      {/* Realtime Toast Notification Banner */}
      {incomingToast && (
        <div className="fixed bottom-6 start-6 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700 animate-slide-up flex items-start gap-3">
          <div className="p-2 bg-indigo-600/30 rounded-xl text-indigo-400 shrink-0 mt-0.5">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                {incomingToast.channelTitle}
              </span>
              <button
                onClick={() => setIncomingToast(null)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs font-bold text-slate-100 truncate">
              {incomingToast.senderName}
            </p>
            <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
              {incomingToast.text}
            </p>
            <div className="pt-1">
              <button
                onClick={() => {
                  if (incomingToast.type === 'direct') {
                    setActiveTab('direct');
                    const conv = conversations.find(c => c.id === incomingToast.targetId);
                    if (conv) handleSelectConversation(conv);
                  } else if (incomingToast.type === 'ticket') {
                    setActiveTab('tickets');
                    const ticket = ticketsList.find(t => t.id === incomingToast.targetId);
                    if (ticket) setSelectedTicket(ticket);
                  } else if (incomingToast.type === 'room') {
                    setActiveTab('groups');
                    const group = studyRooms.find(r => r.id === incomingToast.targetId);
                    if (group) setSelectedGroup(group);
                  }
                  setIncomingToast(null);
                }}
                className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1"
              >
                <span>عرض الرسالة الآن</span>
                <span>←</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
