import React, { useState } from 'react';
import { HomeworkAssignment, QuizItem } from '../../types';
import { BatchHomeworkUploadModal } from '../BatchHomeworkUploadModal';
import {
  Users,
  Plus,
  Sparkles,
  BookOpen,
  CheckCircle2,
  FileText,
  Loader2,
  GraduationCap,
  FileSpreadsheet,
  Download,
  UserPlus
} from 'lucide-react';

interface TeacherDashboardProps {
  homeworks: HomeworkAssignment[];
  onAddHomework: (hw: HomeworkAssignment) => void;
  onAddQuiz: (quiz: QuizItem) => void;
  onOpenInviteStudentModal?: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  homeworks,
  onAddHomework,
  onAddQuiz,
  onOpenInviteStudentModal
}) => {
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [showBatchHomeworkModal, setShowBatchHomeworkModal] = useState(false);
  const [hwTitle, setHwTitle] = useState('');
  const [hwSubject, setHwSubject] = useState('الرياضيات');
  const [hwDueDate, setHwDueDate] = useState('2026-02-15');
  const [hwDesc, setHwDesc] = useState('');

  const handleBatchAddHomework = (newHws: HomeworkAssignment[]) => {
    newHws.forEach((hw) => onAddHomework(hw));
  };

  // AI Quiz Generator states
  const [showQuizGeneratorModal, setShowQuizGeneratorModal] = useState(false);
  const [quizTopic, setQuizTopic] = useState('');
  const [quizSubject, setQuizSubject] = useState('العلوم');
  const [quizGrade, setQuizGrade] = useState('الصف الثالث المتوسط');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const handleCreateHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwTitle.trim()) return;

    const newHw: HomeworkAssignment = {
      id: `hw-${Date.now()}`,
      title: hwTitle,
      subject: hwSubject,
      dueDate: hwDueDate,
      totalPoints: 10,
      status: 'pending',
      schoolSlug: 'al-namouthajya',
      gradeLevel: 'الثالث المتوسط',
      description: hwDesc
    };

    onAddHomework(newHw);
    setHwTitle('');
    setHwDesc('');
    setShowHomeworkModal(false);
  };

  const handleGenerateAIQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTopic.trim()) return;

    setIsGeneratingQuiz(true);

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: quizTopic,
          subject: quizSubject,
          grade: quizGrade,
          questionsCount: 4
        })
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        const generated: QuizItem = {
          id: `qz-${Date.now()}`,
          title: resData.data.title,
          subject: resData.data.subject,
          durationMinutes: resData.data.durationMinutes || 15,
          status: 'available',
          totalQuestions: resData.data.totalQuestions,
          questions: resData.data.questions
        };

        onAddQuiz(generated);
        setShowQuizGeneratorModal(false);
        setQuizTopic('');
      }
    } catch (err) {
      console.error('Failed to generate quiz:', err);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg shrink-0">
            👨‍🏫
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black">لوحة تحكم المعلم ومربي الصف</h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                إدارة الطلاب والواجبات
              </span>
            </div>
            <p className="text-slate-300 text-xs mt-1">
              إضافة ودعوة الطلاب، إسناد الواجبات، إنشاء الاختبارات بالذكاء الاصطناعي، ومتابعة الاستيعاب.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3 self-end md:self-auto">
          {onOpenInviteStudentModal && (
            <button
              onClick={onOpenInviteStudentModal}
              className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-xs font-black px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ إضافة ودعوة طالب</span>
            </button>
          )}

          <button
            onClick={() => setShowBatchHomeworkModal(true)}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-4 py-2.5 rounded-xl shadow flex items-center gap-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>رفع واجبات بالجملة (Excel)</span>
          </button>

          <button
            onClick={() => setShowHomeworkModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>إسناد واجب جديد</span>
          </button>

          <button
            onClick={() => setShowQuizGeneratorModal(true)}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>اختبار بالذكاء الاصطناعي</span>
          </button>
        </div>
      </div>

      {/* Classes & Homework List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                سجل الواجبات المسندة للطلاب ({homeworks.length})
              </h3>

              <button
                onClick={() => setShowBatchHomeworkModal(true)}
                className="text-xs text-emerald-700 font-extrabold hover:underline flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>رفع ملف واجبات CSV/Excel</span>
              </button>
            </div>

            <div className="space-y-3">
              {homeworks.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-bold">لا توجد واجبات مسندة حتى الآن في Supabase.</p>
                </div>
              ) : (
                homeworks.map((hw) => (
                  <div key={hw.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{hw.title}</span>
                      <span className="text-xs text-emerald-700 font-bold bg-emerald-100 px-2.5 py-0.5 rounded">
                        {hw.subject}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{hw.description}</p>
                    <div className="text-[10px] text-slate-400 font-bold">تاريخ التسليم: {hw.dueDate}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Classes Roster */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                إدارة طلاب الفصول
              </h3>

              {onOpenInviteStudentModal && (
                <button
                  onClick={onOpenInviteStudentModal}
                  className="text-xs font-black text-emerald-700 hover:text-emerald-900 bg-emerald-50 p-1.5 rounded-lg flex items-center gap-1 border border-emerald-200"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ دعوة طالب</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {[
                { name: 'الصف الثالث المتوسط (شعبة 3/أ)', count: 28 },
                { name: 'الصف الثالث المتوسط (شعبة 3/ب)', count: 26 },
                { name: 'الصف الأول الثانوي (شعبة 1/أ)', count: 30 }
              ].map((c, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{c.name}</div>
                    <div className="text-[10px] text-slate-500">{c.count} طالب مسجل</div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">نشط</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* NEW HOMEWORK MODAL */}
      {showHomeworkModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl border border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              إسناد واجب جديد للطلاب
            </h3>

            <form onSubmit={handleCreateHomework} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">عنوان الواجب</label>
                <input
                  type="text"
                  value={hwTitle}
                  onChange={(e) => setHwTitle(e.target.value)}
                  placeholder="مثال: حل مسألة تحليل المعادلات التربيعية"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">المادة</label>
                  <select
                    value={hwSubject}
                    onChange={(e) => setHwSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs"
                  >
                    <option value="الرياضيات">الرياضيات</option>
                    <option value="العلوم">العلوم</option>
                    <option value="الفيزياء">الفيزياء</option>
                    <option value="اللغة العربية">اللغة العربية</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">آخر موعد للتسليم</label>
                  <input
                    type="date"
                    value={hwDueDate}
                    onChange={(e) => setHwDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الوصف والتعليمات</label>
                <textarea
                  rows={3}
                  value={hwDesc}
                  onChange={(e) => setHwDesc(e.target.value)}
                  placeholder="اكتب الأرقام والصفحات المطلوب حلها..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHomeworkModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow"
                >
                  حفظ وإسناد للطلاب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI QUIZ GENERATOR MODAL */}
      {showQuizGeneratorModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl border border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              توليد اختبار قصير بالذكاء الاصطناعي (Gemini)
            </h3>

            <form onSubmit={handleGenerateAIQuiz} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">موضوع الدرس المراد توليد أسئلة له</label>
                <input
                  type="text"
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  placeholder="مثال: التفاعلات الكيميائية وتكافؤ العناصر"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">المادة</label>
                  <select
                    value={quizSubject}
                    onChange={(e) => setQuizSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs"
                  >
                    <option value="العلوم">العلوم</option>
                    <option value="الرياضيات">الرياضيات</option>
                    <option value="الفيزياء">الفيزياء</option>
                    <option value="الكيمياء">الكيمياء</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">الصف</label>
                  <select
                    value={quizGrade}
                    onChange={(e) => setQuizGrade(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs"
                  >
                    <option value="الصف الثالث المتوسط">الصف الثالث المتوسط</option>
                    <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuizGeneratorModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingQuiz}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow flex items-center justify-center gap-2"
                >
                  {isGeneratingQuiz ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري التوليد...</span>
                    </>
                  ) : (
                    <span>توليد وإضافة الاختبار</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BATCH HOMEWORK UPLOAD MODAL */}
      <BatchHomeworkUploadModal
        isOpen={showBatchHomeworkModal}
        onClose={() => setShowBatchHomeworkModal(false)}
        onBatchAddHomework={handleBatchAddHomework}
      />
    </div>
  );
};
