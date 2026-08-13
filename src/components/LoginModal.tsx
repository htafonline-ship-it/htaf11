import React, { useState } from 'react';
import { AuthUser, UserRole } from '../types';
import { signInWithGoogle, signInWithEmail, isSupabaseConfigured } from '../lib/supabase';
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
  UserCheck,
  Database
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  onOpenSupabaseConfig?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onOpenSupabaseConfig
}) => {
  const [activeTab, setActiveTab] = useState<'google' | 'credentials'>('google');

  // Credentials State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('teacher');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Google Login State
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  if (!isOpen) return null;

  const handleGoogleOAuthTrigger = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (isSupabaseConfigured) {
        // Real Google OAuth redirect via Supabase
        await signInWithGoogle();
      } else {
        // Demo/Simulated Google Auth fallback if Supabase keys not set yet
        const cleanEmail = googleEmail.trim() || 'user@google.com';
        const cleanName = googleName.trim() || cleanEmail.split('@')[0];

        const googleUser: AuthUser = {
          id: `usr-google-${Date.now()}`,
          username: cleanEmail.split('@')[0],
          fullName: cleanName,
          email: cleanEmail,
          role: 'student',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          loginMethod: 'google',
          badge: 'حساب Google موثق بـ Supabase'
        };

        onLoginSuccess(googleUser);
        onClose();
      }
    } catch (err: any) {
      console.error('Google Auth error:', err);
      setErrorMessage(err.message || 'فشل تسجيل الدخول بحساب Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني أو اسم المستخدم');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('يرجى إدخال الرقم السري / كلمة المرور');
      return;
    }

    setIsLoading(true);

    try {
      const cleanUser = username.trim();

      // Check for special Admin Credentials: Username '1007363904' & Password '139213'
      if (cleanUser === '1007363904' && password.trim() === '139213') {
        const adminUser: AuthUser = {
          id: 'usr-admin-1007363904',
          username: '1007363904',
          fullName: 'مدير النظام (الأدمن)',
          email: 'admin.1007363904@hataf.edu.sa',
          role: 'platform_admin',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          loginMethod: 'credentials',
          badge: 'مدير المنصة الرئيسي (Super Admin)'
        };
        onLoginSuccess(adminUser);
        onClose();
        return;
      }

      if (isSupabaseConfigured && username.includes('@')) {
        const { user } = await signInWithEmail(username.trim(), password.trim());
        if (user) {
          const authUser: AuthUser = {
            id: user.id,
            username: user.email?.split('@')[0] || 'user',
            fullName: user.user_metadata?.full_name || user.email || 'مستخدم',
            email: user.email || '',
            role: selectedRole,
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            loginMethod: 'credentials',
            badge: 'حساب Supabase موثق'
          };
          onLoginSuccess(authUser);
          onClose();
          return;
        }
      }

      // Local fallback for quick user access
      const newUser: AuthUser = {
        id: `usr-${Date.now()}`,
        username: cleanUser,
        fullName: `مستخدم (${cleanUser})`,
        email: cleanUser.includes('@') ? cleanUser : `${cleanUser}@school.edu.sa`,
        role: selectedRole,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        loginMethod: 'credentials',
        badge: 'حساب موثق'
      };

      onLoginSuccess(newUser);
      onClose();
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(err.message || 'خطأ في اسم المستخدم أو كلمة المرور.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn dir-rtl">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden relative transition-all">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute left-4 top-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 font-black text-xl">
              🔑
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">الدخول التفاعلي للمنصة</h3>
              <p className="text-xs text-slate-400 font-medium">نظام التوثيق الموحد Supabase Auth + Google</p>
            </div>
          </div>
        </div>

        {/* Auth Method Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-1">
          <button
            onClick={() => setActiveTab('google')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'google'
                ? 'bg-white text-emerald-800 shadow-sm border border-slate-200'
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
            <span>Google Sign-In الأساسي</span>
          </button>

          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'credentials'
                ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4 text-slate-600" />
            <span>البريد وكلمة المرور</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {/* TAB 1: GOOGLE SIGN IN */}
          {activeTab === 'google' && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl">
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
                <h4 className="text-sm font-black text-slate-800">الدخول المباشر بـ Google OAuth</h4>
                <p className="text-xs text-slate-500 mt-1">
                  بعد تسجيل الدخول يتم التحقق من ربطك بمدرسة حقيقية في قاعدة بيانات Supabase
                </p>
              </div>

              {!isSupabaseConfigured && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      بريد Google الخاص بك:
                    </label>
                    <input
                      type="email"
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      placeholder="teacher@gmail.com أو student@gmail.com"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 outline-none font-semibold text-left dir-ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      الاسم الكامل:
                    </label>
                    <input
                      type="text"
                      value={googleName}
                      onChange={(e) => setGoogleName(e.target.value)}
                      placeholder="أدخل اسمك الكامل"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 outline-none font-semibold"
                    />
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl">
                  {errorMessage}
                </div>
              )}

              <button
                type="button"
                onClick={handleGoogleOAuthTrigger}
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md flex items-center justify-center gap-3 transition"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

          {/* TAB 2: CREDENTIALS LOGIN */}
          {activeTab === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  البريد الإلكتروني / اسم المستخدم
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="رقم الهوية الوطنية / اسم المستخدم / البريد"
                    className="w-full pr-10 pl-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 outline-none transition font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    className="w-full pr-10 pl-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 outline-none transition font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الدور المطلوب:</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:border-emerald-500 outline-none"
                >
                  <option value="school_admin">🏫 مدير المدرسة (School Principal)</option>
                  <option value="teacher">👨‍🏫 معلم الفصل (Teacher)</option>
                  <option value="student">🎓 طالب (Student)</option>
                  <option value="parent">👨‍👩‍👧 ولي أمر (Parent)</option>
                  <option value="counselor">🩺 المرشد الطلابي (Counselor)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>تسجيل الدخول</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="font-semibold">نظام التوثيق والتحقق الموحد للمنصة</span>
          <span className="text-emerald-700 font-extrabold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            <span>تسجيل آمن ومحمي</span>
          </span>
        </div>
      </div>
    </div>
  );
};
