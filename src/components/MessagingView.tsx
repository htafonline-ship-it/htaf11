import React, { useState } from 'react';
import {
  SupportTicket,
  StudyGroup,
  StudyGroupMessage,
  UserRole,
  StudentProfile,
  ModerationAuditLogItem,
  CurriculumBook,
  HomeworkCitation
} from '../types';
import { AddHomeworkModal } from './AddHomeworkModal';
import {
  MessageSquare,
  Users,
  PlusCircle,
  Send,
  Trash2,
  EyeOff,
  ShieldAlert,
  Paperclip,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
  AlertTriangle,
  UserCheck,
  Search,
  School,
  Lock,
  ChevronLeft,
  BookOpen
} from 'lucide-react';

interface MessagingViewProps {
  currentRole: UserRole;
  studentProfile: StudentProfile;
  tickets: SupportTicket[];
  studyGroups: StudyGroup[];
  groupMessages: StudyGroupMessage[];
  centralBooks?: CurriculumBook[];
  onAddTicket: (ticket: SupportTicket) => void;
  onAddTicketMessage: (ticketId: string, text: string, senderRole: UserRole, senderName: string) => void;
  onSendGroupMessage: (groupId: string, text: string, problemCitation?: any, homeworkCitation?: HomeworkCitation) => void;
  onDeleteGroupMessage: (messageId: string, deletedBy: string) => void;
  onAddAuditLog: (log: ModerationAuditLogItem) => void;
}

// Banned words filter list for real-time AI moderation guard
const BANNED_KEYWORDS = ['سباب', 'شتيمة', 'احتيال', 'سرقة', 'غش', 'تنمر', 'مخالف', 'شتيمة2'];

export const MessagingView: React.FC<MessagingViewProps> = ({
  currentRole,
  studentProfile,
  tickets,
  studyGroups,
  groupMessages,
  centralBooks,
  onAddTicket,
  onAddTicketMessage,
  onSendGroupMessage,
  onDeleteGroupMessage,
  onAddAuditLog
}) => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'groups'>('tickets');

  // Support Tickets State
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(tickets[0] || null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState<SupportTicket['category']>('استفسار أكاديمي');
  const [newTicketPriority, setNewTicketPriority] = useState<SupportTicket['priority']>('متوسط');
  const [newTicketInitialMsg, setNewTicketInitialMsg] = useState('');

  // Study Groups State
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup>(studyGroups[0]);
  const [groupMsgText, setGroupMsgText] = useState('');
  const [moderationWarning, setModerationWarning] = useState<string | null>(null);

  // Homework Modal State in Chat
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);

  const handleHomeworkSubmit = (citation: HomeworkCitation) => {
    onSendGroupMessage(
      selectedGroup.id,
      `📌 واجب دراسي جديد: ${citation.title}`,
      undefined,
      citation
    );
  };

  // Filter study group messages for selected group
  const currentGroupMessages = groupMessages.filter((m) => m.groupId === selectedGroup.id);

  // Handle submitting new ticket
  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim() || !newTicketInitialMsg.trim()) return;

    const newTicket: SupportTicket = {
      id: `tkt-${Date.now()}`,
      studentName: studentProfile.name,
      grade: studentProfile.grade,
      category: newTicketCategory,
      subject: newTicketSubject,
      status: 'جديد',
      priority: newTicketPriority,
      createdAt: 'الآن',
      lastUpdated: 'الآن',
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderRole: currentRole,
          senderName: studentProfile.name,
          text: newTicketInitialMsg,
          timestamp: 'الآن'
        }
      ]
    };

    onAddTicket(newTicket);
    setSelectedTicket(newTicket);
    setShowNewTicketModal(false);
    setNewTicketSubject('');
    setNewTicketInitialMsg('');
  };

  // Handle ticket reply
  const handleSendTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !ticketReplyText.trim()) return;

    const senderName =
      currentRole === 'student'
        ? studentProfile.name
        : currentRole === 'admin'
        ? 'إدارة المدرسة - الشؤون المدرسية'
        : currentRole === 'counselor'
        ? 'الموجه الطلابي'
        : 'المعلم المباشر';

    onAddTicketMessage(selectedTicket.id, ticketReplyText, currentRole, senderName);
    setTicketReplyText('');
  };

  // Handle sending message in group with AI Content Moderation Guard
  const handleSendGroupMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupMsgText.trim()) return;

    // Check for banned words or inappropriate content
    const containsBanned = BANNED_KEYWORDS.some((word) => groupMsgText.includes(word));

    if (containsBanned) {
      setModerationWarning('عفواً، تم رصد محتوى غير لائق أو مخالف بقواعد الأمان الرقمي. تم حظر النشر وإشعار الرقابة الإدارية.');

      // Audit Log trigger
      onAddAuditLog({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        actorName: 'نظام الفلترة الآلي (AI Content Guard)',
        actorRole: 'admin',
        action: 'تنبيه فلترة آلية',
        targetUser: studentProfile.name,
        details: `محاولة نشر محتوى مخالف في ${selectedGroup.name}: "${groupMsgText.substring(0, 30)}..."`,
        severity: 'عالي'
      });
      return;
    }

    setModerationWarning(null);
    onSendGroupMessage(selectedGroup.id, groupMsgText);
    setGroupMsgText('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 rounded-3xl border border-blue-500/30 shadow-xl shadow-blue-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30 mb-3 shadow-inner">
            <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
            التواصل المباشر والأمان الرقمي
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            نظام المحادثات وغرف المذاكرة التفاعلية
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
            تواصل مباشر مع إدارة المدرسة والإرشاد الطلابي عبر التذاكر الرسمية، وشارك زملاءك في غرف المذاكرة الجماعية المغلقة تحت رقابة إدارية آمنة.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 flex items-center gap-1 shrink-0 relative z-10">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeTab === 'tickets'
                ? 'bg-white text-blue-900 shadow-md'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-blue-600" />
            <span>التذاكر والاستفسارات ({tickets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('groups')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeTab === 'groups'
                ? 'bg-white text-blue-900 shadow-md'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-600" />
            <span>غرف المذاكرة ({studyGroups.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'tickets' ? (
        /* ================= TAB A: SUPPORT TICKETS & INQUIRIES ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Tickets List */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                تذاكر التواصل مع الإدارة ({tickets.length})
              </h3>

              <button
                onClick={() => setShowNewTicketModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>فتح استفسار</span>
              </button>
            </div>

            <div className="space-y-3">
              {tickets.map((tkt) => {
                const isSelected = selectedTicket?.id === tkt.id;

                return (
                  <div
                    key={tkt.id}
                    onClick={() => setSelectedTicket(tkt)}
                    className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-800 shadow-xl'
                        : 'bg-white text-slate-900 border-slate-200/80 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tkt.status === 'مكتمل'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : tkt.status === 'قيد المعالجة'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {tkt.status}
                      </span>
                      <span className={`text-[10px] ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                        {tkt.createdAt}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs leading-snug line-clamp-1">{tkt.subject}</h4>

                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100/10">
                      <span className={isSelected ? 'text-slate-300' : 'text-slate-500'}>{tkt.category}</span>
                      <span className={isSelected ? 'text-blue-300 font-bold' : 'text-blue-600 font-bold'}>
                        {tkt.studentName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Ticket Chat Thread */}
          <div className="lg:col-span-8">
            {selectedTicket ? (
              <div className="bg-white rounded-3xl p-6 shadow-sm shadow-slate-200/50 border border-slate-200/80 space-y-6 flex flex-col min-h-[500px]">
                {/* Ticket Header */}
                <div className="border-b border-slate-100 pb-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">
                        {selectedTicket.category}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        الأولوية: {selectedTicket.priority}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400">
                      رقم التكت: #{selectedTicket.id.split('-')[1]}
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-slate-900">{selectedTicket.subject}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>مرسل التكت: <strong>{selectedTicket.studentName}</strong> ({selectedTicket.grade})</span>
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
                        <div className="flex items-center justify-between gap-4 text-[10px] opacity-80 font-bold">
                          <span>{msg.senderName}</span>
                          <span>{msg.timestamp}</span>
                        </div>
                        <p className="text-xs leading-relaxed">{msg.text}</p>

                        {msg.attachmentName && (
                          <div className="mt-2 bg-black/10 backdrop-blur-sm p-2 rounded-xl flex items-center justify-between text-xs">
                            <span className="truncate font-bold">{msg.attachmentName}</span>
                            <button className="underline text-[10px] shrink-0 font-extrabold ms-2">تحميل المرفق</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendTicketReply} className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <input
                    type="text"
                    value={ticketReplyText}
                    onChange={(e) => setTicketReplyText(e.target.value)}
                    placeholder="اكتب ردك أو استفسارك هنا..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-sm transition shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span>إرسال الرد</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-3xl p-12 text-center text-slate-400 border border-slate-200">
                اختر تكت استفسار لمشاهدة التفاصيل والردود
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= TAB B: PEER STUDY ROOMS ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Study Groups List */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              غرف المذاكرة الجماعية ({studyGroups.length})
            </h3>

            <div className="space-y-3">
              {studyGroups.map((grp) => {
                const isSelected = selectedGroup.id === grp.id;

                return (
                  <div
                    key={grp.id}
                    onClick={() => setSelectedGroup(grp)}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-800 shadow-xl'
                        : 'bg-white text-slate-900 border-slate-200 hover:border-indigo-300'
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
            <div className="bg-white rounded-3xl p-6 shadow-sm shadow-slate-200/50 border border-slate-200/80 space-y-6 flex flex-col min-h-[540px]">
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
                {currentGroupMessages.map((msg) => (
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
                        <span className="text-lg">{msg.senderAvatar}</span>
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
                            onClick={() => onDeleteGroupMessage(msg.id, currentRole === 'admin' ? 'المشرف الإداري' : studentProfile.name)}
                            title="حذف أو إخفاء الرسالة"
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {msg.isDeleted ? (
                      <p className="text-xs italic text-slate-400 font-semibold">
                        (تم حذف هذه الرسالة بواسطة {msg.deletedBy || 'المشرف'})
                      </p>
                    ) : (
                      <>
                        <p className="text-xs text-slate-800 leading-relaxed">{msg.text}</p>

                        {/* Attached Problem Citation */}
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

                        {/* Attached Homework Citation Card */}
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
                              {msg.homeworkCitation.externalTopic && (
                                <p className="text-[11px] font-semibold text-slate-300">
                                  الموضوع الخارجي: <span className="text-emerald-300">{msg.homeworkCitation.externalTopic}</span> ({msg.homeworkCitation.subject})
                                </p>
                              )}
                              <p className="text-xs text-slate-200">{msg.homeworkCitation.description}</p>
                            </div>

                            {msg.homeworkCitation.questions && msg.homeworkCitation.questions.length > 0 && (
                              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 block mb-1">أسئلة الواجب المطلوب حلها:</span>
                                {msg.homeworkCitation.questions.map((q, qIdx) => (
                                  <p key={qIdx} className="text-xs text-amber-100 font-medium">• {q}</p>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 pt-1">
                              <span className="text-amber-300">⭐ الدرجة: {msg.homeworkCitation.totalPoints} درجات</span>
                              <span className="text-slate-400">📅 التسليم: {msg.homeworkCitation.dueDate}</span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSendGroupMessageSubmit} className="pt-4 border-t border-slate-100 flex items-center gap-2 sm:gap-3">
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
              </form>
            </div>
          </div>
        </div>
      )}

      {/* New Support Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                تقديم تكت استفسار جديد للإدارة
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold"
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
                  placeholder="مثال: طلب مشهد إثبات طالب أو درجات الرياضيات..."
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
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20"
                >
                  إرسال التكت الآن
                </button>
              </div>
            </form>
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
    </div>
  );
};
