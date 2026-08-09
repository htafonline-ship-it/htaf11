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
  Play
} from 'lucide-react';

interface StudentDashboardProps {
  profile: StudentProfile;
  homeworks: HomeworkAssignment[];
  quizzes: QuizItem[];
  onOpenSolverForHomework: (hw: HomeworkAssignment) => void;
  onUpdateRevisionTask: (taskId: number, completed: boolean) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  profile,
  homeworks,
  quizzes,
  onOpenSolverForHomework,
  onUpdateRevisionTask
}) => {
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Daily Schedule Preset
  const schedule = [
    { period: 1, subject: 'الرياضيات', time: '07:30 - 08:15', room: 'قاعة 302', teacher: 'أ. منصور العتيبي', status: 'done' },
    { period: 2, subject: 'العلوم', time: '08:20 - 09:05', room: 'المختبر 1', teacher: 'أ. د. علي القحطاني', status: 'done' },
    { period: 3, subject: 'اللغة العربية', time: '09:10 - 09:55', room: 'قاعة 302', teacher: 'أ. فهد الزهراني', status: 'current' },
    { period: 4, subject: 'الفيزياء', time: '10:20 - 11:05', room: 'معمل الفيزياء', teacher: 'أ. سعيد الغامدي', status: 'upcoming' },
    { period: 5, subject: 'الدراسات الإسلامية', time: '11:10 - 11:55', room: 'قاعة 302', teacher: 'أ. إبراهيم الدوسري', status: 'upcoming' }
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

  return (
    <div className="space-y-8">
      {/* Top Student Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 rounded-3xl border border-blue-500/30 shadow-xl shadow-blue-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md text-white text-3xl flex items-center justify-center border border-white/30 shrink-0 shadow-inner">
            {profile.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black">أهلاً بك يا {profile.name} 👋</h2>
              <span className="bg-orange-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-sm">
                متفوقة
              </span>
            </div>
            <p className="text-blue-100 text-xs mt-1 font-semibold">{profile.grade}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-blue-100/90 mt-2 font-medium">
              <span>⏱️ وقت الاستخدام اليومي: {profile.screenTimeUsedTodayMinutes} من {profile.screenTimeDailyLimitMinutes} دقيقة</span>
              <span>🤖 الأسئلة الذكية المعالجة: {profile.aiQuestionsCountToday}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-6 relative z-10 shrink-0">
          <div className="text-center">
            <div className="text-2xl font-black text-amber-300">94%</div>
            <div className="text-[10px] text-blue-100 font-bold">المعدل العام</div>
          </div>
          <div className="h-8 w-px bg-white/20"></div>
          <div className="text-center">
            <div className="text-2xl font-black text-white">12/12</div>
            <div className="text-[10px] text-blue-100 font-bold">الواجبات المكتملة</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col (8 cols): Schedule, Homework, AI Revision Plan */}
        <div className="lg:col-span-8 space-y-8">
          {/* Daily Schedule */}
          <div className="bg-white rounded-3xl p-6 shadow-sm shadow-slate-200/50 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                الجدول الدراسي اليومي (حسب توقيت المدرسة)
              </h3>
              <span className="text-xs text-slate-500 font-bold">الأحد، 9 فبراير 2026</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {schedule.map((slot) => (
                <div
                  key={slot.period}
                  className={`p-3 rounded-2xl border text-center transition ${
                    slot.status === 'current'
                      ? 'bg-gradient-to-b from-blue-600 to-indigo-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                      : slot.status === 'done'
                      ? 'bg-slate-100 text-slate-600 border-slate-200 opacity-80'
                      : 'bg-slate-50 text-slate-800 border-slate-200/80'
                  }`}
                >
                  <div className="text-[10px] font-bold opacity-80">الحصة {slot.period}</div>
                  <div className="font-extrabold text-xs my-1">{slot.subject}</div>
                  <div className="text-[10px] opacity-90">{slot.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Revision Plan (Interactive Checklist) */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-800/40 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/30 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  خطة التفوق الذكية قبل الاختبارات
                </div>
                <h3 className="text-xl font-extrabold text-white">{profile.aiRevisionPlan.title}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{profile.aiRevisionPlan.description}</p>
              </div>

              <div className="text-amber-400 font-black text-xl bg-slate-800/90 px-3.5 py-1.5 rounded-xl border border-slate-700">
                {profile.aiRevisionPlan.tasks.filter((t) => t.completed).length} / {profile.aiRevisionPlan.tasks.length}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {profile.aiRevisionPlan.tasks.map((task) => (
                <div
                  key={task.day}
                  onClick={() => onUpdateRevisionTask(task.day, !task.completed)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    task.completed
                      ? 'bg-slate-800/80 text-slate-400 border-slate-700/60 line-through'
                      : 'bg-slate-800 text-slate-100 border-slate-700 hover:border-blue-500/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {task.completed ? (
                      <CheckSquare className="w-5 h-5 text-blue-400 shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                    <span className="text-xs font-medium">
                      اليوم {task.day}: {task.title}
                    </span>
                  </div>

                  <span className="text-[10px] bg-blue-950 text-blue-300 px-2.5 py-0.5 rounded font-bold shrink-0 border border-blue-800">
                    {task.subject}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Homework Assignments */}
          <div className="bg-white rounded-3xl p-6 shadow-sm shadow-slate-200/50 border border-slate-200/80 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              قائمة الواجبات اليومية والمطلوبة ({homeworks.length}):
            </h3>

            <div className="space-y-3">
              {homeworks.map((hw) => (
                <div
                  key={hw.id}
                  className="p-5 rounded-2xl border border-slate-200/80 hover:border-blue-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/60"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-lg">
                        {hw.subject}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">تاريخ التسليم: {hw.dueDate}</span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{hw.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{hw.description}</p>
                  </div>

                  <button
                    onClick={() => onOpenSolverForHomework(hw)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 shrink-0 self-start sm:self-auto transition"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>حل بالذكاء الاصطناعي</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col (4 cols): Quizzes & Subject Performance */}
        <div className="lg:col-span-4 space-y-8">
          {/* Quizzes Drawer Entry Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm shadow-slate-200/50 border border-slate-200/80 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              الاختبارات القصيرة التقييمية ({quizzes.length})
            </h3>

            <div className="space-y-3">
              {quizzes.map((qz) => (
                <div
                  key={qz.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{qz.subject}</span>
                    <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded font-bold">
                      {qz.durationMinutes} دقيقة
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-xs">{qz.title}</h4>

                  <button
                    onClick={() => {
                      setActiveQuiz(qz);
                      setQuizAnswers({});
                      setQuizSubmitted(false);
                      setQuizScore(0);
                    }}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm shadow-blue-500/20"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>بدء الاختبار الآن</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Subjects Mastery Overview */}
          <div className="bg-white rounded-3xl p-6 shadow-sm shadow-slate-200/50 border border-slate-200/80 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              مستوى التحصيل الدراسي الحالي
            </h3>

            <div className="space-y-3">
              {profile.subjectsPerformance.map((sub, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>{sub.subject}</span>
                    <span className="text-blue-600 font-extrabold">{sub.scorePercentage}% ({sub.gradeLetter})</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${sub.scorePercentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* QUIZ INTERACTIVE MODAL */}
      {activeQuiz && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                  {activeQuiz.subject}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{activeQuiz.title}</h3>
              </div>
              <button
                onClick={() => setActiveQuiz(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quiz Questions */}
            <div className="space-y-6">
              {activeQuiz.questions.map((q, qIdx) => (
                <div key={q.id} className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-sm">
                    {qIdx + 1}. {q.question}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oIdx) => {
                      const selected = quizAnswers[q.id] === oIdx;
                      let style = 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100';

                      if (quizSubmitted) {
                        if (oIdx === q.correctAnswer) {
                          style = 'bg-emerald-600 text-white font-bold border-emerald-600';
                        } else if (selected && oIdx !== q.correctAnswer) {
                          style = 'bg-red-100 text-red-900 font-bold border-red-300';
                        }
                      } else if (selected) {
                        style = 'bg-emerald-100 border-emerald-500 font-bold text-emerald-950';
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
                    <div className="p-2.5 bg-white rounded-xl text-xs text-slate-700 border border-slate-200 font-medium">
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Submit / Score Banner */}
            {quizSubmitted ? (
              <div className="p-6 rounded-2xl bg-slate-900 text-white text-center space-y-2">
                <div className="text-3xl font-black text-emerald-400">{quizScore}%</div>
                <p className="text-xs text-slate-300">
                  {quizScore >= 80 ? 'ممتاز جداً! أداء استثنائي وتفوق عالي 🎉' : 'أداء جيد، ننصحك بالرجوع لشرح المعلم الذكي.'}
                </p>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="mt-3 px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
                >
                  إغلاق الاختبار
                </button>
              </div>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(quizAnswers).length < activeQuiz.questions.length}
                className={`w-full py-3 rounded-2xl font-extrabold text-xs transition shadow-lg ${
                  Object.keys(quizAnswers).length < activeQuiz.questions.length
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
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
