import React, { useState } from 'react';
import { SchoolTenant, SchoolRegistrationCode, CurriculumBook } from '../types';
import { CurriculumImportView } from './CurriculumImportView';
import { KharjSchoolsHub } from './KharjSchoolsHub';
import {
  Crown,
  KeyRound,
  Building2,
  Plus,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ShieldCheck,
  Search,
  Sparkles,
  Users,
  GraduationCap,
  Globe,
  Radio,
  FileSpreadsheet,
  AlertCircle,
  BookOpen,
  Eye,
  EyeOff,
  MapPin,
  Send
} from 'lucide-react';

interface SuperAdminViewProps {
  schools: SchoolTenant[];
  registrationCodes: SchoolRegistrationCode[];
  centralBooks: CurriculumBook[];
  onAddRegistrationCode: (newCode: SchoolRegistrationCode) => void;
  onToggleCodeStatus: (codeId: string) => void;
  onToggleSchoolApproval: (schoolId: string) => void;
  onRegisterSchoolByCode: (school: SchoolTenant, codeUsed: string) => void;
  onAddBook: (book: CurriculumBook) => void;
  onBulkAddBooks: (books: CurriculumBook[]) => void;
  onUpdateBook: (updatedBook: CurriculumBook) => void;
  onReplaceBookVersion: (oldBookId: string, newBook: CurriculumBook) => void;
  onDeleteBook: (bookId: string) => void;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  schools,
  registrationCodes,
  centralBooks,
  onAddRegistrationCode,
  onToggleCodeStatus,
  onToggleSchoolApproval,
  onRegisterSchoolByCode,
  onAddBook,
  onBulkAddBooks,
  onUpdateBook,
  onReplaceBookVersion,
  onDeleteBook
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'codes' | 'schools' | 'new_code' | 'curriculum_import' | 'kharj_schools'>('kharj_schools');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Masking & Security State for Passwords/Credentials
  const [showSecretCode, setShowSecretCode] = useState(false);
  const [showRegistrationCodes, setShowRegistrationCodes] = useState(false);

  // Form for generating new code
  const [cityRegion, setCityRegion] = useState('الرياض');
  const [assignedSchoolName, setAssignedSchoolName] = useState('');
  const [customCodeSuffix, setCustomCodeSuffix] = useState('');
  const [generateSuccessMsg, setGenerateSuccessMsg] = useState<string | null>(null);

  // Form for Registering School directly from Super Admin
  const [showRegModal, setShowRegModal] = useState(false);
  const [regSchoolName, setRegSchoolName] = useState('');
  const [regSchoolNameEn, setRegSchoolNameEn] = useState('');
  const [regCity, setRegCity] = useState('الرياض');
  const [regPrincipalName, setRegPrincipalName] = useState('');
  const [regPrincipalEmail, setRegPrincipalEmail] = useState('');
  const [regCodeInput, setRegCodeInput] = useState('');
  const [regError, setRegError] = useState<string | null>(null);

  const handleCopy = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(codeText);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleGenerateCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const randomNum = Math.floor(10 + Math.random() * 90);
    const suffix = customCodeSuffix.trim() ? customCodeSuffix.toUpperCase().replace(/\s+/g, '-') : `${randomNum}`;
    const codeString = `SCH-2026-${cityRegion.toUpperCase().slice(0, 3)}-${suffix}`;

    const newCodeObj: SchoolRegistrationCode = {
      id: `code-${Date.now()}`,
      code: codeString,
      schoolNameAssigned: assignedSchoolName.trim() || 'غير مخصصة مسبقاً',
      createdDate: new Date().toISOString().split('T')[0],
      status: 'نشط',
      cityRegion
    };

    onAddRegistrationCode(newCodeObj);
    setGenerateSuccessMsg(`تم توليد كود التسجيل المعتمد بنجاح: ${codeString}`);
    setAssignedSchoolName('');
    setCustomCodeSuffix('');
    setTimeout(() => setGenerateSuccessMsg(null), 4000);
  };

  const handleRegisterSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    // Validate code
    const matchingCode = registrationCodes.find(
      (c) => c.code.trim().toUpperCase() === regCodeInput.trim().toUpperCase()
    );

    if (!matchingCode) {
      setRegError('عفواً، كود التسجيل والتفعيل المدخل غير صحيح أو غير موجود بالنظام.');
      return;
    }

    if (matchingCode.status !== 'نشط') {
      setRegError(`عفواً، كود التسجيل هذا حالته (${matchingCode.status}) ولا يمكن استخدامه مجدداً.`);
      return;
    }

    // Create School
    const newSchoolObj: SchoolTenant = {
      id: `school-${Date.now()}`,
      name: regSchoolName,
      nameEn: regSchoolNameEn || 'Smart School Branch',
      slug: regSchoolNameEn.toLowerCase().replace(/\s+/g, '-') || `school-${Date.now()}`,
      logoText: regSchoolName.slice(0, 1),
      badge: 'مدرسة مسجلة بكود معتمد',
      primaryColor: '#059669',
      accentColor: '#10b981',
      motto: 'التميز التعليمي والابتكار الرقمي',
      location: `${regCity} - الفرع الرئيسي`,
      registrationCodeUsed: matchingCode.code,
      isApproved: true,
      principalName: regPrincipalName || 'مدير المدرسة',
      principalEmail: regPrincipalEmail || 'admin@school.edu.sa',
      totalStudentsCount: 0,
      totalTeachersCount: 0,
      circulars: []
    };

    onRegisterSchoolByCode(newSchoolObj, matchingCode.code);
    setShowRegModal(false);
    setRegSchoolName('');
    setRegSchoolNameEn('');
    setRegPrincipalName('');
    setRegPrincipalEmail('');
    setRegCodeInput('');
  };

  const filteredCodes = registrationCodes.filter(
    (c) =>
      c.code.includes(searchQuery) ||
      (c.schoolNameAssigned && c.schoolNameAssigned.includes(searchQuery)) ||
      c.cityRegion.includes(searchQuery)
  );

  const activeCodesCount = registrationCodes.filter((c) => c.status === 'نشط').length;
  const usedCodesCount = registrationCodes.filter((c) => c.status === 'مستخدم').length;

  return (
    <div className="space-y-6">
      {/* Super Admin Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white p-6 sm:p-8 rounded-3xl border border-amber-900/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 text-xs font-black px-3.5 py-1 rounded-full border border-amber-500/30">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>لوحة تحكم الأدمن الموحد للمنصة (Single Super Admin)</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-slate-900/90 text-amber-300 text-[11px] font-mono font-black px-3 py-1 rounded-full border border-amber-500/40">
                <span>الهوية: 1007363904</span>
                <span className="text-slate-500">|</span>
                <span className="flex items-center gap-1.5">
                  <span>الرمز: {showSecretCode ? '139213' : '••••••'}</span>
                  <button
                    onClick={() => setShowSecretCode(!showSecretCode)}
                    className="text-amber-400 hover:text-amber-200 transition p-0.5"
                    title={showSecretCode ? 'إخفاء الرمز' : 'إظهار الرمز'}
                  >
                    {showSecretCode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </span>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              إدارة كودات تسجيل المدارس والتفعيل المركزية
            </h2>
            <p className="text-amber-100/80 text-xs sm:text-sm max-w-2xl leading-relaxed">
              تتيح لك كأدمن رئيسي موحد إصدار وتوليد رموز التفعيل المعتمدة (School Registration Codes)، والموافقة الفورية على تسجيل المدارس الجديدة ومنحها تراخيص المنصة.
            </p>
          </div>

          <button
            onClick={() => setShowRegModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl shadow-xl shadow-amber-500/20 flex items-center gap-2 transition shrink-0"
          >
            <Building2 className="w-4 h-4" />
            <span>تسجيل مدرسة برمز تفعيل جديد</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 border-t border-amber-900/40 pt-4 text-xs">
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-amber-900/30">
            <span className="text-slate-400 font-bold block">إجمالي المدارس المسجلة</span>
            <span className="text-xl font-black text-amber-400 mt-0.5 block">{schools.length} مدرسة</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-amber-900/30">
            <span className="text-slate-400 font-bold block">أكواد التفعيل النشطة</span>
            <span className="text-xl font-black text-emerald-400 mt-0.5 block">{activeCodesCount} كود</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-amber-900/30">
            <span className="text-slate-400 font-bold block">الأكواد المستهلكة</span>
            <span className="text-xl font-black text-blue-400 mt-0.5 block">{usedCodesCount} كود</span>
          </div>
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-amber-900/30">
            <span className="text-slate-400 font-bold block">حالة التراخيص بالمملكة</span>
            <span className="text-xs font-black text-emerald-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>نظام الأكواد آمن 100%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Control Tabs */}
      <div className="flex items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('kharj_schools')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'kharj_schools'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md'
                : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>مدارس ومراكز محافظة الخرج ودعوات الارتباط</span>
          </button>

          <button
            onClick={() => setActiveSubTab('curriculum_import')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'curriculum_import'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-300" />
            <span>استيراد المناهج والكتب (Curriculum Import)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('codes')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'codes'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>أكواد تسجيل المدارس ({registrationCodes.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('new_code')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'new_code'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>توليد كود تسجيلي جديد</span>
          </button>

          <button
            onClick={() => setActiveSubTab('schools')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'schools'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>سجل المدارس المعتمدة ({schools.length})</span>
          </button>
        </div>

        {activeSubTab === 'codes' && (
          <div className="relative shrink-0 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالكود أو اسم المدرسة..."
              className="w-full pr-8 pl-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        )}
      </div>

      {/* KHARJ SCHOOLS & CENTERS INVITATIONS HUB TAB */}
      {activeSubTab === 'kharj_schools' && (
        <KharjSchoolsHub
          onRegisterSchool={onRegisterSchoolByCode}
          onAddRegistrationCode={onAddRegistrationCode}
          existingSchools={schools}
        />
      )}

      {/* CURRICULUM IMPORT TAB */}
      {activeSubTab === 'curriculum_import' && (
        <CurriculumImportView
          centralBooks={centralBooks}
          onAddBook={onAddBook}
          onBulkAddBooks={onBulkAddBooks}
          onUpdateBook={onUpdateBook}
          onReplaceBookVersion={onReplaceBookVersion}
          onDeleteBook={onDeleteBook}
        />
      )}

      {/* CODES TAB */}
      {activeSubTab === 'codes' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-600" />
                <span>سجل أرقام وأكواد التسجيل والتفعيل (School Registration Codes)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                تُعطى هذه الأكواد لمدراء المدارس الجدد ليتمكنوا من إنشاء وتفعيل مدارسهم على المنصة.
              </p>
            </div>

            <button
              onClick={() => setShowRegistrationCodes(!showRegistrationCodes)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-300 flex items-center gap-1.5 transition shrink-0"
            >
              {showRegistrationCodes ? (
                <>
                  <EyeOff className="w-4 h-4 text-amber-600" />
                  <span>إخفاء أرقام الأكواد الحساسة</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-amber-600" />
                  <span>إظهار أرقام الأكواد</span>
                </>
              )}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold">
                  <th className="p-3">كود التسجيل والتفعيل</th>
                  <th className="p-3">المدرسة المخصصة له</th>
                  <th className="p-3">المنطقة / المدينة</th>
                  <th className="p-3">تاريخ الإصدار</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCodes.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-black text-slate-900 flex items-center gap-2">
                      <span className="bg-slate-100 text-amber-900 border border-slate-300 px-2.5 py-1 rounded-lg">
                        {showRegistrationCodes ? c.code : '••••••••••••'}
                      </span>
                      <button
                        onClick={() => handleCopy(c.code)}
                        className="text-slate-400 hover:text-amber-600 transition"
                        title="نسخ الكود"
                      >
                        {copiedCode === c.code ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    <td className="p-3 font-bold text-slate-800">
                      {c.schoolNameAssigned || 'مفتوح لأي مدرسة'}
                    </td>

                    <td className="p-3 font-bold text-slate-600">
                      {c.cityRegion}
                    </td>

                    <td className="p-3 text-slate-500">
                      {c.createdDate}
                    </td>

                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                          c.status === 'نشط'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : c.status === 'مستخدم'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {c.status === 'نشط' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {c.status === 'مستخدم' && <ShieldCheck className="w-3 h-3 text-blue-600" />}
                        {c.status === 'معطل' && <XCircle className="w-3 h-3 text-rose-600" />}
                        <span>{c.status}</span>
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => onToggleCodeStatus(c.id)}
                        className={`text-[11px] font-bold px-3 py-1 rounded-lg transition border ${
                          c.status === 'معطل'
                            ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-rose-100 hover:text-rose-700'
                        }`}
                      >
                        {c.status === 'معطل' ? 'إعادة تنشيط' : 'تعطيل الكود'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* NEW CODE GENERATOR TAB */}
      {activeSubTab === 'new_code' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-6">
          <div>
            <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-600" />
              توليد كود تسجيلي خاص لمدرسة جديدة
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              قم بإنشاء وتحديد منطقة الكود لزيادة الأمان ومنع التسجيل العشوائي.
            </p>
          </div>

          {generateSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{generateSuccessMsg}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleGenerateCodeSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المنطقة أو المدينة التعليمية:</label>
              <select
                value={cityRegion}
                onChange={(e) => setCityRegion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="الرياض">الرياض</option>
                <option value="جدة">جدة</option>
                <option value="الدمام">الدمام والمنطقة الشرقية</option>
                <option value="مكة المكرمة">مكة المكرمة</option>
                <option value="المدينة المنورة">المدينة المنورة</option>
                <option value="عسير والجنوب">عسير والجنوب</option>
                <option value="القصيم">القصيم</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تخصيص الكود لمدرسة معينة (اختياري):</label>
              <input
                type="text"
                value={assignedSchoolName}
                onChange={(e) => setAssignedSchoolName(e.target.value)}
                placeholder="مثال: مدارس الفكر النموذجية"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رمز رمزي مخصص في نهاية الكود (اختياري):</label>
              <input
                type="text"
                value={customCodeSuffix}
                onChange={(e) => setCustomCodeSuffix(e.target.value)}
                placeholder="مثال: VIP-2026"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-lg shadow-amber-600/20 transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>إصدار وتوليد الكود التسجيلي الآن</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* APPROVED SCHOOLS TAB */}
      {activeSubTab === 'schools' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                سجل المدارس المسجلة والمعتمدة بالمنصة
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                جميع المدارس المسجلة عبر كود التسجيل الخاص مع إمكانية المراجعة والتحكم.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schools.map((sch) => (
              <div
                key={sch.id}
                className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 relative flex flex-col justify-between hover:shadow-md transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-emerald-100 text-emerald-900 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full">
                      {sch.badge}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      كود: {sch.registrationCodeUsed || 'مسجلة افتراضياً'}
                    </span>
                  </div>

                  <h4 className="font-black text-slate-900 text-sm">{sch.name}</h4>
                  <p className="text-xs text-slate-500">{sch.location}</p>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-xs space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>مدير المدرسة:</span>
                      <strong className="text-slate-800">{sch.principalName || 'غير محدد'}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>عدد الطلاب:</span>
                      <strong className="text-emerald-700">{sch.totalStudentsCount || 0} طالب</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>مدرسة معتمدة نشطة</span>
                  </span>

                  <button
                    onClick={() => onToggleSchoolApproval(sch.id)}
                    className="text-[11px] font-bold text-slate-500 hover:text-rose-600 underline"
                  >
                    تعليق الترخيص
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REGISTER NEW SCHOOL MODAL */}
      {showRegModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">تسجيل مدرسة جديدة برمز التفعيل</h3>
                  <p className="text-xs text-slate-500">يتطلب كود تسجيلي معتمد صادراً من الأدمن الموحد</p>
                </div>
              </div>
              <button
                onClick={() => setShowRegModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {regError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSchoolSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  كود التسجيل والتفعيل الممنوح (School Code) *
                </label>
                <input
                  type="text"
                  required
                  value={regCodeInput}
                  onChange={(e) => setRegCodeInput(e.target.value)}
                  placeholder="مثال: SCH-2026-VIP-99"
                  className="w-full font-mono bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-black uppercase text-amber-900 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المدرسة الرسمي بالعربية *</label>
                <input
                  type="text"
                  required
                  value={regSchoolName}
                  onChange={(e) => setRegSchoolName(e.target.value)}
                  placeholder="مثال: مدرسة الرياض العالمية الذكية"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المدينة *</label>
                  <select
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="الرياض">الرياض</option>
                    <option value="جدة">جدة</option>
                    <option value="الدمام">الدمام</option>
                    <option value="مكة المكرمة">مكة المكرمة</option>
                    <option value="المدينة المنورة">المدينة المنورة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم مدير المدرسة *</label>
                  <input
                    type="text"
                    required
                    value={regPrincipalName}
                    onChange={(e) => setRegPrincipalName(e.target.value)}
                    placeholder="د. فهد السلمان"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني للإدارة</label>
                <input
                  type="email"
                  value={regPrincipalEmail}
                  onChange={(e) => setRegPrincipalEmail(e.target.value)}
                  placeholder="admin@school.edu.sa"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-600/20 transition flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  <span>تأكيد تسجيل المدرسة وتحقيق الكود</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
