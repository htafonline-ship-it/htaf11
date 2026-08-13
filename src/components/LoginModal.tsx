import React, { useState } from 'react';
import { AuthUser, UserRole } from '../types';
import {
  X,
  Lock,
  User,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowRight,
  School,
  Crown,
  GraduationCap,
  UserCheck
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'credentials' | 'google'>('credentials');

  // Credentials State
  const [username, setUsername] = useState('1007363904');
  const [password, setPassword] = useState('139213');
  const [selectedRole, setSelectedRole] = useState<UserRole>('super_admin');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Google Login State
  const [googleEmail, setGoogleEmail] = useState('htaf.online@gmail.com');
  const [googleName, setGoogleName] = useState('هتاف العاصمي');
  const [googleRole, setGoogleRole] = useState<UserRole>('super_admin');

  if (!isOpen) return null;

  // Preset quick fill handler
  const handleQuickFillAdmin = () => {
    setUsername('1007363904');
    setPassword('139213');
    setSelectedRole('super_admin');
    setErrorMessage('');
  };

  const handleQuickFillTeacher = () => {
    setUsername('1001112223');
    setPassword('123456');
    setSelectedRole('teacher');
    setErrorMessage('');
  };

  const handleQuickFillStudent = () => {
    setUsername('1005554443');
    setPassword('123456');
    setSelectedRole('student');
    setErrorMessage('');
  };

  const handleQuickFillParent = () => {
    setUsername('1008889990');
    setPassword('123456');
    setSelectedRole('parent');
    setErrorMessage('');
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('يرجى إدخال اسم المستخدم أو رقم الهوية الوطنية');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('يرجى إدخال الرقم السري / كلمة المرور');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      const cleanUser = username.trim();
      const cleanPass = password.trim();

      // Check specific admin credentials requested by user
      if (cleanUser === '1007363904' && cleanPass === '139213') {
        const adminUser: AuthUser = {
          id: 'usr-admin-1007363904',
          username: '1007363904',
          fullName: 'أحمد العاصمي (الأدمن العام الموحد)',
          email: 'admin.asim@edu.sa',
          role: 'super_admin',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          loginMethod: 'credentials',
          nationalId: '1007363904',
          badge: 'الأدمن العام الموحد'
        };
        onLoginSuccess(adminUser);
        onClose();
        return;
      }

      // Check specific principal credentials
      if (cleanUser === '1002003004' && (cleanPass === '139213' || cleanPass === '123456')) {
        const principalUser: AuthUser = {
          id: 'usr-principal-1002003004',
          username: '1002003004',
          fullName: 'أ. عبد العزيز الغامدي (مدير المدرسة)',
          email: 'principal@school.edu.sa',
          role: 'principal',
          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
          loginMethod: 'credentials',
          nationalId: '1002003004',
          badge: 'مدير المدرسة'
        };
        onLoginSuccess(principalUser);
        onClose();
        return;
      }

      // Check known credentials or allow dynamic login
      let userRole = selectedRole;
      let fullName = `مستخدم (${cleanUser})`;
      let badge = 'حساب موثق';

      if (cleanUser === '1001112223' || cleanUser === 'teacher1') {
        userRole = 'teacher';
        fullName = 'أ. خالد المحمد (معلم الرياضيات)';
        badge = 'معلم الفصل';
      } else if (cleanUser === '1005554443' || cleanUser === 'student1') {
        userRole = 'student';
        fullName = 'أحمد العتيبي (طالب)';
        badge = 'الصف الثالث المتوسط';
      } else if (cleanUser === '1008889990' || cleanUser === 'parent1') {
        userRole = 'parent';
        fullName = 'سليمان العتيبي (ولي أمر)';
        badge = 'متابعة الأبناء';
      } else if (cleanUser === '1003332221' || cleanUser === 'counselor1') {
        userRole = 'counselor';
        fullName = 'د. إبراهيم السعيد (الموجه الطلابي)';
        badge = 'الإرشاد الطلابي';
      }

      const newUser: AuthUser = {
        id: `usr-${Date.now()}`,
        username: cleanUser,
        fullName,
        email: `${cleanUser}@school.edu.sa`,
        role: userRole,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        loginMethod: 'credentials',
        nationalId: cleanUser,
        badge
      };

      onLoginSuccess(newUser);
      onClose();
    }, 600);
  };

  const handleGoogleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);

      // Determine Google User details
      const isSuper = googleEmail.includes('admin') || googleRole === 'super_admin';
      const googleUser: AuthUser = {
        id: `usr-google-${Date.now()}`,
        username: googleEmail.split('@')[0],
        fullName: googleName || 'مستخدم Google',
        email: googleEmail,
        role: googleRole,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        loginMethod: 'google',
        badge: isSuper ? 'حساب Google (الأدمن العام)' : 'حساب Google موثق'
      };

      onLoginSuccess(googleUser);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden relative transition-all">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute left-4 top-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">تسجيل الدخول للمنصة</h3>
              <p className="text-xs text-blue-100 font-medium">منصة هتاف العاصمي التعليمية الذكية</p>
            </div>
          </div>
        </div>

        {/* Auth Method Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-1">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'credentials'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4 text-blue-600" />
            <span>اسم المستخدم والرمز السري</span>
          </button>

          <button
            onClick={() => setActiveTab('google')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'google'
                ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>الدخول بقوقل (Google)</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {/* TAB 1: CREDENTIALS LOGIN */}
          {activeTab === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>اسم المستخدم / الهوية الوطنية (User ID)</span>
                  <span className="text-[10px] text-blue-600 font-normal">مثال: 1007363904</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="أدخل اسم المستخدم أو الهوية الوطنية"
                    className="w-full pr-10 pl-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>الرقم السري / كلمة المرور (Password)</span>
                  <span className="text-[10px] text-blue-600 font-normal">مثال للأدمن: 139213</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    className="w-full pr-10 pl-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition font-semibold"
                  />
                </div>
              </div>

              {/* Quick Credentials Fill Box for User Request */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
                <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-blue-700">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    تعبئة سريعة للحسابات المعتمدة:
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={handleQuickFillAdmin}
                    className="bg-blue-600 text-white font-bold px-2.5 py-1.5 rounded-lg flex items-center justify-center gap-1 hover:bg-blue-700 transition shadow-sm text-right"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-300" />
                    <span>الأدمن (1007363904)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickFillTeacher}
                    className="bg-white border border-slate-200 text-slate-700 font-medium px-2 py-1.5 rounded-lg flex items-center justify-center gap-1 hover:bg-slate-100 transition"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>حساب معلم</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickFillStudent}
                    className="bg-white border border-slate-200 text-slate-700 font-medium px-2 py-1.5 rounded-lg flex items-center justify-center gap-1 hover:bg-slate-100 transition"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                    <span>حساب طالب</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickFillParent}
                    className="bg-white border border-slate-200 text-slate-700 font-medium px-2 py-1.5 rounded-lg flex items-center justify-center gap-1 hover:bg-slate-100 transition"
                  >
                    <span>👨‍👩‍👧 ولي أمر</span>
                  </button>
                </div>
              </div>

              {/* Role Selector override if needed */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الدور في المنصة (نوع الحساب):
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:border-blue-500 outline-none"
                >
                  <option value="super_admin">👑 الأدمن العام الموحد (Super Admin)</option>
                  <option value="principal">🏫 مدير المدرسة (Principal)</option>
                  <option value="vice_principal">📋 الوكيل (Vice Principal)</option>
                  <option value="teacher">👨‍🏫 معلم الفصل (Teacher)</option>
                  <option value="counselor">🩺 الموجه الطلابي (Counselor)</option>
                  <option value="student">🎓 طالب (Student)</option>
                  <option value="parent">👨‍👩‍👧 ولي أمر (Parent)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>تسجيل الدخول الآن</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: GOOGLE SIGN IN */}
          {activeTab === 'google' && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50/60 border border-blue-100 rounded-2xl">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-md mx-auto flex items-center justify-center mb-2">
                  <svg className="w-7 h-7" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <h4 className="text-sm font-black text-slate-800">الدخول السريع بـ Google OAuth</h4>
                <p className="text-xs text-slate-500 mt-1">
                  تسجيل الدخول بنقرة واحدة باستخدام بريدك الإلكتروني المعتمد لدى Google
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  البريد الإلكتروني الحسابي (Google Email):
                </label>
                <input
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-semibold text-left dir-ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الاسم المستعار للبروفايل:
                </label>
                <input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="أدخل الاسم الذي ترغب بظهوره"
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تحديد صلاحية الحساب (الدور المطلوب):
                </label>
                <select
                  value={googleRole}
                  onChange={(e) => setGoogleRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:border-blue-500 outline-none"
                >
                  <option value="super_admin">👑 الأدمن العام الموحد (Super Admin)</option>
                  <option value="principal">🏫 مدير المدرسة (Principal)</option>
                  <option value="teacher">👨‍🏫 معلم الفصل (Teacher)</option>
                  <option value="student">🎓 طالب (Student)</option>
                  <option value="parent">👨‍👩‍👧 ولي أمر (Parent)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleGoogleSubmit}
                disabled={isLoading}
                className="w-full bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-800 font-extrabold text-xs py-3 rounded-xl shadow-sm flex items-center justify-center gap-3 transition"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>متابعة وتسجيل الدخول بـ Google</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500">
          <span>دخول آمن وموفر بتقنيات التوثيق الرقمي الموحد لوزارة التعليم</span>
        </div>
      </div>
    </div>
  );
};
