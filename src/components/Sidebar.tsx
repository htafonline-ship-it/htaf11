import React from 'react';
import { UserRole, SchoolTenant, AuthUser } from '../types';
import {
  Sparkles,
  GraduationCap,
  School,
  BookOpen,
  ChevronDown,
  BrainCircuit,
  Bot,
  MessageSquare,
  Crown,
  LogIn,
  LogOut,
  ShieldAlert,
  Building2,
  X,
  Layers,
  ChevronLeft
} from 'lucide-react';

interface SidebarProps {
  currentRole: UserRole;
  currentSchool: SchoolTenant | null;
  schools: SchoolTenant[];
  onSchoolChange: (school: SchoolTenant) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSolver: () => void;
  currentUser: AuthUser | null;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  currentSchool,
  schools,
  onSchoolChange,
  activeTab,
  setActiveTab,
  onOpenSolver,
  currentUser,
  onOpenLoginModal,
  onLogout,
  isMobileOpen,
  onCloseMobile
}) => {
  const isPlatformAdmin = currentRole === 'super_admin' || currentRole === 'platform_admin';
  const isSchoolAdminOrPrincipal =
    currentRole === 'principal' ||
    currentRole === 'vice_principal' ||
    currentRole === 'school_admin' ||
    currentRole === 'school_manager';
  const isTeacher = currentRole === 'teacher';
  const isStudent = currentRole === 'student';
  const isCounselor = currentRole === 'counselor';

  const roleDisplayNames: Record<string, string> = {
    student: 'طالب',
    teacher: 'معلم',
    parent: 'ولي أمر',
    counselor: 'مرشد إرشادي',
    vice_principal: 'وكيل المدرسة',
    principal: 'مدير المدرسة',
    school_admin: 'مدير المدرسة',
    school_manager: 'مدير المدرسة',
    super_admin: 'مدير المنصة (الأدمن العام)',
    platform_admin: 'مدير المنصة (الأدمن العام)'
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onCloseMobile();
  };

  const [isSchoolDropdownOpen, setIsSchoolDropdownOpen] = React.useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white text-slate-800 border-l border-slate-200 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div
          onClick={() => handleTabClick('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
          id="sidebar-brand-link"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black text-blue-600 tracking-tight">
                هتاف العاصمي
              </span>
              <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-blue-200">
                v2.5
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">المنصة التعليمية الذكية</p>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          id="close-mobile-sidebar-btn"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="إغلاق القائمة"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* School Badge / Switcher */}
      {currentSchool && (
        <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center justify-between">
            <span>المدرسة الحالية</span>
            {isPlatformAdmin && <span className="text-blue-600 font-extrabold">Super Admin</span>}
          </div>

          {isPlatformAdmin ? (
            <div className="relative">
              <button
                id="platform-admin-school-toggle-btn"
                onClick={() => setIsSchoolDropdownOpen(!isSchoolDropdownOpen)}
                className="w-full flex items-center justify-between gap-2 bg-white hover:bg-slate-100 text-slate-800 text-xs px-2.5 py-2 rounded-xl border border-slate-200 transition font-bold shadow-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <School className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate">{currentSchool.name}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isSchoolDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSchoolDropdownOpen && (
                <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 max-h-52 overflow-y-auto">
                  <div className="px-3 py-1 text-[10px] text-slate-400 font-bold border-b border-slate-100">
                    التبديل بين المدارس
                  </div>
                  {schools.map((sch) => (
                    <button
                      key={sch.id}
                      onClick={() => {
                        onSchoolChange(sch);
                        setIsSchoolDropdownOpen(false);
                      }}
                      className={`w-full text-right px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                        sch.id === currentSchool.id ? 'text-blue-600 font-bold bg-blue-50/60' : 'text-slate-700'
                      }`}
                    >
                      <div className="truncate">
                        <p className="truncate font-semibold">{sch.name}</p>
                        <p className="text-[10px] text-slate-400">{sch.location}</p>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 shrink-0 ms-1">
                        {sch.slug}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-white text-slate-800 text-xs px-2.5 py-2 rounded-xl border border-slate-200 font-bold shadow-xs">
              <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="truncate">
                <p className="truncate text-xs">{currentSchool.name}</p>
                <p className="text-[10px] text-slate-400 font-medium truncate">{currentSchool.location}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Quick Solver CTA Banner */}
      <div className="p-3">
        <button
          id="sidebar-ai-solver-cta-btn"
          onClick={() => {
            onOpenSolver();
            onCloseMobile();
          }}
          className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold p-3 rounded-2xl shadow-md shadow-blue-500/20 flex items-center justify-between transition transform active:scale-98"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 fill-white text-white animate-pulse" />
            </div>
            <div className="text-right">
              <div className="text-xs font-black">حلال المسائل الذكي</div>
              <div className="text-[10px] text-blue-100 font-medium">تحليل المسائل بالـ OCR</div>
            </div>
          </div>
          <span className="bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-xs">
            OCR
          </span>
        </button>
      </div>

      {/* Navigation Links (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 no-scrollbar">
        {/* Core & Learning Section */}
        <div>
          <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            التعليم والذكاء الاصطناعي
          </div>
          <div className="space-y-1 mt-1">
            {/* Dashboard */}
            <button
              id="sidebar-nav-dashboard"
              onClick={() => handleTabClick('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition text-right ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-extrabold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4 shrink-0" />
                <span>لوحة المتابعة</span>
              </div>
              <ChevronLeft className="w-3.5 h-3.5 opacity-60" />
            </button>

            {/* AI Solver */}
            {(isStudent || isTeacher || isSchoolAdminOrPrincipal || isPlatformAdmin) && (
              <button
                id="sidebar-nav-solver"
                onClick={() => handleTabClick('solver')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition text-right ${
                  activeTab === 'solver'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-extrabold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>حلال المسائل و OCR</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-black ${
                  activeTab === 'solver' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
                }`}>
                  AI
                </span>
              </button>
            )}

            {/* Smart Teacher */}
            {(isStudent || isTeacher || isSchoolAdminOrPrincipal || isPlatformAdmin) && (
              <button
                id="sidebar-nav-smart-teacher"
                onClick={() => handleTabClick('smart-teacher')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition text-right ${
                  activeTab === 'smart-teacher'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-extrabold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Bot className="w-4 h-4 shrink-0" />
                  <span>المعلم الذكي</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-black ${
                  activeTab === 'smart-teacher' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  تفاعلي
                </span>
              </button>
            )}

            {/* Curriculum Library */}
            {(isStudent || isTeacher || isSchoolAdminOrPrincipal || isPlatformAdmin) && (
              <button
                id="sidebar-nav-curriculum"
                onClick={() => handleTabClick('curriculum')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition text-right ${
                  activeTab === 'curriculum'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-extrabold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span>مكتبة المناهج والكتب الوزارية</span>
                </div>
                <ChevronLeft className="w-3.5 h-3.5 opacity-60" />
              </button>
            )}
          </div>
        </div>

        {/* Communication Section */}
        <div>
          <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            التواصل والمجموعات
          </div>
          <div className="space-y-1 mt-1">
            <button
              id="sidebar-nav-messaging"
              onClick={() => handleTabClick('messaging')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition text-right ${
                activeTab === 'messaging'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-extrabold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>المحادثات والتواصل</span>
              </div>
              <ChevronLeft className="w-3.5 h-3.5 opacity-60" />
            </button>
          </div>
        </div>

        {/* School Management & Counseling Section */}
        {(isSchoolAdminOrPrincipal || isCounselor || isPlatformAdmin) && (
          <div>
            <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              الإدارة والإرشاد
            </div>
            <div className="space-y-1 mt-1">
              {/* School Management */}
              {isSchoolAdminOrPrincipal && (
                <button
                  id="sidebar-nav-school-mgmt"
                  onClick={() => handleTabClick('school-mgmt')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition text-right ${
                    activeTab === 'school-mgmt'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-extrabold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <School className="w-4 h-4 shrink-0" />
                    <span>إدارة المدرسة والإحصائيات</span>
                  </div>
                  <ChevronLeft className="w-3.5 h-3.5 opacity-60" />
                </button>
              )}

              {/* Counseling */}
              {(isCounselor || isSchoolAdminOrPrincipal) && (
                <button
                  id="sidebar-nav-counseling"
                  onClick={() => handleTabClick('counseling')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition text-right ${
                    activeTab === 'counseling'
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 font-extrabold'
                      : 'text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>الإرشاد الطلابي والسرية</span>
                  </div>
                  <ChevronLeft className="w-3.5 h-3.5 opacity-60" />
                </button>
              )}

              {/* Platform Admin */}
              {isPlatformAdmin && (
                <button
                  id="sidebar-nav-platform-admin"
                  onClick={() => handleTabClick('platform-admin')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition text-right ${
                    activeTab === 'platform-admin' || activeTab === 'super_admin'
                      ? 'bg-amber-600 text-white shadow-sm shadow-amber-500/20 font-extrabold'
                      : 'text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>لوحة الأدمن العام (Super Admin)</span>
                  </div>
                  <ChevronLeft className="w-3.5 h-3.5 opacity-60" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Card / Login Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/90">
        {currentUser ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs overflow-hidden shrink-0">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  currentUser.fullName?.[0] || 'ح'
                )}
              </div>
              <div className="truncate flex-1">
                <p className="text-xs font-black text-slate-800 truncate">{currentUser.fullName}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                    {roleDisplayNames[currentUser.role] || currentUser.role}
                  </span>
                </div>
              </div>
            </div>

            <button
              id="sidebar-logout-btn"
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl border border-red-100 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        ) : (
          <button
            id="sidebar-login-btn"
            onClick={() => {
              onOpenLoginModal();
              onCloseMobile();
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition"
          >
            <LogIn className="w-4 h-4" />
            <span>تسجيل الدخول للمنصة</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Right Sidebar */}
      <aside
        id="desktop-right-sidebar"
        className="hidden lg:block w-72 h-screen sticky top-0 shrink-0 z-30 shadow-xs"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Right side slide-in) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end" id="mobile-sidebar-drawer">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer Container (Right side) */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-right duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
