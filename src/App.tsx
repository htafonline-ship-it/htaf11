import React, { useState, useEffect } from 'react';
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
  HomeworkCitation,
  AuthUser
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

import {
  supabase,
  fetchSupabaseSchools,
  getSupabaseUserSchoolLink,
  checkAndMatchInvitationForUser,
  fetchSupabaseSchoolBySlugOrId,
  SupabaseSchoolUserLink
} from './lib/supabase';

import {
  checkTabPermission,
  checkSchoolTenantAccess,
  isPlatformAdminRole
} from './lib/routeGuardMiddleware';

import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { LoginModal } from './components/LoginModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { CreateSchoolView } from './components/CreateSchoolView';
import { UnlinkedUserGate } from './components/UnlinkedUserGate';
import { InviteStudentModal } from './components/InviteStudentModal';
import { AccessDeniedGate } from './components/AccessDeniedGate';
import { SecurityToast } from './components/SecurityToast';

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
  // Authentication State - Defaults to null (Production Auth via Google / Supabase)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isSupabaseConfigOpen, setIsSupabaseConfigOpen] = useState<boolean>(false);
  const [isCreateSchoolOpen, setIsCreateSchoolOpen] = useState<boolean>(false);
  const [isInviteStudentModalOpen, setIsInviteStudentModalOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const [userSchoolLink, setUserSchoolLink] = useState<SupabaseSchoolUserLink | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [schools, setSchools] = useState<SchoolTenant[]>([]);
  const [currentSchool, setCurrentSchool] = useState<SchoolTenant | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Load real schools from Supabase
  const loadRealSchools = async () => {
    try {
      const realSchools = await fetchSupabaseSchools();
      if (realSchools && realSchools.length > 0) {
        const formatted: SchoolTenant[] = realSchools.map((s) => ({
          id: s.id,
          name: s.name,
          nameEn: s.name,
          slug: s.slug || s.id,
          logoText: s.name.slice(0, 2),
          badge: s.type || 'مدرسة موثقة',
          primaryColor: 'from-blue-600 to-indigo-600',
          accentColor: 'blue',
          motto: 'التعليم الذكي والجيل الواعد',
          location: `${s.city || ''} ${s.region || ''}`.trim() || 'المملكة العربية السعودية',
          totalStudentsCount: 0,
          totalTeachersCount: 0,
          isApproved: s.status === 'active',
          circulars: []
        }));
        setSchools(formatted);
        if (!currentSchool || !formatted.find(f => f.id === currentSchool.id)) {
          setCurrentSchool(formatted[0]);
        }
      }
    } catch (err) {
      console.warn('Supabase schools fetch error:', err);
    }
  };

  // Sync user session and school_users role from Supabase DB
  const syncUserAuthWithSupabase = async (sessionUser: any) => {
    setIsLoadingAuth(true);
    try {
      const email = sessionUser.email || '';
      const name = sessionUser.user_metadata?.full_name || email.split('@')[0] || 'مستخدم مسجل';

      // 1. Auto match any invitations for this user email
      await checkAndMatchInvitationForUser(sessionUser.id, email, name);

      // 2. Fetch school linkage and real role from school_users table
      const link = await getSupabaseUserSchoolLink(sessionUser.id, email);
      setUserSchoolLink(link);

      if (link && link.status === 'active') {
        const dbRole = (link.role as UserRole) || 'student';
        setCurrentRole(dbRole);

        // Fetch assigned school
        if (link.school_id) {
          const matchedSchool = await fetchSupabaseSchoolBySlugOrId(link.school_id);
          if (matchedSchool) {
            const formatted: SchoolTenant = {
              id: matchedSchool.id,
              name: matchedSchool.name,
              nameEn: matchedSchool.name,
              slug: matchedSchool.slug || matchedSchool.id,
              logoText: matchedSchool.name.slice(0, 2),
              badge: matchedSchool.type || 'مدرسة موثقة',
              primaryColor: 'from-blue-600 to-indigo-600',
              accentColor: 'blue',
              motto: 'التعليم الذكي والجيل الواعد',
              location: `${matchedSchool.city || ''} ${matchedSchool.region || ''}`.trim() || 'المملكة العربية السعودية',
              totalStudentsCount: 0,
              totalTeachersCount: 0,
              isApproved: matchedSchool.status === 'active',
              circulars: []
            };
            setCurrentSchool(formatted);
          }
        }

        const authUsr: AuthUser = {
          id: sessionUser.id,
          username: email.split('@')[0],
          fullName: link.full_name || name,
          email,
          role: dbRole,
          schoolId: link.school_id,
          avatarUrl: sessionUser.user_metadata?.avatar_url,
          loginMethod: 'google'
        };
        setCurrentUser(authUsr);

        // Initial default tab by role
        if (dbRole === 'super_admin' || dbRole === 'platform_admin') {
          setActiveTab('platform-admin');
        } else if (dbRole === 'principal' || dbRole === 'school_admin' || dbRole === 'vice_principal') {
          setActiveTab('school-mgmt');
        } else {
          setActiveTab('dashboard');
        }
      } else {
        // Logged in via Google but not linked to any school in school_users table
        const authUsr: AuthUser = {
          id: sessionUser.id,
          username: email.split('@')[0],
          fullName: name,
          email,
          role: 'student',
          avatarUrl: sessionUser.user_metadata?.avatar_url,
          loginMethod: 'google'
        };
        setCurrentUser(authUsr);
        setCurrentRole('student');
      }
    } catch (err) {
      console.error('Error syncing auth session:', err);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  useEffect(() => {
    loadRealSchools();

    if (!supabase) {
      setIsLoadingAuth(false);
      return;
    }

    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncUserAuthWithSupabase(session.user);
      } else {
        setIsLoadingAuth(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        syncUserAuthWithSupabase(session.user);
      } else {
        setCurrentUser(null);
        setUserSchoolLink(null);
        setIsLoadingAuth(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleLoginSuccess = (user: AuthUser) => {
    if (user.id) {
      syncUserAuthWithSupabase({ id: user.id, email: user.email, user_metadata: { full_name: user.fullName, avatar_url: user.avatarUrl } });
    } else {
      setCurrentUser(user);
      setCurrentRole(user.role);
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setUserSchoolLink(null);
    setCurrentRole('student');
    setActiveTab('dashboard');
  };

  // Security Toast Alert State
  const [securityToastMessage, setSecurityToastMessage] = useState<string | null>(null);

  const triggerSecurityAlert = (msg: string) => {
    setSecurityToastMessage(msg);
  };

  // Route Guard Middleware - Intercept Hash / URL updates
  useEffect(() => {
    const processRouteGuardMiddleware = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;

      const [targetTab, targetSchoolId] = hash.split('/');

      if (targetTab) {
        const tabCheck = checkTabPermission(targetTab, currentRole, userSchoolLink);
        if (!tabCheck.allowed) {
          triggerSecurityAlert(`تم صَدّ محاولة الوصول للمسار (#${targetTab}): ${tabCheck.reason}`);
          const fallbackTab = tabCheck.suggestedTab || 'dashboard';
          setActiveTab(fallbackTab);
          window.location.hash = `#${fallbackTab}`;
        } else if (targetTab !== activeTab) {
          setActiveTab(targetTab);
        }
      }

      if (targetSchoolId) {
        const schoolCheck = checkSchoolTenantAccess(targetSchoolId, userSchoolLink, currentRole);
        if (!schoolCheck.allowed) {
          triggerSecurityAlert(`تم منع التبديل للمدرسة (#${targetSchoolId}): ${schoolCheck.reason}`);
          if (userSchoolLink?.school_id) {
            const matched = schools.find((s) => s.id === userSchoolLink.school_id);
            if (matched) setCurrentSchool(matched);
          }
        }
      }
    };

    processRouteGuardMiddleware();
    window.addEventListener('hashchange', processRouteGuardMiddleware);
    return () => window.removeEventListener('hashchange', processRouteGuardMiddleware);
  }, [currentRole, userSchoolLink, schools, activeTab]);

  // Auto-enforce School Tenant Isolation for Non-Platform Admins
  useEffect(() => {
    if (currentUser && !isPlatformAdminRole(currentRole) && userSchoolLink?.school_id) {
      if (!currentSchool || currentSchool.id !== userSchoolLink.school_id) {
        const userAssignedSchool = schools.find((s) => s.id === userSchoolLink.school_id);
        if (userAssignedSchool) {
          setCurrentSchool(userAssignedSchool);
        }
      }
    }
  }, [currentUser, currentRole, userSchoolLink, schools, currentSchool]);

  const handleSetActiveTabGuard = (tab: string) => {
    const check = checkTabPermission(tab, currentRole, userSchoolLink);
    if (check.allowed) {
      setActiveTab(tab);
      window.location.hash = `#${tab}`;
    } else {
      triggerSecurityAlert(check.reason || 'ليس لديك صلاحية للوصول لهذا المسار.');
      const fallbackTab = check.suggestedTab || 'dashboard';
      setActiveTab(fallbackTab);
      window.location.hash = `#${fallbackTab}`;
    }
  };

  const handleSchoolChangeGuard = (targetSchool: SchoolTenant) => {
    const check = checkSchoolTenantAccess(targetSchool.id, userSchoolLink, currentRole);
    if (check.allowed) {
      setCurrentSchool(targetSchool);
    } else {
      triggerSecurityAlert(check.reason || 'لا يمتلك حسابك صلاحية للتبديل إلى مدرسة أخرى.');
      if (userSchoolLink?.school_id) {
        const assigned = schools.find((s) => s.id === userSchoolLink.school_id);
        if (assigned) setCurrentSchool(assigned);
      }
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50/90 via-fuchsia-50/40 to-pink-50/60 text-slate-900 font-['Cairo',sans-serif] flex">
      {/* Security Toast Alert Popup */}
      {securityToastMessage && (
        <SecurityToast
          message={securityToastMessage}
          onClose={() => setSecurityToastMessage(null)}
        />
      )}

      {/* Right Sidebar (Desktop Persistent & Mobile Drawer) */}
      <Sidebar
        currentRole={currentRole}
        currentSchool={currentSchool}
        schools={schools}
        onSchoolChange={handleSchoolChangeGuard}
        activeTab={activeTab}
        setActiveTab={handleSetActiveTabGuard}
        onOpenSolver={() => {
          setSolverQuestion('');
          handleSetActiveTabGuard('solver');
        }}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area with Sticky Top Header */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader
          currentRole={currentRole}
          currentSchool={currentSchool}
          schools={schools}
          onSchoolChange={handleSchoolChangeGuard}
          activeTab={activeTab}
          setActiveTab={handleSetActiveTabGuard}
          onOpenSolver={() => {
            setSolverQuestion('');
            handleSetActiveTabGuard('solver');
          }}
          currentUser={currentUser}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Login Modal */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />

        {/* Create School View Modal */}
        {isCreateSchoolOpen && (
          <CreateSchoolView
            currentUser={currentUser}
            user={currentUser}
            onClose={() => setIsCreateSchoolOpen(false)}
            onCancel={() => setIsCreateSchoolOpen(false)}
            onSchoolCreated={(newSch) => {
              loadRealSchools();
              setIsCreateSchoolOpen(false);
            }}
            onSuccess={(newSch) => {
              loadRealSchools();
              setIsCreateSchoolOpen(false);
            }}
          />
        )}

        {/* Invite Student Modal */}
        {currentUser && currentSchool && (
          <InviteStudentModal
            isOpen={isInviteStudentModalOpen}
            onClose={() => setIsInviteStudentModalOpen(false)}
            schoolId={currentSchool.id}
            schoolName={currentSchool.name}
            teacherId={currentUser.id}
          />
        )}

        {/* Main Content Body */}
        <main className="flex-1 pb-16">
        {currentUser && !userSchoolLink && currentRole !== 'super_admin' && currentRole !== 'platform_admin' ? (
          <UnlinkedUserGate
            currentUser={currentUser}
            user={currentUser}
            schools={schools}
            onCreateSchoolClick={() => setIsCreateSchoolOpen(true)}
            onOpenCreateSchool={() => setIsCreateSchoolOpen(true)}
            onSchoolJoinedSuccess={() => {
              if (currentUser?.id) {
                syncUserAuthWithSupabase({ id: currentUser.id, email: currentUser.email || '', user_metadata: { full_name: currentUser.fullName } });
              }
            }}
            onLinkedSuccess={() => {
              if (currentUser?.id) {
                syncUserAuthWithSupabase({ id: currentUser.id, email: currentUser.email || '', user_metadata: { full_name: currentUser.fullName } });
              }
            }}
            onLogout={handleLogout}
          />
        ) : !checkTabPermission(activeTab, currentRole, userSchoolLink).allowed ? (
          <AccessDeniedGate
            attemptedTab={activeTab}
            userRole={currentRole}
            reason={checkTabPermission(activeTab, currentRole, userSchoolLink).reason}
            onReturnHome={() => handleSetActiveTabGuard('dashboard')}
          />
        ) : (
          <>
            {(activeTab === 'super_admin' || activeTab === 'platform-admin') && (
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
                onOpenInviteStudentModal={() => setIsInviteStudentModalOpen(true)}
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
                    onNavigateTab={handleSetActiveTabGuard}
                    onOpenSolver={() => {
                      setSolverQuestion('');
                      handleSetActiveTabGuard('solver');
                    }}
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
                    onOpenInviteStudentModal={() => setIsInviteStudentModalOpen(true)}
                  />
                )}

                {currentRole === 'counselor' && (
                  <CounselorDashboard
                    referrals={referrals}
                    onAddNote={handleAddCounselingNote}
                  />
                )}

                {(currentRole === 'principal' || currentRole === 'vice_principal' || currentRole === 'school_admin' || currentRole === 'school_manager') && (
                  <SchoolManagementView
                    currentSchool={currentSchool}
                    referrals={referrals}
                    auditLogs={auditLogs}
                    onAddReferral={handleAddReferral}
                    onAddCircular={handleAddCircular}
                    onOpenInviteStudentModal={() => setIsInviteStudentModalOpen(true)}
                  />
                )}

                {(currentRole === 'super_admin' || currentRole === 'platform_admin') && (
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
          </>
        )}
      </main>


      {/* Global Footer */}
      <footer className="bg-[#050a16] text-blue-300/70 text-xs py-8 border-t border-blue-900/40 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 font-bold text-white">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent">منصة حتّان التعليمية الذكية</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400">جميع الحقوق محفوظة © 2026</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            متوافق بالكامل مع كتب وإصدارات وزارة التعليم المعتمدة • مدعوم بأحدث نماذج الذكاء الاصطناعي (Google Gemini)
          </p>
        </div>
      </footer>
    </div>
    </div>
  );
}
