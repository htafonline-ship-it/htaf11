import React from 'react';
import { UserRole, SchoolTenant } from '../types';
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
  KeyRound
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
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  currentSchool,
  schools,
  onSchoolChange,
  activeTab,
  setActiveTab,
  onOpenSolver
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

          {/* Action Button: Flagship AI Solver */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSolver}
              className="relative group bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md shadow-blue-500/20 flex items-center gap-2 transition transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 fill-white animate-pulse" />
              <span>حلال المسائل الذكي (AI Solver)</span>
              <span className="bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm">
                OCR
              </span>
            </button>

            {/* Role Switcher */}
            <div className="relative group">
              <button className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-200 transition">
                <span className="text-base">{roleLabels[currentRole].icon}</span>
                <div className="text-right hidden sm:block">
                  <div className="font-bold">{roleLabels[currentRole].label}</div>
                  <div className="text-[10px] text-blue-600 font-semibold">{roleLabels[currentRole].badge}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ms-1" />
              </button>

              <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 hidden group-hover:block z-50">
                <div className="px-3 py-1.5 text-[10px] text-slate-400 font-bold uppercase border-b border-slate-100">
                  اختر دورك التجريبي (Role View)
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
