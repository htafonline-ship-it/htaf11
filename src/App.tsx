import React, { useState } from 'react';
import {
  UserRole,
  SchoolTenant,
  HomeworkAssignment,
  QuizItem,
  StudentProfile,
  CounselingReferral,
  SchoolCircular,
  SupportTicket,
  StudyGroup,
  StudyGroupMessage,
  ModerationAuditLogItem,
  SchoolRegistrationCode,
  CurriculumBook,
  HomeworkCitation
} from './types';
import {
  INITIAL_SCHOOLS,
  INITIAL_STUDENT_PROFILE,
  INITIAL_HOMEWORKS,
  INITIAL_QUIZZES,
  INITIAL_REFERRALS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_STUDY_GROUPS,
  INITIAL_STUDY_MESSAGES,
  INITIAL_AUDIT_LOGS,
  INITIAL_REGISTRATION_CODES,
  CURRICULUM_BOOKS
} from './data/mockData';

import { Navbar } from './components/Navbar';
import { AISolverView } from './components/AISolverView';
import { SmartTeacherView } from './components/SmartTeacherView';
import { CurriculumLibraryView } from './components/CurriculumLibraryView';
import { SchoolManagementView } from './components/SchoolManagementView';
import { MessagingView } from './components/MessagingView';
import { SuperAdminView } from './components/SuperAdminView';

import { StudentDashboard } from './components/dashboards/StudentDashboard';
import { ParentDashboard } from './components/dashboards/ParentDashboard';
import { TeacherDashboard } from './components/dashboards/TeacherDashboard';
import { CounselorDashboard } from './components/dashboards/CounselorDashboard';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [schools, setSchools] = useState<SchoolTenant[]>(INITIAL_SCHOOLS);
  const [currentSchool, setCurrentSchool] = useState<SchoolTenant>(INITIAL_SCHOOLS[0]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // App Data States
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(INITIAL_STUDENT_PROFILE);
  const [homeworks, setHomeworks] = useState<HomeworkAssignment[]>(INITIAL_HOMEWORKS);
  const [quizzes, setQuizzes] = useState<QuizItem[]>(INITIAL_QUIZZES);
  const [referrals, setReferrals] = useState<CounselingReferral[]>(INITIAL_REFERRALS);

  // Messaging & Moderation States
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_SUPPORT_TICKETS);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>(INITIAL_STUDY_GROUPS);
  const [groupMessages, setGroupMessages] = useState<StudyGroupMessage[]>(INITIAL_STUDY_MESSAGES);
  const [auditLogs, setAuditLogs] = useState<ModerationAuditLogItem[]>(INITIAL_AUDIT_LOGS);

  // Super Admin Registration Codes & Central Books State
  const [registrationCodes, setRegistrationCodes] = useState<SchoolRegistrationCode[]>(INITIAL_REGISTRATION_CODES);
  const [centralBooks, setCentralBooks] = useState<CurriculumBook[]>(CURRICULUM_BOOKS);

  const handleAddBook = (newBook: CurriculumBook) => {
    setCentralBooks((prev) => [newBook, ...prev]);
  };

  const handleBulkAddBooks = (newBooks: CurriculumBook[]) => {
    setCentralBooks((prev) => [...newBooks, ...prev]);
  };

  const handleUpdateBook = (updatedBook: CurriculumBook) => {
    setCentralBooks((prev) =>
      prev.map((b) => (b.id === updatedBook.id ? updatedBook : b))
    );
  };

  const handleReplaceBookVersion = (oldBookId: string, newBook: CurriculumBook) => {
    setCentralBooks((prev) =>
      prev.map((b) => (b.id === oldBookId ? { ...b, is_active: false } : b)).concat(newBook)
    );
  };

  const handleDeleteBook = (bookId: string) => {
    setCentralBooks((prev) => prev.filter((b) => b.id !== bookId));
  };

  const handleAddRegistrationCode = (newCode: SchoolRegistrationCode) => {
    setRegistrationCodes((prev) => [newCode, ...prev]);
  };

  const handleToggleCodeStatus = (codeId: string) => {
    setRegistrationCodes((prev) =>
      prev.map((c) =>
        c.id === codeId ? { ...c, status: c.status === 'معطل' ? 'نشط' : 'معطل' } : c
      )
    );
  };

  const handleToggleSchoolApproval = (schoolId: string) => {
    setSchools((prev) =>
      prev.map((s) => (s.id === schoolId ? { ...s, isApproved: !s.isApproved } : s))
    );
  };

  const handleRegisterSchoolByCode = (newSchool: SchoolTenant, codeUsed: string) => {
    setSchools((prev) => [newSchool, ...prev]);
    setCurrentSchool(newSchool);

    // Mark code as used
    setRegistrationCodes((prev) =>
      prev.map((c) =>
        c.code.trim().toUpperCase() === codeUsed.trim().toUpperCase()
          ? {
              ...c,
              status: 'مستخدم',
              usedBySchoolId: newSchool.id,
              usedAtDate: new Date().toISOString().split('T')[0]
            }
          : c
      )
    );
  };

  // Prefill states for AISolverView
  const [solverQuestion, setSolverQuestion] = useState('');

  const handleOpenSolverForHomework = (hw: HomeworkAssignment) => {
    setSolverQuestion(`حل واجب ${hw.subject}: ${hw.title}. ${hw.description}`);
    setActiveTab('solver');
  };

  const handleSelectTopicForSolver = (text: string) => {
    setSolverQuestion(text);
    setActiveTab('solver');
  };

  const handleSelectTopicForTeacher = () => {
    setActiveTab('smart-teacher');
  };

  const handleAddHomework = (newHw: HomeworkAssignment) => {
    setHomeworks((prev) => [newHw, ...prev]);
  };

  const handleAddQuiz = (newQuiz: QuizItem) => {
    setQuizzes((prev) => [newQuiz, ...prev]);
  };

  const handleAddReferral = (newRef: CounselingReferral) => {
    setReferrals((prev) => [newRef, ...prev]);
  };

  const handleAddTicket = (newTicket: SupportTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
  };

  const handleAddTicketReply = (ticketId: string, text: string, senderRole: 'student' | 'admin' | 'counselor') => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            updatedAt: new Date().toISOString().split('T')[0],
            messages: [
              ...t.messages,
              {
                id: `tm-${Date.now()}`,
                senderName: senderRole === 'student' ? 'أحمد العتيبي' : 'إدارة المنصة والإرشاد',
                senderRole,
                timestamp: 'الآن',
                text
              }
            ]
          };
        }
        return t;
      })
    );
  };

  const handleSendGroupMessage = (
    groupId: string,
    messageOrText: string | StudyGroupMessage,
    problemCitation?: any,
    homeworkCitation?: HomeworkCitation
  ) => {
    if (typeof messageOrText === 'object') {
      setGroupMessages((prev) => [...prev, messageOrText]);
    } else {
      const newMsg: StudyGroupMessage = {
        id: `msg-${Date.now()}`,
        groupId,
        senderName: currentRole === 'student' ? studentProfile.name : 'المعلم المشرف',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        senderRole: currentRole,
        text: messageOrText,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        problemCitation,
        homeworkCitation
      };
      setGroupMessages((prev) => [...prev, newMsg]);
    }
  };

  const handleDeleteGroupMessage = (messageId: string, reason: string) => {
    setGroupMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, isDeleted: true, text: '[تم حذف المحتوى بواسطة المشرف]' } : m))
    );

    // Record in Audit Log
    const newAuditLog: ModerationAuditLogItem = {
      id: `audit-${Date.now()}`,
      timestamp: 'الآن',
      action: 'حذف رسالة مخالفة',
      actorName: 'المشرف الإداري الذكي',
      targetUser: 'طالب في مجموعة المذاكرة',
      details: `تم حذف الرسالة ID (${messageId}) بسبب: ${reason}`,
      severity: 'متوسط'
    };
    setAuditLogs((prev) => [newAuditLog, ...prev]);
  };

  const handleAddCircular = (newCirc: SchoolCircular) => {
    setSchools((prev) =>
      prev.map((s) => {
        if (s.id === currentSchool.id) {
          const updated = { ...s, circulars: [newCirc, ...s.circulars] };
          setCurrentSchool(updated);
          return updated;
        }
        return s;
      })
    );
  };

  const handleAddCounselingNote = (refId: string, noteText: string) => {
    setReferrals((prev) =>
      prev.map((r) => {
        if (r.id === refId) {
          return {
            ...r,
            status: 'قيد المتابعة',
            confidentialNotes: [
              ...r.confidentialNotes,
              {
                id: `cn-${Date.now()}`,
                author: 'د. إبراهيم السعيد (الموجه الطلابي)',
                date: new Date().toISOString().split('T')[0],
                note: noteText
              }
            ]
          };
        }
        return r;
      })
    );
  };

  const handleUpdateRevisionTask = (day: number, completed: boolean) => {
    setStudentProfile((prev) => ({
      ...prev,
      aiRevisionPlan: {
        ...prev.aiRevisionPlan,
        tasks: prev.aiRevisionPlan.tasks.map((t) => (t.day === day ? { ...t, completed } : t))
      }
    }));
  };

  const handleUpdateScreenTime = (newLimitMinutes: number) => {
    setStudentProfile((prev) => ({ ...prev, screenTimeDailyLimitMinutes: newLimitMinutes }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-['Cairo',sans-serif] flex flex-col">
      {/* Navigation Header */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={(role) => {
          setCurrentRole(role);
          if (role === 'super_admin') {
            setActiveTab('super_admin');
          } else {
            setActiveTab('dashboard');
          }
        }}
        currentSchool={currentSchool}
        schools={schools}
        onSchoolChange={(sch) => setCurrentSchool(sch)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSolver={() => {
          setSolverQuestion('');
          setActiveTab('solver');
        }}
      />

      {/* Main Content Body */}
      <main className="flex-1 pb-16">
        {activeTab === 'super_admin' && (
          <SuperAdminView
            schools={schools}
            registrationCodes={registrationCodes}
            centralBooks={centralBooks}
            onAddRegistrationCode={handleAddRegistrationCode}
            onToggleCodeStatus={handleToggleCodeStatus}
            onToggleSchoolApproval={handleToggleSchoolApproval}
            onRegisterSchoolByCode={handleRegisterSchoolByCode}
            onAddBook={handleAddBook}
            onBulkAddBooks={handleBulkAddBooks}
            onUpdateBook={handleUpdateBook}
            onReplaceBookVersion={handleReplaceBookVersion}
            onDeleteBook={handleDeleteBook}
          />
        )}

        {activeTab === 'solver' && (
          <AISolverView initialQuestion={solverQuestion} />
        )}

        {activeTab === 'smart-teacher' && (
          <SmartTeacherView centralBooks={centralBooks} />
        )}

        {activeTab === 'curriculum' && (
          <CurriculumLibraryView
            centralBooks={centralBooks}
            onSelectTopicForSolver={handleSelectTopicForSolver}
            onSelectTopicForTeacher={handleSelectTopicForTeacher}
          />
        )}

        {activeTab === 'school-mgmt' && (
          <SchoolManagementView
            currentSchool={currentSchool}
            referrals={referrals}
            auditLogs={auditLogs}
            onAddReferral={handleAddReferral}
            onAddCircular={handleAddCircular}
          />
        )}

        {activeTab === 'messaging' && (
          <MessagingView
            currentRole={currentRole}
            tickets={tickets}
            studyGroups={studyGroups}
            groupMessages={groupMessages}
            centralBooks={centralBooks}
            onAddTicket={handleAddTicket}
            onAddTicketReply={handleAddTicketReply}
            onSendGroupMessage={handleSendGroupMessage}
            onDeleteGroupMessage={handleDeleteGroupMessage}
          />
        )}

        {activeTab === 'counseling' && (
          <CounselorDashboard
            referrals={referrals}
            onAddNote={handleAddCounselingNote}
          />
        )}

        {activeTab === 'dashboard' && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            {currentRole === 'student' && (
              <StudentDashboard
                profile={studentProfile}
                homeworks={homeworks}
                quizzes={quizzes}
                onOpenSolverForHomework={handleOpenSolverForHomework}
                onUpdateRevisionTask={handleUpdateRevisionTask}
              />
            )}

            {currentRole === 'parent' && (
              <ParentDashboard
                profile={studentProfile}
                onUpdateScreenTime={handleUpdateScreenTime}
              />
            )}

            {currentRole === 'teacher' && (
              <TeacherDashboard
                homeworks={homeworks}
                onAddHomework={handleAddHomework}
                onAddQuiz={handleAddQuiz}
              />
            )}

            {currentRole === 'counselor' && (
              <CounselorDashboard
                referrals={referrals}
                onAddNote={handleAddCounselingNote}
              />
            )}

            {(currentRole === 'principal' || currentRole === 'vice_principal') && (
              <SchoolManagementView
                currentSchool={currentSchool}
                referrals={referrals}
                auditLogs={auditLogs}
                onAddReferral={handleAddReferral}
                onAddCircular={handleAddCircular}
              />
            )}

            {currentRole === 'super_admin' && (
              <SuperAdminView
                schools={schools}
                registrationCodes={registrationCodes}
                centralBooks={centralBooks}
                onAddRegistrationCode={handleAddRegistrationCode}
                onToggleCodeStatus={handleToggleCodeStatus}
                onToggleSchoolApproval={handleToggleSchoolApproval}
                onRegisterSchoolByCode={handleRegisterSchoolByCode}
                onAddBook={handleAddBook}
                onBulkAddBooks={handleBulkAddBooks}
                onUpdateBook={handleUpdateBook}
                onReplaceBookVersion={handleReplaceBookVersion}
                onDeleteBook={handleDeleteBook}
              />
            )}
          </div>
        )}
      </main>

      {/* Global Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 font-bold text-slate-200">
            <span>منصة هتاf العاصمي التعليمية الذكية</span>
            <span>•</span>
            <span className="text-emerald-400">جميع الحقوق محفوظة © 2026</span>
          </div>
          <p className="text-slate-500">
            متوافق بالكامل مع كتب وإصدارات وزارة التعليم المعتمدة • مدعوم بتقنيات الذكاء الاصطناعي الفائقة (Google Gemini)
          </p>
        </div>
      </footer>
    </div>
  );
}
