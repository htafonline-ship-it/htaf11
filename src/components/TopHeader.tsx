import React from 'react';
import { UserRole, SchoolTenant, AuthUser } from '../types';
import {
  Menu,
  Sparkles,
  School,
  Building2,
  ChevronDown,
  LogIn,
  LogOut,
  GraduationCap,
  Bot,
  BookOpen,
  MessageSquare,
  ShieldAlert,
  Crown,
  Bell
} from 'lucide-react';

interface TopHeaderProps {
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
  onOpenMobileSidebar: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
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
  onOpenMobileSidebar
}) => {
  const isPlatformAdmin = currentRole === 'super_admin' || currentRole === 'platform_admin';
  const isSchoolAdminOrPrincipal =
    currentRole === 'principal' ||
    currentRole === 'vice_principal' ||
    currentRole === 'school_admin' ||
    currentRole === 'school_manager';

  const tabLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    dashboard: { label: 'لوحة المتابعة الرئيسية', icon: <GraduationCap className="w-4 h-4 text-blue-600" /> },
    solver: { label: 'حلال المسائل الذكي بالـ OCR', icon: <Sparkles className="w-4 h-4 text-blue-600" /> },
    'smart-teacher': { label: 'المعلم الذكي التفاعلي', icon: <Bot className="w-4 h-4 text-emerald-600" /> },
    curriculum: { label: 'مكتبة المناهج والكتب الوزارية', icon: <BookOpen className="w-4 h-4 text-blue-600" /> },
    'school-mgmt': { label: 'إدارة المدرسة والإحصائيات', icon: <School className="w-4 h-4 text-blue-600" /> },
    messaging: { label: 'المحادثات والتواصل المدرسي', icon: <MessageSquare className="w-4 h-4 text-blue-600" /> },
    counseling: { label: 'الإرشاد الطلابي والسرية', icon: <ShieldAlert className="w-4 h-4 text-indigo-600" /> },
    'platform-admin': { label: 'لوحة مدير المنصة (Platform Admin)', icon: <Crown className="w-4 h-4 text-amber-500" /> },
    super_admin: { label: 'لوحة مدير المنصة (Platform Admin)', icon: <Crown className="w-4 h-4 text-amber-500" /> }
  };

  const currentTabInfo = tabLabels[activeTab] || { label: 'الرئيسية', icon: <GraduationCap className="w-4 h-4 text-blue-600" /> };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md text-slate-800 border-b border-slate-200 shadow-xs">
      {/* Top Banner: School Announcement / Circular Preview (if present) */}
      {currentSchool && currentSchool.circulars && currentSchool.circulars.length > 0 && isSchoolAdminOrPrincipal && (
        <div className="bg-blue-50 text-blue-900 px-4 py-1 text-xs flex items-center justify-between border-b border-blue-100">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="bg-blue-600 text-white font-bold px-2 py-0.5 rounded text-[10px] shrink-0 flex items-center gap-1">
              <Bell className="w-3 h-3" />
              تعميم مدرسة {currentSchool.name.split(' ')[0]}
            </span>
            <span className="truncate font-medium">{currentSchool.circulars[0].title}</span>
          </div>
          <button
            onClick={() => setActiveTab('school-mgmt')}
            className="text-blue-700 hover:text-blue-900 underline font-bold text-[11px] shrink-0 me-2"
          >
            عرض التعاميم الرسمية
          </button>
        </div>
      )}

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Right Section: Mobile Menu Trigger + Current Section Breadcrumb */}
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              id="topheader-mobile-menu-btn"
              onClick={onOpenMobileSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition border border-slate-200"
              aria-label="فتح القائمة الجانبية"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Active Tab Page Title Indicator */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200/80">
                {currentTabInfo.icon}
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                  {currentTabInfo.label}
                </h2>
                {currentSchool && (
                  <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                    {currentSchool.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Left Section: Quick AI Solver Button & User Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Solver Quick Launch */}
            <button
              id="topheader-solver-btn"
              onClick={onOpenSolver}
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold px-3 sm:px-4 py-2 rounded-xl text-xs shadow-xs flex items-center gap-1.5 transition transform active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 fill-white animate-pulse" />
              <span className="hidden sm:inline">حلال المسائل</span>
              <span className="bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                OCR
              </span>
            </button>

            {/* User Dropdown / Login */}
            {currentUser ? (
              <div className="relative group">
                <button
                  id="topheader-user-menu-btn"
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs px-3 py-1.5 rounded-xl shadow-xs border border-slate-800 transition"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white text-[11px] overflow-hidden border border-white/20 shrink-0">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      currentUser.fullName?.[0] || 'ح'
                    )}
                  </div>
                  <div className="text-right hidden md:block max-w-[120px] truncate">
                    <span className="font-bold truncate text-[11px] block">{currentUser.fullName}</span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute left-0 top-full mt-1.5 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 hidden group-hover:block z-50">
                  <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/80">
                    <p className="text-xs font-black text-slate-800">{currentUser.fullName}</p>
                    <p className="text-[10px] text-slate-500 truncate dir-ltr text-right">{currentUser.email || currentUser.username}</p>
                  </div>
                  <button
                    id="topheader-dropdown-logout-btn"
                    onClick={onLogout}
                    className="w-full text-right px-3 py-2 text-xs flex items-center gap-2 hover:bg-red-50 text-red-600 font-bold transition mt-1"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                id="topheader-login-btn"
                onClick={onOpenLoginModal}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>تسجيل الدخول</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
