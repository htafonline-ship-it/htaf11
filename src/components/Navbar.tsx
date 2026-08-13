import React from 'react';
import { UserRole, SchoolTenant, AuthUser } from '../types';
import {
  Sparkles,
  GraduationCap,
  School,
  UserCheck,
  BookOpen,
  FileText,
  Clock,
  ShieldAlert,
  ChevronDown,
  BrainCircuit,
  Bot,
  MessageSquare,
  Crown,
  KeyRound,
  LogIn,
  LogOut,
  User,
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  currentSchool: SchoolTenant;
  schools: SchoolTenant[];
  onSchoolChange: (school: SchoolTenant) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSolver: () => void;
  currentUser: AuthUser | null;
  onOpenLoginModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  currentSchool,
  schools,
  onSchoolChange,
  activeTab,
  setActiveTab,
  onOpenSolver,
  currentUser,
  onOpenLoginModal,
  onLogout
}) => {
  const roleLabels: Record<UserRole, { label: string; icon: string; badge: string }> = {
    student: { label: 'طالب', icon: '🎓', badge: 'الصف 3 متوسط' },
    parent: { label: 'ولي أمر', icon: '👨‍👩‍👧', badge: 'متابعة الأبناء' },
    teacher: { label: 'معلم الفصل', icon: '👨‍🏫', badge: 'قسم العلوم والرياضيات' },
    counselor: { label: 'الموجه / المشرف الطلابي', icon: '🩺', badge: 'متابعة السلوك والإرشاد' },
    vice_principal: { label: 'الوكيل (نائب المدير)', icon: '📋', badge: 'سير العملية والجداول' },
    principal: { label: 'مدير المدرسة', icon: '🏫', badge: 'إدارة الكوادر والطلاب' },
    super_admin: { label: 'الأدمن العام الموحد', icon: '👑', badge: 'التحكم العام والأكواد' }
  };

  return (
    <header className="sticky top-0 z-40 bg-white text-slate-800 shadow-sm border-b border-slate-200">
      {/* Top Banner: School Announcement / Circular Preview */}
      {currentSchool.circulars.length > 0 && (
        <div className="bg-blue-50 text-blue-900 px-4 py-1.5 text-xs flex items-center justify-between border-b border-blue-100">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="bg-blue-600 text-white font-bold px-2 py-0.5 rounded text-[10px] shrink-0">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => setActiveTab('dashboard')}
              className="cursor-pointer flex items-center gap-3 group"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <BrainCircuit className="w-6 h-6 text-white font-black" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black tracking-tight text-blue-600 flex items-center gap-1.5">
                    هتاف العاصمي
                  </h1>
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                    منصة ذكية v2.5
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  منصة تعليمية ذكية وحلال المسائل والمناهج
                </p>
              </div>
            </div>

            {/* School Multi-Tenant Selector */}
            <div className="hidden md:flex items-center ms-4 border-r border-slate-200 pr-4">
              <div className="relative group">
                <button className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-xl border border-slate-200 transition">
                  <School className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-bold max-w-[150px] truncate">{currentSchool.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 hidden group-hover:block z-50">
                  <div className="px-3 py-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                    المدارس المسجلة في المنصة (Multi-Tenant)
                  </div>
                  {schools.map((sch) => (
                    <button
                      key={sch.id}
                      onClick={() => onSchoolChange(sch)}
                      className={`w-full text-right px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                        sch.id === currentSchool.id ? 'text-blue-600 font-bold bg-blue-50/60' : 'text-slate-700'
                      }`}
                    >
                      <div className="truncate">
                        <div>{sch.name}</div>
                        <div className="text-[10px] text-slate-400">{sch.location}</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-medium">
                        {sch.slug}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenSolver}
              className="relative group bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md shadow-blue-500/20 flex items-center gap-2 transition transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 fill-white animate-pulse" />
              <span className="hidden md:inline">حلال المسائل الذكي</span>
              <span className="md:hidden">AI Solver</span>
              <span className="bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm">
                OCR
              </span>
            </button>

            {/* Login Status & Profile / Login Button */}
            {currentUser ? (
              <div className="relative group">
                <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs px-3 py-2 rounded-xl shadow-sm border border-slate-800 transition">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white text-[11px] overflow-hidden border border-white/20 shrink-0">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      currentUser.fullName[0]
                    )}
                  </div>
                  <div className="text-right hidden sm:block max-w-[130px] truncate">
                    <div className="font-bold truncate text-[11px]">{currentUser.fullName}</div>
                    <div className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1">
                      {currentUser.loginMethod === 'google' ? (
                        <span>Google OAuth</span>
                      ) : (
                        <span>هوية: {currentUser.username}</span>
                      )}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ms-0.5" />
                </button>

                {/* Logged In Dropdown Menu */}
                <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 hidden group-hover:block z-50">
                  <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                    <p className="text-xs font-black text-slate-800">{currentUser.fullName}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{currentUser.email || currentUser.username}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {currentUser.badge || roleLabels[currentUser.role].label}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {currentUser.loginMethod === 'google' ? 'قوقل' : 'يوزر وباسورد'}
                      </span>
                    </div>
                  </div>

                  <div className="px-2 py-1 text-[10px] text-slate-400 font-bold uppercase">
                    خيارات الحساب
                  </div>

                  <button
                    onClick={onOpenLoginModal}
                    className="w-full text-right px-3 py-2 text-xs flex items-center gap-2 hover:bg-blue-50 text-blue-700 font-bold transition"
                  >
                    <KeyRound className="w-4 h-4 text-blue-600" />
                    <span>تبديل الحساب / الدخول برقم آخر</span>
                  </button>

                  <button
                    onClick={onLogout}
                    className="w-full text-right px-3 py-2 text-xs flex items-center gap-2 hover:bg-red-50 text-red-600 font-bold transition border-t border-slate-100 mt-1"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-2 transition"
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </button>
            )}

            {/* Role Switcher */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs px-2.5 py-2 rounded-xl border border-slate-200 transition">
                <span className="text-base">{roleLabels[currentRole].icon}</span>
                <div className="text-right hidden xl:block">
                  <div className="font-bold text-[11px]">{roleLabels[currentRole].label}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ms-0.5" />
              </button>

              <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 hidden group-hover:block z-50">
                <div className="px-3 py-1.5 text-[10px] text-slate-400 font-bold uppercase border-b border-slate-100">
                  اختر العرض التجريبي (Role View)
                </div>
                {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => onRoleChange(role)}
                    className={`w-full text-right px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 transition ${
                      currentRole === role ? 'text-blue-600 font-bold bg-blue-50/60' : 'text-slate-700'
                    }`}
                  >
                    <span>{roleLabels[role].icon}</span>
                    <div>
                      <div>{roleLabels[role].label}</div>
                      <div className="text-[10px] text-slate-400">{roleLabels[role].badge}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-reverse space-x-1 sm:space-x-2 border-t border-slate-100 pt-2 pb-2.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>لوحة المتابعة</span>
          </button>

          <button
            onClick={() => setActiveTab('solver')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'solver'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>حلال المسائل و OCR</span>
            <span className="bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0.2 rounded font-bold">نشط</span>
          </button>

          <button
            onClick={() => setActiveTab('smart-teacher')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'smart-teacher'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>المعلم الذكي</span>
          </button>

          <button
            onClick={() => setActiveTab('curriculum')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'curriculum'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>مكتبة الكتب الوزارية والمناهج</span>
          </button>

          <button
            onClick={() => setActiveTab('school-mgmt')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'school-mgmt'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <School className="w-4 h-4" />
            <span>إدارة المدرسة والتعاميم</span>
          </button>

          <button
            onClick={() => setActiveTab('messaging')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'messaging'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>المحادثات والتواصل</span>
          </button>

          {(currentRole === 'super_admin' || activeTab === 'super_admin') && (
            <button
              onClick={() => setActiveTab('super_admin')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'super_admin'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                  : 'text-amber-900 bg-amber-100 hover:bg-amber-200'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-500" />
              <span>لوحة الأدمن الموحد والأكواد</span>
            </button>
          )}

          {currentRole === 'counselor' && (
            <button
              onClick={() => setActiveTab('counseling')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'counseling'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>الإرشاد الطلابي والسرية</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
