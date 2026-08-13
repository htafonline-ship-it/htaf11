import React, { useState } from 'react';
import { CurriculumBook, EducationalStage, CurriculumSyncStatus } from '../types';
import { CURRICULUM_BOOKS, INITIAL_CURRICULUM_SYNC_STATUS } from '../data/mockData';
import { ReportPdfExportModal } from './ReportPdfExportModal';
import { InteractiveBookPageReader } from './InteractiveBookPageReader';
import {
  BookOpen,
  Search,
  Sparkles,
  Layers,
  FileText,
  BookmarkCheck,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Clock,
  ShieldCheck,
  Globe,
  Radio,
  GraduationCap,
  School,
  Filter,
  XCircle,
  Tag,
  Compass,
  Printer,
  Eye,
  Target,
  HelpCircle
} from 'lucide-react';

interface CurriculumLibraryViewProps {
  centralBooks?: CurriculumBook[];
  onSelectTopicForSolver: (text: string, subject: string, grade: string) => void;
  onSelectTopicForTeacher: (subject: string, grade: string) => void;
}

export const CurriculumLibraryView: React.FC<CurriculumLibraryViewProps> = ({
  centralBooks = CURRICULUM_BOOKS,
  onSelectTopicForSolver,
  onSelectTopicForTeacher
}) => {
  const activeBooks = centralBooks.filter((b) => b.is_active !== false);

  const [selectedStage, setSelectedStage] = useState<EducationalStage | 'all'>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<number | 'all'>('all');
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBook, setActiveBook] = useState<CurriculumBook | null>(activeBooks[0] || null);

  // Interactive Book Page Reader state
  const [readerBook, setReaderBook] = useState<CurriculumBook | null>(null);
  const [readerPage, setReaderPage] = useState<number>(1);
  const [readerTab, setReaderTab] = useState<'reader' | 'summary' | 'solve' | 'quiz'>('reader');

  // PDF Export Modal State
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfExportType, setPdfExportType] = useState<'curriculum_single' | 'curriculum_stage'>('curriculum_single');
  const [pdfSelectedBook, setPdfSelectedBook] = useState<CurriculumBook | undefined>(undefined);

  // Sync state
  const [syncStatus, setSyncStatus] = useState<CurriculumSyncStatus>(INITIAL_CURRICULUM_SYNC_STATUS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleManualSync = () => {
    setIsSyncing(true);
    setSyncMessage('جاري الاتصال ببوابة عين الوطنية ومدرستي للتحقق من المناهج المحدثة...');

    setTimeout(() => {
      setIsSyncing(false);
      const now = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
      setSyncStatus((prev) => ({
        ...prev,
        lastSyncTime: `اليوم، ${now}`,
        syncLogs: [
          {
            id: `log-${Date.now()}`,
            timestamp: `اليوم ${now}`,
            title: 'استنزال ومطابقة كامل كتب الفصل الدراسي مع البوابات المعتمدة',
            source: 'بوابة عين الوطنية (ien.edu.sa)',
            status: 'تم التحديث',
            details: 'تمت المزامنة بنجاح 100% مع كتب وخطط التوزيع الوزارية للعام 1448هـ - 2027م.'
          },
          ...prev.syncLogs
        ]
      }));
      setSyncMessage('تم التحديث والمزامنة مع بوابة "عين" ومنصة "مدرستي" بنجاح!');
      setTimeout(() => setSyncMessage(null), 5000);
    }, 2000);
  };

  // Counts for Stage Classification Cards
  const primaryCount = activeBooks.filter((b) => b.stage === 'primary').length;
  const middleCount = activeBooks.filter((b) => b.stage === 'middle').length;
  const secondaryCount = activeBooks.filter((b) => b.stage === 'secondary').length;

  // Grade level options based on stage
  const getGradeOptions = () => {
    if (selectedStage === 'primary') {
      return [
        { id: 'all', label: 'كافة صفوف الابتدائي' },
        { id: 'الصف الأول الابتدائي', label: 'الصف الأول' },
        { id: 'الصف الثاني الابتدائي', label: 'الصف الثاني' },
        { id: 'الصف الثالث الابتدائي', label: 'الصف الثالث' },
        { id: 'الصف الرابع الابتدائي', label: 'الصف الرابع' },
        { id: 'الصف الخامس الابتدائي', label: 'الصف الخامس' },
        { id: 'الصف السادس الابتدائي', label: 'الصف السادس' }
      ];
    }
    if (selectedStage === 'middle') {
      return [
        { id: 'all', label: 'كافة صفوف المتوسط' },
        { id: 'الصف الأول المتوسط', label: 'الأول المتوسط' },
        { id: 'الصف الثاني المتوسط', label: 'الثاني المتوسط' },
        { id: 'الصف الثالث المتوسط', label: 'الثالث المتوسط' }
      ];
    }
    if (selectedStage === 'secondary') {
      return [
        { id: 'all', label: 'كافة صفوف الثانوي' },
        { id: 'الصف الأول الثانوي', label: 'الأول الثانوي' },
        { id: 'الصف الثاني الثانوي', label: 'الثاني الثانوي' },
        { id: 'الصف الثالث الثانوي', label: 'الثالث الثانوي' }
      ];
    }
    return [
      { id: 'all', label: 'كافة الصفوف' },
      { id: 'الابتدائي', label: 'صفوف الابتدائي' },
      { id: 'المتوسط', label: 'صفوف المتوسط' },
      { id: 'الثانوي', label: 'صفوف الثانوي' }
    ];
  };

  // Extract unique subjects from books matching stage
  const availableSubjects = Array.from(
    new Set(
      activeBooks
        .filter((b) => selectedStage === 'all' || b.stage === selectedStage)
        .map((b) => b.subject)
    )
  );

  const filteredBooks = activeBooks.filter((book) => {
    const matchesStage = selectedStage === 'all' || book.stage === selectedStage;
    const matchesGrade =
      selectedGrade === 'all' || book.grade === selectedGrade || book.grade.includes(selectedGrade);
    const matchesSubject = selectedSubject === 'all' || book.subject === selectedSubject;
    const matchesTerm = selectedTerm === 'all' || book.term === selectedTerm;
    const matchesTrack = selectedTrack === 'all' || (book.track && book.track === selectedTrack);
    const matchesSearch =
      !searchQuery ||
      book.title.includes(searchQuery) ||
      book.subject.includes(searchQuery) ||
      book.grade.includes(searchQuery) ||
      book.chapters.some(
        (c) =>
          c.title.includes(searchQuery) ||
          (c.topics && c.topics.some((t) => t.includes(searchQuery)))
      );

    return matchesStage && matchesGrade && matchesSubject && matchesTerm && matchesTrack && matchesSearch;
  });

  const handleResetFilters = () => {
    setSelectedStage('all');
    setSelectedGrade('all');
    setSelectedSubject('all');
    setSelectedTerm('all');
    setSelectedTrack('all');
    setSearchQuery('');
  };

  const isFiltered =
    selectedStage !== 'all' ||
    selectedGrade !== 'all' ||
    selectedSubject !== 'all' ||
    selectedTerm !== 'all' ||
    selectedTrack !== 'all' ||
    searchQuery !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Saudi Curriculum Sync Status Bar */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                🇸🇦
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white">المناهج الرقمية السعودية الجديدة (Saudi Curriculum Sync)</h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  مباشر عين & مدرستي
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تحديث تلقائي مستمر • ربط بـ <strong>بوابة عين الوطنية</strong> و<strong>منصة مدرستي</strong> (طبعة 1448هـ - 2027م)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto justify-between md:justify-end">
            <div className="text-right text-[11px] text-slate-400">
              <div>آخر مزامنة ناجحة: <strong className="text-slate-200">{syncStatus.lastSyncTime}</strong></div>
              <div>المقررات المعتمدة: <strong className="text-emerald-400">{syncStatus.syncedBooksCount} كتاباً</strong></div>
            </div>

            <button
              onClick={() => {
                setPdfExportType('curriculum_stage');
                setShowPdfModal(true);
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-2xl border border-slate-700 flex items-center gap-1.5 transition shrink-0"
              title="تصدير تقرير المناهج والمقررات المعتمدة كملف PDF"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>تصدير تقرير المناهج (PDF)</span>
            </button>

            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'جاري المزامنة...' : 'تحديث المناهج الآن'}</span>
            </button>
          </div>
        </div>

        {syncMessage && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded-2xl font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Sync Sources badges */}
        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          <span className="text-slate-400 font-bold">مصادر المزامنة الرسمية:</span>
          {syncStatus.portalSources.map((src, i) => (
            <span key={i} className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1">
              <Globe className="w-3 h-3 text-emerald-400" />
              <span>{src}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30 mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            إصدارات وكتب وزارة التعليم المعتمدة
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            مكتبة المناهج والمقررات الدراسية
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
            استعرض المناهج والكتب المعتمدة بجميع المراحل (الابتدائي، المتوسط، الثانوي) مع الفلترة الديناميكية والفصول التفاعلية.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن مادة، كتاب، صف، أو درس..."
            className="w-full bg-slate-800/90 border border-slate-700 text-white text-xs rounded-2xl pr-10 pl-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* EDUCATIONAL STAGE CLASSIFICATION CARDS */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-sm text-slate-800 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <School className="w-4 h-4 text-emerald-600" />
            <span>نظام التصنيف حسب المرحلة الدراسية:</span>
          </span>
          <span className="text-xs text-slate-500">اختر المرحلة للتصفية السريعة</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* All Stages Card */}
          <div
            onClick={() => {
              setSelectedStage('all');
              setSelectedGrade('all');
            }}
            className={`p-4 rounded-3xl border cursor-pointer transition-all flex items-center justify-between ${
              selectedStage === 'all'
                ? 'bg-slate-900 text-white border-slate-800 shadow-xl ring-2 ring-emerald-500'
                : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-sm">كافة المراحل الدراسية</h4>
                <p className={`text-[11px] mt-0.5 ${selectedStage === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
                  جميع المناهج والمقررات
                </p>
              </div>
            </div>
            <span className={`text-xs font-black px-2.5 py-1 rounded-full ${selectedStage === 'all' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-100 text-slate-700'}`}>
              {activeBooks.length} كتب
            </span>
          </div>

          {/* Primary Stage Card */}
          <div
            onClick={() => {
              setSelectedStage('primary');
              setSelectedGrade('all');
            }}
            className={`p-4 rounded-3xl border cursor-pointer transition-all flex items-center justify-between ${
              selectedStage === 'primary'
                ? 'bg-emerald-900 text-white border-emerald-700 shadow-xl ring-2 ring-emerald-400'
                : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-400 hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-black text-sm">المرحلة الابتدائية</h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <p className={`text-[11px] mt-0.5 ${selectedStage === 'primary' ? 'text-emerald-200' : 'text-slate-500'}`}>
                  الصفوف (1 - 6)
                </p>
              </div>
            </div>
            <span className={`text-xs font-black px-2.5 py-1 rounded-full ${selectedStage === 'primary' ? 'bg-emerald-400 text-emerald-950' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
              {primaryCount} كتب
            </span>
          </div>

          {/* Middle Stage Card */}
          <div
            onClick={() => {
              setSelectedStage('middle');
              setSelectedGrade('all');
            }}
            className={`p-4 rounded-3xl border cursor-pointer transition-all flex items-center justify-between ${
              selectedStage === 'middle'
                ? 'bg-sky-900 text-white border-sky-700 shadow-xl ring-2 ring-sky-400'
                : 'bg-white text-slate-800 border-slate-200 hover:border-sky-400 hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <School className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-black text-sm">المرحلة المتوسطة</h4>
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                </div>
                <p className={`text-[11px] mt-0.5 ${selectedStage === 'middle' ? 'text-sky-200' : 'text-slate-500'}`}>
                  الصفوف (1 - 3)
                </p>
              </div>
            </div>
            <span className={`text-xs font-black px-2.5 py-1 rounded-full ${selectedStage === 'middle' ? 'bg-sky-400 text-sky-950' : 'bg-sky-50 text-sky-800 border border-sky-200'}`}>
              {middleCount} كتب
            </span>
          </div>

          {/* Secondary Stage Card */}
          <div
            onClick={() => {
              setSelectedStage('secondary');
              setSelectedGrade('all');
            }}
            className={`p-4 rounded-3xl border cursor-pointer transition-all flex items-center justify-between ${
              selectedStage === 'secondary'
                ? 'bg-purple-900 text-white border-purple-700 shadow-xl ring-2 ring-purple-400'
                : 'bg-white text-slate-800 border-slate-200 hover:border-purple-400 hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-black text-sm">المرحلة الثانوية</h4>
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                </div>
                <p className={`text-[11px] mt-0.5 ${selectedStage === 'secondary' ? 'text-purple-200' : 'text-slate-500'}`}>
                  نظام المسارات المحدث
                </p>
              </div>
            </div>
            <span className={`text-xs font-black px-2.5 py-1 rounded-full ${selectedStage === 'secondary' ? 'bg-purple-400 text-purple-950' : 'bg-purple-50 text-purple-800 border border-purple-200'}`}>
              {secondaryCount} كتب
            </span>
          </div>
        </div>
      </div>

      {/* DYNAMIC FILTERS TOOLBAR */}
      <div className="space-y-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        {/* Dynamic Grade Level Chips */}
        <div className="space-y-2">
          <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <span>الصف الدراسي المخصص:</span>
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {getGradeOptions().map((grd) => (
              <button
                key={grd.id}
                onClick={() => setSelectedGrade(grd.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition whitespace-nowrap border ${
                  selectedGrade === grd.id
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {grd.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Subject Categories & Term Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 border-t border-slate-100 pt-4 text-xs">
          {/* Subject Categories */}
          <div className="md:col-span-7 space-y-2">
            <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              <span>تصفية المادة / الفرع العلمي:</span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedSubject('all')}
                className={`px-3 py-1 rounded-lg font-bold border transition ${
                  selectedSubject === 'all'
                    ? 'bg-slate-900 text-white border-slate-800'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                كافة المواد
              </button>
              {availableSubjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-1 rounded-lg font-bold border transition ${
                    selectedSubject === sub
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Terms & Secondary Tracks */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-700">الفصل الدراسي:</span>
              {[
                { id: 'all', label: 'الكل' },
                { id: 1, label: 'الفصل 1' },
                { id: 2, label: 'الفصل 2' },
                { id: 3, label: 'الفصل 3' }
              ].map((term) => (
                <button
                  key={term.id}
                  onClick={() => setSelectedTerm(term.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-bold border transition ${
                    selectedTerm === term.id
                      ? 'bg-slate-900 text-white border-slate-800'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {term.label}
                </button>
              ))}
            </div>

            {selectedStage === 'secondary' && (
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-700">المسار:</span>
                {['all', 'المسار العام', 'مسار الصحة والحياة', 'مسار الهندسة والحاسب'].map((trk) => (
                  <button
                    key={trk}
                    onClick={() => setSelectedTrack(trk)}
                    className={`px-2.5 py-1 rounded-lg font-bold border transition text-[11px] ${
                      selectedTrack === trk
                        ? 'bg-purple-600 text-white border-purple-500'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {trk === 'all' ? 'الكل' : trk.replace('مسار ', '')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Summary Bar & Reset Button */}
        {isFiltered && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200/80 text-xs text-emerald-900">
            <div className="flex flex-wrap items-center gap-2 font-bold">
              <span>الفلاتر النشطة:</span>
              {selectedStage !== 'all' && (
                <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md text-[11px]">
                  مرحلة:{' '}
                  {selectedStage === 'primary'
                    ? 'الابتدائية'
                    : selectedStage === 'middle'
                    ? 'المتوسطة'
                    : 'الثانوية'}
                </span>
              )}
              {selectedGrade !== 'all' && (
                <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md text-[11px]">
                  {selectedGrade}
                </span>
              )}
              {selectedSubject !== 'all' && (
                <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md text-[11px]">
                  مادة: {selectedSubject}
                </span>
              )}
              {selectedTerm !== 'all' && (
                <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md text-[11px]">
                  الفصل {selectedTerm}
                </span>
              )}
              {searchQuery && (
                <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md text-[11px]">
                  بحث: "{searchQuery}"
                </span>
              )}
            </div>

            <button
              onClick={handleResetFilters}
              className="text-rose-700 hover:text-rose-900 font-extrabold flex items-center gap-1 hover:underline text-xs"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>إعادة ضبط الفلاتر</span>
            </button>
          </div>
        )}
      </div>

      {/* Books Grid & Chapter Details Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Books List */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <span>المقررات المعروضة ({filteredBooks.length})</span>
            </span>
            <span className="text-xs text-slate-500 font-normal">
              من إجمالي {activeBooks.length} كتب
            </span>
          </h3>

          {filteredBooks.length > 0 ? (
            <div className="space-y-3">
              {filteredBooks.map((book) => {
                const isSelected = activeBook?.id === book.id;

                // Color badge according to stage
                const getStageBadge = (stage: EducationalStage) => {
                  if (stage === 'primary') {
                    return (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-200">
                        الابتدائية 🟢
                      </span>
                    );
                  }
                  if (stage === 'middle') {
                    return (
                      <span className="bg-sky-100 text-sky-800 text-[10px] font-black px-2 py-0.5 rounded border border-sky-200">
                        المتوسطة 🔵
                      </span>
                    );
                  }
                  return (
                    <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2 py-0.5 rounded border border-purple-200">
                      الثانوية 🟣
                    </span>
                  );
                };

                return (
                  <div
                    key={book.id}
                    onClick={() => setActiveBook(book)}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-800 shadow-xl'
                        : 'bg-white text-slate-900 border-slate-200 hover:border-emerald-400 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 text-2xl flex items-center justify-center shrink-0">
                        {book.coverIcon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-sm">{book.title}</h4>
                          {getStageBadge(book.stage)}
                          {book.isLatestSync && (
                            <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded">
                              جديد عين
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {book.grade} • الفصل {book.term} {book.track ? `• ${book.track}` : ''}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                            {book.totalPages} صفحة
                          </span>
                          <span className="text-[10px] text-slate-400">{book.editionYear}</span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-5 h-5 transition-transform ${
                        isSelected ? 'text-emerald-400 rotate-180' : 'text-slate-400'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600">
                لا توجد نتائج مطابقة للفلاتر المحددة حالياً.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                إلغاء جميع الفلاتر
              </button>
            </div>
          )}
        </div>

        {/* Right: Selected Book Chapters & Topics Details */}
        <div className="lg:col-span-7">
          {activeBook ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
              {/* Book Header */}
              <div className="flex flex-col sm:flex-row items-start justify-between border-b border-slate-100 pb-6 gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="bg-emerald-100 text-emerald-900 font-extrabold text-xs px-3 py-1 rounded-full">
                      {activeBook.subject}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">{activeBook.grade}</span>
                    {activeBook.stage === 'primary' && (
                      <span className="bg-emerald-50 text-emerald-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                        المرحلة الابتدائية
                      </span>
                    )}
                    {activeBook.stage === 'middle' && (
                      <span className="bg-sky-50 text-sky-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-sky-200">
                        المرحلة المتوسطة
                      </span>
                    )}
                    {activeBook.stage === 'secondary' && (
                      <span className="bg-purple-50 text-purple-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-purple-200">
                        المرحلة الثانوية
                      </span>
                    )}
                    {activeBook.track && (
                      <span className="bg-indigo-100 text-indigo-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                        {activeBook.track}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">{activeBook.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{activeBook.editionYear}</p>
                </div>

                <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setReaderBook(activeBook);
                      setReaderPage(1);
                      setReaderTab('reader');
                    }}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs px-4 py-3 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
                  >
                    <BookOpen className="w-4 h-4 text-emerald-200" />
                    <span>📖 فتح الكتاب وتصفح وحل أي صفحة</span>
                  </button>

                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => {
                        setReaderBook(activeBook);
                        setReaderPage(1);
                        setReaderTab('summary');
                      }}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-extrabold text-[10px] py-2 rounded-xl flex items-center justify-center gap-1 transition"
                      title="تلخيص مفاهيم الصفحة بالذكاء الاصطناعي"
                    >
                      <FileText className="w-3 h-3 text-amber-600" />
                      <span>تلخيص الصفحة</span>
                    </button>

                    <button
                      onClick={() => {
                        setReaderBook(activeBook);
                        setReaderPage(1);
                        setReaderTab('solve');
                      }}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-extrabold text-[10px] py-2 rounded-xl flex items-center justify-center gap-1 transition"
                      title="حل كافة تمارين الصفحة بالخطوات"
                    >
                      <Sparkles className="w-3 h-3 text-blue-600" />
                      <span>حل الصفحة</span>
                    </button>

                    <button
                      onClick={() => {
                        setReaderBook(activeBook);
                        setReaderPage(1);
                        setReaderTab('quiz');
                      }}
                      className="bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-extrabold text-[10px] py-2 rounded-xl flex items-center justify-center gap-1 transition"
                      title="اختبار تجريبي تقييمي لمدى استيعابك للصفحة"
                    >
                      <Target className="w-3 h-3 text-purple-600" />
                      <span>اختبار فهمك</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setPdfExportType('curriculum_single');
                      setPdfSelectedBook(activeBook);
                      setShowPdfModal(true);
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md flex items-center justify-center gap-2 transition"
                  >
                    <Printer className="w-4 h-4 text-emerald-400" />
                    <span>تصدير تقرير المقرر (PDF)</span>
                  </button>

                  <button
                    onClick={() => onSelectTopicForTeacher(activeBook.subject, activeBook.grade)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-4 py-2 rounded-xl shadow-md flex items-center justify-center gap-2 transition"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>شرح المادة مع المعلم الذكي</span>
                  </button>
                </div>
              </div>

              {/* Chapters List */}
              <div className="space-y-6">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  فصول ودروس الكتاب ({activeBook.chapters.length} فصول):
                </h4>

                <div className="space-y-4">
                  {activeBook.chapters.map((ch) => (
                    <div
                      key={ch.id}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200/60 pb-3 gap-2">
                        <div>
                          <h5 className="font-extrabold text-slate-900 text-sm">{ch.title}</h5>
                          {ch.pageStart && (
                            <span className="text-[11px] font-bold text-emerald-800">
                              نطاق الصفحات: ({ch.pageStart} - {ch.pageEnd})
                            </span>
                          )}
                        </div>

                        {/* Chapter Quick Page Actions */}
                        {ch.pageStart && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => {
                                setReaderBook(activeBook);
                                setReaderPage(ch.pageStart || 1);
                                setReaderTab('reader');
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 transition shadow-sm"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>استعراض ص {ch.pageStart}</span>
                            </button>

                            <button
                              onClick={() => {
                                setReaderBook(activeBook);
                                setReaderPage(ch.pageStart || 1);
                                setReaderTab('summary');
                              }}
                              className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-extrabold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition"
                            >
                              <FileText className="w-3.5 h-3.5 text-amber-700" />
                              <span>تلخيص</span>
                            </button>

                            <button
                              onClick={() => {
                                setReaderBook(activeBook);
                                setReaderPage(ch.pageStart || 1);
                                setReaderTab('solve');
                              }}
                              className="bg-blue-100 hover:bg-blue-200 text-blue-900 text-[11px] font-extrabold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                              <span>حل التمارين</span>
                            </button>

                            <button
                              onClick={() => {
                                setReaderBook(activeBook);
                                setReaderPage(ch.pageStart || 1);
                                setReaderTab('quiz');
                              }}
                              className="bg-purple-100 hover:bg-purple-200 text-purple-900 text-[11px] font-extrabold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition"
                            >
                              <Target className="w-3.5 h-3.5 text-purple-700" />
                              <span>اختبار فهمك</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-600">المواضيع والدروس التفصيلية:</div>
                        <ul className="space-y-1.5">
                          {ch.topics && ch.topics.map((topic, tIdx) => (
                            <li
                              key={tIdx}
                              className="text-xs text-slate-800 flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200"
                            >
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{topic}</span>
                              </div>

                              <button
                                onClick={() =>
                                  onSelectTopicForSolver(
                                    `اشرح واحل مسألة على درس: ${topic} من ${activeBook.title} صفحة ${ch.pageStart || 1}`,
                                    activeBook.subject,
                                    activeBook.grade
                                  )
                                }
                                className="text-emerald-700 hover:text-emerald-900 font-extrabold text-[11px] flex items-center gap-1 hover:underline shrink-0"
                              >
                                <Sparkles className="w-3 h-3 text-emerald-600" />
                                <span>حل المسائل بالذكاء الاصطناعي</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-3xl p-12 text-center text-slate-400 border border-slate-200">
              اختر كتاباً دراسياً من القائمة لعرض الفصول والدروس
            </div>
          )}
        </div>
      </div>

      {/* CURRICULUM REPORT PDF EXPORT MODAL */}
      <ReportPdfExportModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        type={pdfExportType}
        book={pdfSelectedBook || activeBook || undefined}
        books={filteredBooks}
        stageLabel={
          selectedStage === 'primary'
            ? 'المرحلة الابتدائية'
            : selectedStage === 'middle'
            ? 'المرحلة المتوسطة'
            : selectedStage === 'secondary'
            ? 'المرحلة الثانوية'
            : 'كافة المراحل الدراسية'
        }
      />

      {/* INTERACTIVE DIGITAL BOOK PAGE READER MODAL */}
      {readerBook && (
        <InteractiveBookPageReader
          book={readerBook}
          initialPageNumber={readerPage}
          initialTab={readerTab}
          onClose={() => setReaderBook(null)}
          onOpenTeacherWithTopic={(subject, grade) => onSelectTopicForTeacher(subject, grade)}
          onOpenSolverWithQuestion={(question, subject, grade) => onSelectTopicForSolver(question, subject, grade)}
        />
      )}
    </div>
  );
};


