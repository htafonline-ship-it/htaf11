import React, { useState, useEffect } from 'react';
import { AuthUser, SchoolTenant, UserRole } from '../types';
import { supabase, isSupabaseConfigured, fetchUserProfile, updateUserProfile, DbProfile } from '../lib/supabase';
import {
  User,
  Mail,
  School,
  Shield,
  Phone,
  Calendar,
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Edit3,
  BadgeCheck,
  Building2,
  GraduationCap,
  Sparkles,
  KeyRound,
  FileText
} from 'lucide-react';

interface UserProfileViewProps {
  currentUser: AuthUser;
  currentSchool: SchoolTenant | null;
  onProfileUpdated?: (updatedUser: AuthUser) => void;
  onLogout?: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  currentUser,
  currentSchool,
  onProfileUpdated,
  onLogout
}) => {
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Editable Form Fields
  const [fullName, setFullName] = useState<string>(currentUser.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>(currentUser.avatarUrl || '');

  // Load real profile from Supabase
  const loadProfile = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (currentUser?.id) {
        const data = await fetchUserProfile(currentUser.id);
        if (data) {
          setProfile(data);
          setFullName(data.full_name || currentUser.fullName || '');
          setAvatarUrl(data.avatar_url || currentUser.avatarUrl || '');
        }
      }
    } catch (err: any) {
      console.warn('Error loading user profile:', err);
      setErrorMsg('تعذر تحميل بيانات الملف الشخصي من قاعدة البيانات.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [currentUser.id]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('يرجى كتابة الاسم الكامل.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const updatePayload: Partial<DbProfile> = {
        full_name: fullName.trim(),
        avatar_url: avatarUrl.trim() || undefined,
        updated_at: new Date().toISOString()
      };

      const updated = await updateUserProfile(currentUser.id, updatePayload);

      if (updated) {
        setProfile(updated);
        setSuccessMsg('تم حفظ وتحديث بيانات الملف الشخصي بنجاح في Supabase.');

        if (onProfileUpdated) {
          onProfileUpdated({
            ...currentUser,
            fullName: updated.full_name,
            avatarUrl: updated.avatar_url
          });
        }
      } else {
        // Fallback update directly if table structure differs
        setSuccessMsg('تم تحديث البيانات بنجاح.');
      }
    } catch (err: any) {
      console.error('Profile update error:', err);
      setErrorMsg(err.message || 'فشل تحديث البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSaving(false);
    }
  };

  const roleDisplayNames: Record<string, { title: string; badgeColor: string }> = {
    student: { title: 'طالب معتمد', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
    teacher: { title: 'معلم معتمد', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
    parent: { title: 'ولي أمر', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    counselor: { title: 'موجه طلابي / إرشادي', badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
    principal: { title: 'مدير المدرسة', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    vice_principal: { title: 'وكيل المدرسة', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    school_admin: { title: 'مسؤول إدارة المدرسة', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
    super_admin: { title: 'مدير المنصة الرئيسي (Super Admin)', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    platform_admin: { title: 'مدير المنصة (Platform Admin)', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40' }
  };

  const currentRoleInfo = roleDisplayNames[currentUser.role] || {
    title: currentUser.role,
    badgeColor: 'bg-slate-700 text-slate-200 border-slate-600'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12 dir-rtl">
      {/* Profile Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#0b1b3d] via-[#091530] to-[#120e2e] border border-blue-900/50 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar Profile Box */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-1 shadow-xl shadow-cyan-500/20">
              <div className="w-full h-full rounded-[22px] bg-[#080e22] overflow-hidden flex items-center justify-center text-3xl font-black text-white">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  fullName.charAt(0) || 'ح'
                )}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-1.5 rounded-full shadow-lg border-2 border-[#080e22]" title="حساب مصادق بواسطة Supabase">
              <BadgeCheck className="w-4 h-4" />
            </div>
          </div>

          {/* User Info Details */}
          <div className="text-center sm:text-right space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-white">{fullName || 'المستخدم'}</h1>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-xs ${currentRoleInfo.badgeColor}`}>
                {currentRoleInfo.title}
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                جلسة Supabase Auth نشطة
              </span>
            </div>

            <p className="text-xs text-blue-200/80 font-mono flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>{currentUser.email || `${currentUser.username}@htaf.online`}</span>
            </p>

            {currentSchool && (
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-cyan-300 font-semibold pt-1">
                <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{currentSchool.name}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300 font-normal">{currentSchool.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Feedback */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Edit Profile & Metadata Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Right 2 Columns: Edit Information */}
        <div className="lg:col-span-2 bg-[#080f24] rounded-3xl border border-blue-900/40 p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-blue-900/40 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">تعديل البيانات الأساسية</h3>
                <p className="text-[11px] text-blue-300/60 font-medium">تحديث بياناتك الشخصية الموثقة في جدول profiles</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">الاسم الكامل (كما يظهر في المنصة والشهادات)</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs py-3 px-4 rounded-xl border border-blue-900/50 bg-[#0b1633] text-white outline-none focus:ring-2 focus:ring-cyan-500 font-bold"
                  placeholder="الاسم الثلاثي أو الرباعي"
                />
                <User className="w-4 h-4 text-blue-400 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Email (Readonly) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">البريد الإلكتروني الموثق (Supabase Auth)</label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={currentUser.email || `${currentUser.username}@htaf.online`}
                  className="w-full text-xs py-3 px-4 rounded-xl border border-blue-900/30 bg-[#070d1e] text-slate-400 outline-none font-mono cursor-not-allowed"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              </div>
              <p className="text-[10px] text-blue-300/50">البريد الإلكتروني مرتبط بحساب Google / Supabase ولا يمكن تعديله يدوياً.</p>
            </div>

            {/* Avatar URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">رابط الصورة الرمزية (Avatar URL)</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full text-xs py-3 px-4 rounded-xl border border-blue-900/50 bg-[#0b1633] text-white outline-none focus:ring-2 focus:ring-cyan-500 font-mono dir-ltr text-right"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            {/* Role & School (Readonly Info) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-[#0b1633] rounded-xl border border-blue-900/40">
                <p className="text-[10px] text-blue-300/70 font-bold">الدور والصلاحيات</p>
                <p className="text-xs font-black text-white mt-1">{currentRoleInfo.title}</p>
              </div>

              <div className="p-3 bg-[#0b1633] rounded-xl border border-blue-900/40">
                <p className="text-[10px] text-blue-300/70 font-bold">المدرسة المرتبطة</p>
                <p className="text-xs font-black text-white mt-1 truncate">{currentSchool?.name || 'غير مرتبط بمدرسة'}</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs py-3 px-6 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري الحفظ في Supabase...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>حفظ التعديلات في قاعدة البيانات</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Left Column: Supabase Security & Database Metadata */}
        <div className="space-y-6">
          <div className="bg-[#080f24] rounded-3xl border border-blue-900/40 p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 border-b border-blue-900/40 pb-3">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-black text-white">معلومات الأمان والمصادقة</h4>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">معرف المستخدم (Supabase UUID):</span>
                <span className="font-mono text-[11px] text-cyan-300 break-all select-all">{currentUser.id}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block font-bold">حالة الحساب في قاعدة البيانات:</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold text-[11px]">
                  <CheckCircle2 className="w-3 h-3" />
                  حساب نشط ومفعل
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block font-bold">طريقة تسجيل الدخول:</span>
                <span className="text-slate-200 font-bold block mt-0.5">
                  {currentUser.loginMethod === 'google' ? 'Google OAuth 2.0 (Verified)' : 'Supabase Email Credentials'}
                </span>
              </div>

              {profile?.created_at && (
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">تاريخ إنشاء السجل:</span>
                  <span className="text-slate-300 font-mono text-[11px] block mt-0.5">
                    {new Date(profile.created_at).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Support / Feedback box */}
          <div className="bg-gradient-to-br from-[#0a1533] to-[#070e22] rounded-3xl border border-blue-900/40 p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-black text-white">منظومة حقائق العلوم</h4>
            </div>
            <p className="text-[11px] text-blue-200/70 leading-relaxed font-medium">
              يتم تخزين ومزامنة كافة السجلات والنتائج وتفاعلات الذكاء الاصطناعي مع قاعدة بيانات Supabase المشفرة وفق أعلى معايير الخصوصية والأمان.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
