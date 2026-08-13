import React, { useState } from 'react';
import { StudentProfile, HomeworkAssignment, QuizItem } from '../../types';
import {
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Award,
  BarChart3,
  CheckSquare,
  Square,
  ChevronLeft,
  X,
  Play,
  ScanLine,
  Bot,
  MessageSquare,
  FileCheck2,
  TrendingUp,
  Flame,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  ArrowRight,
  ShieldCheck,
  Search,
  BookMarked,
  Layers
} from 'lucide-react';

interface StudentDashboardProps {
  profile: StudentProfile;
  homeworks: HomeworkAssignment[];
  quizzes: QuizItem[];
  onOpenSolverForHomework: (hw: HomeworkAssignment) => void;
  onUpdateRevisionTask: (taskId: number, completed: boolean) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenSolver?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  profile,
  homeworks,
  quizzes,
  onOpenSolverForHomework,
  onUpdateRevisionTask,
  onNavigateTab,
  onOpenSolver
}) => {
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Active Tool Card highlight state
  const [activeCardId, setActiveCardId] = useState<string>('ocr-solver');

  // Help Center FAQ expansion states
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Daily Schedule Preset with Arabic RTL structure
  const schedule = [
    { period: 1, subject: 'الرياضيات المتقدمة', time: '07:30 - 08:15', room: 'قاعة 302', teacher: 'أ. منصور العتيبي', status: 'done', topic: 'حساب التكامل والتطبيقات' },
    { period: 2, subject: 'الفيزياء', time: '08:20 - 09:05', room: 'المختبر 1', teacher: 'أ. د. علي القحطاني', status: 'done', topic: 'الموجات الكهرومغناطيسية' },
    { period: 3, subject: 'اللغة العربية', time: '09:10 - 09:55', room: 'قاعة 302', teacher: 'أ. فهد الزهراني', status: 'current', topic: 'البلاغة والنقد الأدبي' },
    { period: 4, subject: 'الكيمياء العامة', time: '10:20 - 11:05', room: 'معمل الكيمياء', teacher: 'أ. سعيد الغامدي', status: 'upcoming', topic: 'الاتزان الكيميائي' },
    { period: 5, subject: 'الدراسات الإسلامية', time: '11:10 - 11:55', room: 'قاعة 302', teacher: 'أ. إبراهيم الدوسري', status: 'upcoming', topic: 'أصول الفقه' }
  ];

  // Primary Feature Tool Cards Configuration
  const mainFeatureCards = [
    {
      id: 'ocr-solver',
      title: 'حل المسائل الذكي OCR',
      subtitle: 'مسح فوري وتحليل خطوة بخطوة',
      description: 'التقط صورة لمسألتك بالمعادلات أو النصوص عبر الكاميرا، واحصل على الحل النموذجي المفصّل مع الشرح المفهومي فورياً.',
      icon: <ScanLine className="w-7 h-7 text-cyan-400 group-hover:rotate-6 transition-transform duration-300" />,
      badges: ['ذكاء اصطناعي فائق', 'دقة OCR 99%'],
      accentColor: 'from-cyan-500/20 via-blue-500/20 to-indigo-500/20',
      glowColor: 'border-cyan-500/40 text-cyan-300 shadow-cyan-500/20',
      btnText: 'بدء مسح المسألة الآن',
      btnGlow: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25',
      action: () => onOpenSolver ? onOpenSolver() : (onNavigateTab && onNavigateTab('solver'))
    },
    {
      id: 'smart-teacher',
      title: 'المعلم الذكي التفاعلي',
      subtitle: 'حوار تعليمي مخصص 24/7',
      description: 'مساعدك الشخصي المدعوم بأحدث نماذج Gemini لشرح الدروس المعقدة، ضرب الأمثلة الواقعية، والإجابة على أي تساؤل دراسي.',
      icon: <Bot className="w-7 h-7 text-purple-400 group-hover:scale-110 transition-transform duration-300" />,
      badges: ['متاح 24/7', 'شرح حسب مستواك'],
      accentColor: 'from-purple-500/20 via-fuchsia-500/20 to-pink-500/20',
      glowColor: 'border-purple-500/40 text-purple-300 shadow-purple-500/20',
      btnText: 'محاورة المعلم الذكي',
      btnGlow: 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-lg shadow-purple-500/25',
      action: () => onNavigateTab && onNavigateTab('smart-teacher')
    },
    {
      id: 'quizzes',
      title: 'الاختبارات والتقييمات',
      subtitle: 'بنك أسئلة تشخيصية وتقييم فوري',
      description: 'اختبر استيعابك للمفاهيم عبر اختبارات قياسية تفاعلية مع تصحيح ذكي وتغذية راجعة تشرح أسباب الإجابة الصحيحة.',
      icon: <FileCheck2 className="w-7 h-7 text-amber-400 group-hover:-rotate-6 transition-transform duration-300" />,
      badges: ['تصحيح فوري', `${quizzes.length} اختبارات متاحة`],
      accentColor: 'from-amber-500/20 via-orange-500/20 to-yellow-500/20',
      glowColor: 'border-amber-500/40 text-amber-300 shadow-amber-500/20',
      btnText: 'بدء التقييم الذاتي',
      btnGlow: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg shadow-amber-500/25',
      action: () => {
        if (quizzes.length > 0) {
          setActiveQuiz(quizzes[0]);
          setQuizAnswers({});
          setQuizSubmitted(false);
          setQuizScore(0);
        }
      }
    },
    {
      id: 'curriculum',
      title: 'المناهج والكتب المعتمدة',
      subtitle: 'مكتبة وزارة التعليم بنماذج 3D',
      description: 'تصفح كافة الكتب والمقررات الوزارية المعتمدة لجميع المراحل مع محتوى تفاعلي ثلاثي الأبعاد وروابط مباشرة للفصول.',
      icon: <BookOpen className="w-7 h-7 text-blue-400 group-hover:scale-110 transition-transform duration-300" />,
      badges: ['مناهج معتمدة', 'قارئ 3D تفاعلي'],
      accentColor: 'from-blue-500/20 via-indigo-500/20 to-sky-500/20',
      glowColor: 'border-blue-500/40 text-blue-300 shadow-blue-500/20',
      btnText: 'تصفح مكتبة المقررات',
      btnGlow: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25',
      action: () => onNavigateTab && onNavigateTab('curriculum')
    },
    {
      id: 'reports',
      title: 'التقارير والإحصائيات',
      subtitle: 'تحليلات التفوق ومسار التحصيل',
      description: 'متابعة بصرية دقيقة لمعدلك التراكمي، ونسب الاستيعاب في كل مادة، وساعات المذاكرة، وتوصيات الذكاء الاصطناعي للتحسين.',
      icon: <TrendingUp className="w-7 h-7 text-emerald-400 group-hover:translate-y-[-2px] transition-transform duration-300" />,
      badges: ['معدل تراكمي 94%', 'تحليل ذكي مستمر'],
      accentColor: 'from-emerald-500/20 via-teal-500/20 to-cyan-500/20',
      glowColor: 'border-emerald-500/40 text-emerald-300 shadow-emerald-500/20',
      btnText: 'عرض تقرير الأداء',
      btnGlow: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25',
      action: () => {
        const elem = document.getElementById('academic-performance-section');
        elem?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      id: 'messaging',
      title: 'المحادثات والتواصل المدرسي',
      subtitle: 'قنوات النقاش ومجموعات المذاكرة',
      description: 'تواصل مباشرة مع معلمي المواد والزملاء في مجموعات المذاكرة المعتمدة لطرح التساؤلات وتبادل الملخصات الصفية بأمان.',
      icon: <MessageSquare className="w-7 h-7 text-rose-400 group-hover:rotate-12 transition-transform duration-300" />,
      badges: ['مجموعات آمنة', 'إشراف المعلم'],
      accentColor: 'from-rose-500/20 via-purple-500/20 to-indigo-500/20',
      glowColor: 'border-rose-500/40 text-rose-300 shadow-rose-500/20',
      btnText: 'الانتقال لغرف المحادثة',
      btnGlow: 'bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white shadow-lg shadow-rose-500/25',
      action: () => onNavigateTab && onNavigateTab('messaging')
    }
  ];

  // Frequently Asked Questions for Help Center
  const faqs = [
    {
      q: 'كيف يعمل حلاّل المسائل بالـ OCR في منصة «حتّان»؟',
      a: 'يمكنك التقاط صورة أو رفع ملف لمسألة من كتابك المدرسي أو ورقة الواجب، وسيقوم محرك الذكاء الاصطناعي بتحليل النص والمعادلات الرياضية أو العلمية بدقة، وتقديم شرح تدريجي خطوة بخطوة مع القوانين المستخدمة.'
    },
    {
      q: 'هل إجاباتي واستفساراتي مع المعلم الذكي خاصة؟',
      a: 'نعم، تحافظ المنصة على خصوصية الطالب الكاملة، ويتم تخصيص الشروحات والمستويات بناءً على مسار تقدمك الدراسي لضمان أقصى فائدة معرفية.'
    },
    {
      q: 'كيف أتمكن من استعراض النماذج ثلاثية الأبعاد 3D للمناهج؟',
      a: 'من خلال مكتبة المناهج والكتب، اختر الكتاب والموضوع الذي يحتوي على علامة 3D التفاعلية لفتح المجسمات التشريحية والفيزيائية التفاعلية.'
    }
  ];

  const handleSelectQuizOption = (qId: string, optIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;
    let correctCount = 0;
    activeQuiz.questions.forEach((q) => {
      if (quizAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const finalScorePct = Math.round((correctCount / activeQuiz.questions.length) * 100);
    setQuizScore(finalScorePct);
    setQuizSubmitted(true);
  };

  const completedRevisionCount = profile.aiRevisionPlan.tasks.filter((t) => t.completed).length;
  const totalRevisionCount = profile.aiRevisionPlan.tasks.length;
  const revisionProgressPct = Math.round((completedRevisionCount / (totalRevisionCount || 1)) * 100);

  return (
    <div className="space-y-10 selection:bg-cyan-500 selection:text-slate-950">
      {/* 1. TOP HERO: WELCOME & STUDENT INTELLIGENCE STATS */}
      <section className="relative rounded-3xl p-6 sm:p-9 overflow-hidden border border-blue-500/25 bg-gradient-to-br from-[#0c1633] via-[#091228] to-[#060b18] shadow-2xl shadow-blue-950/40">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Student Identity & Greeting */}
          <div className="flex items-start sm:items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-[2px] shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full rounded-2xl bg-[#081024] flex items-center justify-center text-4xl overflow-hidden">
                  {profile.avatar || '🎓'}
                </div>
              </div>
              <div className="absolute -bottom-1 -left-1 bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-[#081024] flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                متصل
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  مرحباً بك، <span className="bg-gradient-to-r from-cyan-400 via-blue-300 to-purple-300 bg-clip-text text-transparent">{profile.name}</span> 👋
                </h1>
                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 text-xs font-black px-3 py-1 rounded-full border border-amber-500/30">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  طالب متميز • المستوى الثالث
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-200/80 font-medium">
                {profile.grade} • منصة «حتّان» التعليمية الذكية
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300/80 pt-1">
                <span className="flex items-center gap-1.5 bg-blue-950/60 text-cyan-300 px-2.5 py-1 rounded-lg border border-blue-800/40">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  {profile.aiQuestionsCountToday} مسألة ذكية معالجة اليوم
                </span>
                <span className="flex items-center gap-1.5 bg-blue-950/60 text-purple-300 px-2.5 py-1 rounded-lg border border-purple-800/40">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  {profile.screenTimeUsedTodayMinutes} من {profile.screenTimeDailyLimitMinutes} دقيقة مذاكرة
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full lg:w-auto shrink-0">
            {/* GPA */}
            <div className="bg-[#0b142c]/90 border border-amber-500/30 p-3.5 sm:p-4 rounded-2xl text-center shadow-lg relative group overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-60" />
              <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">94%</div>
              <div className="text-[11px] text-amber-200/80 font-bold mt-0.5">المعدل العام</div>
              <div className="text-[9px] text-emerald-400 font-bold mt-1">↑ +2.4% هذا الشهر</div>
            </div>

            {/* Completed Homework */}
            <div className="bg-[#0b142c]/90 border border-cyan-500/30 p-3.5 sm:p-4 rounded-2xl text-center shadow-lg relative group overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />
              <div className="text-2xl sm:text-3xl font-black text-cyan-400 tracking-tight">12/12</div>
              <div className="text-[11px] text-cyan-200/80 font-bold mt-0.5">الواجبات</div>
              <div className="text-[9px] text-cyan-300 font-bold mt-1">مكتملة بالكامل ✓</div>
            </div>

            {/* Daily Streak */}
            <div className="bg-[#0b142c]/90 border border-purple-500/30 p-3.5 sm:p-4 rounded-2xl text-center shadow-lg relative group overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-60" />
              <div className="text-2xl sm:text-3xl font-black text-purple-400 tracking-tight flex items-center justify-center gap-1">
                <span>14</span>
                <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
              <div className="text-[11px] text-purple-200/80 font-bold mt-0.5">أيام متتالية</div>
              <div className="text-[9px] text-purple-300 font-bold mt-1">نشاط وتفوق مستمر</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PRIMARY FEATURE TOOL CARDS (Large, Glowing Border on Hover, Smooth Elevation) */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-900/40 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
              <span>الأدوات والأقسام التعليمية الذكية</span>
            </h2>
            <p className="text-xs text-blue-200/70 mt-1 font-medium">
              اختر الأداة المطلوبة للبدء بالحل، المذاكرة، أو استعراض المقررات والاختبارات
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-cyan-300/80 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/40">
              مدعوم بنماذج Gemini 2.5 الفائقة
            </span>
          </div>
        </div>

        {/* 6 Large Interactive Glowing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mainFeatureCards.map((card) => {
            const isActive = activeCardId === card.id;
            return (
              <div
                key={card.id}
                id={`feature-card-${card.id}`}
                onClick={() => setActiveCardId(card.id)}
                className={`hattan-interactive-card group p-6 sm:p-7 flex flex-col justify-between cursor-pointer ${
                  isActive ? 'is-active ring-1 ring-cyan-500/40' : ''
                }`}
              >
                {/* Subtle Ambient Background Gradient */}
                <div className={`absolute -top-16 -right-16 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity bg-gradient-to-br ${card.accentColor}`} />

                <div className="space-y-4 relative z-10">
                  {/* Top Row: Icon & Badges */}
                  <div className="flex items-center justify-between">
                    <div className={`w-14 h-14 rounded-2xl bg-[#0b1633] border border-blue-500/30 flex items-center justify-center p-3 shadow-inner group-hover:border-cyan-400/60 transition-colors`}>
                      {card.icon}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 justify-end">
                      {card.badges.map((badge, bIdx) => (
                        <span
                          key={bIdx}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-950/80 text-blue-200 border border-blue-800/50 group-hover:border-cyan-500/40 transition-colors"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs font-semibold text-blue-300/80 mt-0.5">
                      {card.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300/80 leading-relaxed font-medium">
                    {card.description}
                  </p>
                </div>

                {/* Bottom CTA Action Button */}
                <div className="pt-6 relative z-10">
                  <button
                    id={`btn-action-${card.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      card.action();
                    }}
                    className={`w-full py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all transform active:scale-98 ${card.btnGlow}`}
                  >
                    <span>{card.btnText}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-[-3px] transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. DAILY SCHEDULE (الجدول الدراسي اليومي) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base sm:text-lg">
                الجدول الدراسي اليومي
              </h3>
              <p className="text-[11px] text-blue-200/60 font-medium">
                توقيت الحصص والقاعات الدراسية المعتمدة
              </p>
            </div>
          </div>
          <span className="text-xs text-cyan-300 font-bold bg-[#0b1633] px-3 py-1.5 rounded-xl border border-blue-800/50">
            الأحد • الفصل الدراسي الثاني 2026
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {schedule.map((slot) => {
            const isCurrent = slot.status === 'current';
            const isDone = slot.status === 'done';

            return (
              <div
                key={slot.period}
                className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-gradient-to-b from-[#13234d] to-[#0d1736] border-cyan-400/60 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40'
                    : isDone
                    ? 'bg-[#091024]/70 border-slate-800/80 text-slate-400'
                    : 'bg-[#0b142c]/90 border-blue-900/40 text-slate-200 hover:border-blue-700/50'
                }`}
              >
                {isCurrent && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-cyan-500/20 text-cyan-300 text-[9px] font-black px-2 py-0.5 rounded-full border border-cyan-400/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    مباشر الآن
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                    <span className={isCurrent ? 'text-cyan-300' : 'text-blue-300/70'}>
                      الحصة {slot.period}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {slot.time}
                    </span>
                  </div>

                  <h4 className={`font-black text-sm my-1 ${isCurrent ? 'text-white' : isDone ? 'text-slate-300 line-through' : 'text-white'}`}>
                    {slot.subject}
                  </h4>

                  <p className="text-[11px] text-slate-400/90 font-medium">
                    {slot.topic}
                  </p>
                </div>

                <div className="pt-3 mt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{slot.room}</span>
                  <span className="truncate max-w-[90px]">{slot.teacher}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. UPCOMING QUIZZES & ACTIVE HOMEWORKS SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Quizzes & Homework with OCR Solver Trigger */}
        <div className="lg:col-span-7 space-y-6">
          {/* Upcoming Quizzes */}
          <div className="bg-[#0b142c]/90 border border-blue-900/40 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-blue-900/30 pb-3">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                الاختبارات والتقييمات القصيرة القادمة ({quizzes.length})
              </h3>
              <span className="text-xs text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-800/40 font-bold">
                تقييم تشخيصي
              </span>
            </div>

            <div className="space-y-3">
              {quizzes.map((qz) => (
                <div
                  key={qz.id}
                  className="p-4 rounded-2xl bg-[#080e22] border border-blue-900/40 hover:border-cyan-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-800/50 px-2.5 py-0.5 rounded-md">
                        {qz.subject}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        ⏱️ {qz.durationMinutes} دقيقة • {qz.questions.length} أسئلة
                      </span>
                    </div>
                    <h4 className="font-extrabold text-white text-sm">{qz.title}</h4>
                  </div>

                  <button
                    onClick={() => {
                      setActiveQuiz(qz);
                      setQuizAnswers({});
                      setQuizSubmitted(false);
                      setQuizScore(0);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 shrink-0 transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>بدء الاختبار الآن</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Homeworks */}
          <div className="bg-[#0b142c]/90 border border-blue-900/40 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-blue-900/30 pb-3">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                الواجبات والمهام المدرسية المطلوبة ({homeworks.length})
              </h3>
              <span className="text-xs text-cyan-300 font-bold">
                تسليم إلكتروني مباشر
              </span>
            </div>

            <div className="space-y-3">
              {homeworks.map((hw) => (
                <div
                  key={hw.id}
                  className="p-4 rounded-2xl bg-[#080e22] border border-blue-900/40 hover:border-purple-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-purple-300 bg-purple-950/70 border border-purple-800/50 px-2.5 py-0.5 rounded-md">
                        {hw.subject}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">موعد التسليم: {hw.dueDate}</span>
                    </div>
                    <h4 className="font-extrabold text-white text-sm">{hw.title}</h4>
                    <p className="text-xs text-slate-300/80 leading-relaxed font-medium">{hw.description}</p>
                  </div>

                  <button
                    onClick={() => onOpenSolverForHomework(hw)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 shrink-0 transition"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>حل بالذكاء الاصطناعي</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): AI Revision Plan & Subject Mastery */}
        <div className="lg:col-span-5 space-y-6">
          {/* 5. AI EXCELLENCE & REVISION PLAN (خطة التفوق والتقدم) */}
          <div className="bg-gradient-to-br from-[#121c3d] via-[#0d1633] to-[#070d1e] text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-cyan-500/30 space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between relative z-10">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-cyan-500/20 text-cyan-300 text-xs font-bold px-3 py-1 rounded-full border border-cyan-500/30 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  خطة التفوق الذكية قبل الاختبارات
                </div>
                <h3 className="text-lg font-black text-white">{profile.aiRevisionPlan.title}</h3>
                <p className="text-xs text-blue-200/80 mt-1 leading-relaxed">{profile.aiRevisionPlan.description}</p>
              </div>

              <div className="text-cyan-400 font-black text-lg bg-[#070e24] px-3.5 py-1.5 rounded-xl border border-cyan-500/40 shrink-0">
                {completedRevisionCount} / {totalRevisionCount}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 relative z-10">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>نسبة إنجاز الخطة</span>
                <span className="text-cyan-300 font-extrabold">{revisionProgressPct}%</span>
              </div>
              <div className="w-full bg-[#070e24] rounded-full h-2.5 overflow-hidden border border-blue-900/40">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${revisionProgressPct}%` }}
                />
              </div>
            </div>

            {/* Checklist items */}
            <div className="space-y-2.5 pt-1 relative z-10">
              {profile.aiRevisionPlan.tasks.map((task) => (
                <div
                  key={task.day}
                  onClick={() => onUpdateRevisionTask(task.day, !task.completed)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    task.completed
                      ? 'bg-[#081024]/80 text-slate-400 border-slate-800 line-through'
                      : 'bg-[#0a132c] text-slate-100 border-blue-900/50 hover:border-cyan-400/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {task.completed ? (
                      <CheckSquare className="w-5 h-5 text-cyan-400 shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-500 shrink-0" />
                    )}
                    <span className="text-xs font-medium">
                      اليوم {task.day}: {task.title}
                    </span>
                  </div>

                  <span className="text-[10px] bg-blue-950/80 text-cyan-300 px-2 py-0.5 rounded font-bold shrink-0 border border-blue-800/40">
                    {task.subject}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Performance / Mastery Overview */}
          <div id="academic-performance-section" className="bg-[#0b142c]/90 border border-blue-900/40 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-blue-900/30 pb-3">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                مستوى التحصيل الدراسي الحالي
              </h3>
              <span className="text-xs text-cyan-300 font-bold">معدل 94%</span>
            </div>

            <div className="space-y-3">
              {profile.subjectsPerformance.map((sub, idx) => (
                <div key={idx} className="space-y-1.5 bg-[#080e22] p-3 rounded-2xl border border-blue-900/30">
                  <div className="flex justify-between text-xs font-bold text-slate-200">
                    <span>{sub.subject}</span>
                    <span className="text-cyan-400 font-extrabold">{sub.scorePercentage}% ({sub.gradeLetter})</span>
                  </div>
                  <div className="w-full bg-[#060b18] rounded-full h-2 overflow-hidden border border-blue-950">
                    <div
                      className="bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${sub.scorePercentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. HELP & SUPPORT CENTER (مركز المساعدة والدعم الذكي) */}
      <section className="bg-gradient-to-br from-[#0b1530] via-[#080f24] to-[#050a18] border border-blue-800/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-900/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-white text-lg">
                مركز المساعدة والدعم الذكي
              </h3>
              <p className="text-xs text-blue-200/70 font-medium">
                إجابات سريعة وإرشادات لاستخدام أدوات منصة «حتّان»
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab && onNavigateTab('counseling')}
              className="px-4 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900/80 text-indigo-300 text-xs font-bold border border-indigo-700/50 transition flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>تواصل مع المرشد الطلابي (سري)</span>
            </button>
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isExp = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#080e22] border border-blue-900/40 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedFaq(isExp ? null : idx)}
                  className="w-full p-4 text-right flex items-center justify-between gap-3 text-xs sm:text-sm font-extrabold text-slate-100 hover:text-cyan-300 transition"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-cyan-400 font-black">؟</span>
                    <span>{faq.q}</span>
                  </span>
                  {isExp ? (
                    <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isExp && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-blue-900/30 font-medium bg-[#060b1b]/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* QUIZ INTERACTIVE MODAL */}
      {activeQuiz && (
        <div className="fixed inset-0 bg-[#040814]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b142c] text-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl border border-cyan-500/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-blue-900/40 pb-4">
              <div>
                <span className="text-xs font-bold text-cyan-300 bg-cyan-950 px-2.5 py-0.5 rounded-md border border-cyan-800/50">
                  {activeQuiz.subject}
                </span>
                <h3 className="text-lg font-black text-white mt-1.5">{activeQuiz.title}</h3>
              </div>
              <button
                onClick={() => setActiveQuiz(null)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quiz Questions */}
            <div className="space-y-6">
              {activeQuiz.questions.map((q, qIdx) => (
                <div key={q.id} className="space-y-3 p-4 rounded-2xl bg-[#080e22] border border-blue-900/40">
                  <h4 className="font-bold text-white text-sm">
                    {qIdx + 1}. {q.question}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oIdx) => {
                      const selected = quizAnswers[q.id] === oIdx;
                      let style = 'bg-[#0b142c] border-blue-900/50 text-slate-200 hover:bg-[#101c3e] hover:border-cyan-500/40';

                      if (quizSubmitted) {
                        if (oIdx === q.correctAnswer) {
                          style = 'bg-emerald-600 text-white font-bold border-emerald-500 shadow-md shadow-emerald-600/30';
                        } else if (selected && oIdx !== q.correctAnswer) {
                          style = 'bg-rose-950/80 text-rose-200 font-bold border-rose-600';
                        }
                      } else if (selected) {
                        style = 'bg-cyan-950 border-cyan-400 font-bold text-cyan-300 shadow-md shadow-cyan-500/20';
                      }

                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectQuizOption(q.id, oIdx)}
                          className={`p-3 text-right rounded-xl border text-xs transition ${style}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="p-3 bg-[#0b1633] rounded-xl text-xs text-cyan-200 border border-cyan-800/40 font-medium">
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Submit / Score Banner */}
            {quizSubmitted ? (
              <div className="p-6 rounded-2xl bg-[#070e24] text-white text-center space-y-2 border border-cyan-500/30">
                <div className="text-4xl font-black text-cyan-400">{quizScore}%</div>
                <p className="text-xs text-slate-300 font-medium">
                  {quizScore >= 80 ? 'أداء استثنائي وتفوق عالي! تم تسجيل النتيجة في سجلك الدراسي 🎉' : 'أداء جيد، يمكنك مراجعة الأسئلة مع المعلم الذكي لتعزيز الاستيعاب.'}
                </p>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="mt-3 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25"
                >
                  إغلاق الاختبار
                </button>
              </div>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(quizAnswers).length < activeQuiz.questions.length}
                className={`w-full py-3.5 rounded-2xl font-extrabold text-xs transition shadow-lg ${
                  Object.keys(quizAnswers).length < activeQuiz.questions.length
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none border border-slate-700'
                    : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-cyan-500/25'
                }`}
              >
                تسليم إجابات الاختبار وحساب النتيجة
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
