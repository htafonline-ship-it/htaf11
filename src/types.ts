export type UserRole = 'student' | 'teacher' | 'parent' | 'counselor' | 'vice_principal' | 'principal' | 'school_admin' | 'school_manager' | 'super_admin' | 'platform_admin';

export interface AuthUser {
  id: string;
  username: string; // e.g. national ID '1007363904' or email
  fullName: string;
  email?: string;
  role: UserRole;
  avatarUrl?: string;
  loginMethod: 'google' | 'credentials';
  schoolId?: string;
  schoolName?: string;
  nationalId?: string;
  badge?: string;
}

export type EducationalStage = 'primary' | 'middle' | 'secondary' | 'kindergarten' | 'all';
export type SchoolGender = 'boys' | 'girls' | 'mixed';
export type SchoolEducationType = 'حكومي' | 'أهلي' | 'عالمي' | 'تحفيظ قرآن' | 'تربية خاصة' | 'أخرى';
export type SchoolStage = 'ابتدائي' | 'متوسط' | 'ثانوي' | 'مجمع تعليمي' | 'روضة';
export type SchoolStatus = 'pending_review' | 'active' | 'suspended';

export interface SchoolTenant {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  logoText: string;
  badge: string;
  primaryColor: string;
  accentColor: string;
  motto: string;
  location: string;
  gender?: SchoolGender; // boys, girls, mixed
  educationType?: SchoolEducationType; // حكومي, أهلي, عالمي, تحفيظ قرآن, تربية خاصة, أخرى
  stage?: SchoolStage; // ابتدائي, متوسط, ثانوي, مجمع تعليمي, روضة
  regionId?: string;
  regionName?: string;
  governorateId?: string;
  governorateName?: string;
  cityId?: string;
  cityName?: string;
  district?: string;
  shortNationalAddress?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  educationDirectorate?: string;
  moeCode?: string; // الرقم الوزاري إن توفر
  officialEmail?: string;
  phone?: string;
  status?: SchoolStatus; // pending_review, active, suspended
  invitationCode?: string; // Unique, e.g. SCH-K7P4X9
  referenceNumber?: string; // Unique, e.g. INV-2026-000041
  registrationCodeUsed?: string;
  isApproved?: boolean;
  principalName?: string;
  principalEmail?: string;
  totalStudentsCount?: number;
  totalTeachersCount?: number;
  circulars: SchoolCircular[];
}

export type SchoolInvitationStatus = 'draft' | 'sent' | 'viewed' | 'registered' | 'verified' | 'activated';

export interface SchoolInvitation {
  id: string;
  schoolId: string;
  schoolName: string;
  invitationCode: string; // e.g. SCH-7K9P2X
  referenceNumber: string; // e.g. INV-2026-000124
  status: SchoolInvitationStatus;
  recipientEmail?: string;
  recipientPhone?: string;
  center?: string;
  district?: string;
  notes?: string;
  sentAt?: string;
  viewedAt?: string;
  registeredAt?: string;
  verifiedAt?: string;
  activatedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformLetterSettings {
  founderName: string;
  founderTitle: string;
  founderSubtitle: string;
  organizationName: string;
  contactEmail: string;
  contactWebsite: string;
  officialDisclaimer: string;
}

export interface SchoolRegistrationCode {
  id: string;
  code: string;
  schoolNameAssigned?: string;
  createdDate: string;
  status: 'نشط' | 'مستخدم' | 'معطل';
  usedBySchoolId?: string;
  usedAtDate?: string;
  cityRegion: string;
}

export interface BulkStudentRow {
  id: string;
  fullName: string;
  nationalId: string;
  grade: string;
  section: string;
  parentPhone: string;
  status: 'valid' | 'duplicate_id' | 'missing_info';
  generatedStudentId?: string;
  generatedPasscode?: string;
}

export interface PracticeQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  hint: string;
  explanation: string;
}

export interface TextbookCitation {
  bookName: string;
  grade: string;
  term: string;
  pageNumber: number;
  unitName: string;
  lessonName: string;
}

export interface SolverStep {
  stepNumber: number;
  title: string;
  explanation: string;
  mathFormula?: string;
}

export interface ThreeDPart {
  id: string;
  name: string;
  description: string;
  function: string;
  position: [number, number, number];
  color?: string;
}

export interface ThreeDModelInfo {
  id: string;
  title: string;
  category: 'biology' | 'chemistry' | 'physics' | 'geography' | 'math';
  summary: string;
  parts: ThreeDPart[];
  hasHeartbeatAnimation?: boolean;
  modelType: 'heart' | 'cell' | 'molecule' | 'motor' | 'dna' | 'earth';
}

export interface ProblemSolverResult {
  question: string;
  subject: string;
  difficulty: 'سهل' | 'متوسط' | 'متقدم';
  steps: SolverStep[];
  finalAnswer: string;
  keyConcept: string;
  textbookCitation?: TextbookCitation;
  practiceQuestions: PracticeQuestion[];
  threeDModel?: ThreeDModelInfo;
}

export interface CheckQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface PageExercise {
  exerciseNumber: string;
  question: string;
  solution: string;
  keyFormula?: string;
}

export interface PageQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface BookPageAnalysisResult {
  bookTitle: string;
  subject: string;
  grade: string;
  pageNumber: number;
  unitName: string;
  lessonTitle: string;
  pageHeading: string;
  pageTextContent: string;
  pageSummary: string;
  keyConceptsAndLaws: string[];
  solvedExercises: PageExercise[];
  practiceQuiz: {
    quizTitle: string;
    questions: PageQuizQuestion[];
  };
  threeDModel?: ThreeDModelInfo;
}

export interface HomeworkCitation {
  id: string;
  title: string;
  subject: string;
  sourceType: 'curriculum' | 'external';
  bookName?: string;
  chapterName?: string;
  lessonName?: string;
  externalTopic?: string;
  creationMethod: 'manual' | 'ai';
  dueDate: string;
  totalPoints: number;
  description: string;
  questions?: string[];
}

export interface TeacherChatMessage {
  id: string;
  sender: 'student' | 'teacher';
  text: string;
  timestamp: string;
  checkQuestion?: CheckQuestion;
  suggestedPrompts?: string[];
  homeworkCitation?: HomeworkCitation;
  threeDModel?: ThreeDModelInfo;
}

export interface CurriculumLesson {
  id: string;
  title: string;
  pageStart: number;
  pageEnd: number;
  topics: string[];
}

export interface CurriculumChapter {
  id: string;
  title: string;
  pageStart?: number;
  pageEnd?: number;
  topics?: string[];
  pdfUrl?: string;
  lessons?: CurriculumLesson[];
}

export interface CurriculumUnit {
  id: string;
  unitNumber: number;
  title: string;
  chapters: CurriculumChapter[];
}

export interface CurriculumBook {
  id: string;
  title: string; // book_name or title
  book_name?: string;
  subject: string; // subject_name
  subject_name?: string;
  grade: string;
  stage: EducationalStage; // education_stage
  education_stage?: EducationalStage;
  term: 1 | 2 | 3; // semester
  semester?: 1 | 2 | 3;
  academic_year?: string;
  editionYear: string;
  book_pdf_url?: string;
  source_url?: string;
  portalUrl?: string;
  is_active: boolean;
  coverIcon: string;
  totalPages: number;
  track?: 'المسار العام' | 'مسار الصحة والحياة' | 'مسار الهندسة والحاسب' | 'مسار إدارة الأعمال' | 'المسار الشرعي';
  isLatestSync?: boolean;
  chapters: CurriculumChapter[];
  units?: CurriculumUnit[];
  versionHistoryId?: string; // Tracks archived previous versions
}

export interface CurriculumSyncLog {
  id: string;
  timestamp: string;
  title: string;
  source: string;
  status: 'تم التحديث' | 'مستقر' | 'قيد المزامنة';
  details: string;
  bookId?: string;
}

export interface CurriculumSyncStatus {
  lastSyncTime: string;
  portalSources: string[];
  currentAcademicYear: string;
  activeTerm: 1 | 2 | 3;
  syncedBooksCount: number;
  syncLogs: CurriculumSyncLog[];
}

export interface TicketMessage {
  id: string;
  senderRole: UserRole;
  senderName: string;
  text: string;
  timestamp: string;
  attachmentName?: string;
}

export interface SupportTicket {
  id: string;
  studentName: string;
  grade: string;
  category: 'استفسار أكاديمي' | 'طلب مستندات رسمية' | 'إرشاد نفسي وتربوي' | 'شكوى/اقتراح' | 'الدعم الفني والمنصة';
  subject: string;
  status: 'جديد' | 'قيد المعالجة' | 'مكتمل' | 'مغلق';
  createdAt: string;
  lastUpdated: string;
  priority: 'عاجل' | 'متوسط' | 'عادي';
  messages: TicketMessage[];
}

export interface StudyGroupMessage {
  id: string;
  groupId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
  isDeleted?: boolean;
  deletedBy?: string;
  isFlagged?: boolean;
  problemCitation?: {
    question: string;
    finalAnswer: string;
    bookName: string;
    page: number;
  };
  homeworkCitation?: HomeworkCitation;
  attachmentUrl?: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  grade: string;
  membersCount: number;
  icon: string;
  description: string;
}

export interface ModerationAuditLogItem {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole?: UserRole;
  action: 'حذف رسالة' | 'حذف رسالة مخالفة' | 'إخفاء محتوى' | 'تنبيه فلترة آلية' | 'تقييد نشر الطالب' | 'تحديث منهج من بوابة عين' | 'إغلاق تكت استفسار';
  targetUser?: string;
  details: string;
  severity: 'عالي' | 'متوسط' | 'منخفض';
}

export interface HomeworkAssignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  totalPoints: number;
  status: 'pending' | 'submitted' | 'graded';
  score?: number;
  feedback?: string;
  schoolSlug: string;
  gradeLevel: string;
  description: string;
  textbookPage?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizItem {
  id: string;
  title: string;
  subject: string;
  durationMinutes: number;
  status: 'available' | 'completed';
  score?: number;
  totalQuestions: number;
  questions: QuizQuestion[];
}

export interface SubjectPerformance {
  subject: string;
  scorePercentage: number;
  gradeLetter: string;
  masteryLevel: 'ممتاز' | 'جيد جداً' | 'بحاجة لدعم';
  homeworkCompleted: number;
  totalHomework: number;
}

export interface UpcomingExam {
  id: string;
  subject: string;
  date: string;
  topic: string;
  difficulty: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  grade: string;
  stage: EducationalStage;
  avatar: string;
  schoolSlug: string;
  screenTimeDailyLimitMinutes: number;
  screenTimeUsedTodayMinutes: number;
  aiQuestionsCountToday: number;
  subjectsPerformance: SubjectPerformance[];
  upcomingExams: UpcomingExam[];
  aiRevisionPlan: {
    title: string;
    description: string;
    daysCount: number;
    tasks: { day: number; title: string; completed: boolean; subject: string }[];
  };
}

export interface CounselingReferral {
  id: string;
  studentName: string;
  grade: string;
  referrerName: string;
  referrerRole: 'معلم' | 'ولي أمر';
  date: string;
  category: 'أكاديمي' | 'سلوكي' | 'اجتماعي' | 'غياب وتأخر';
  priority: 'عاجل' | 'متوسط' | 'روتيني';
  status: 'جديد' | 'قيد المتابعة' | 'تم اتخاذ إجراء' | 'مغلق';
  reason: string;
  confidentialNotes: { id: string; author: string; date: string; note: string }[];
  actionPlan?: string;
}

export interface SchoolCircular {
  id: string;
  title: string;
  number: string;
  date: string;
  priority: 'عاجل' | 'هام' | 'عادي';
  category: 'إداري' | 'اختبارات' | 'نشاط مالي/مدرسي' | 'إرشاد طلابي';
  content: string;
  targetAudience: 'الجميع' | 'الطلاب' | 'أولياء الأمور' | 'المعلمون';
  attachedDocName?: string;
}

// -------------------------------------------------------------
// TEACHER OPERATIONAL SYSTEM TYPES
// -------------------------------------------------------------

export type DayOfWeek = 'الأحد' | 'الاثنين' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس' | 'الجمعة' | 'السبت';

export interface ClassSchedulePeriod {
  id: string;
  schoolId: string;
  teacherId: string;
  teacherName?: string;
  gradeName: string;
  classroomName: string;
  dayOfWeek: DayOfWeek;
  periodNumber: number; // 1 - 7
  subjectName: string;
  startTime: string; // e.g. "07:30"
  endTime: string;   // e.g. "08:15"
  room?: string;     // e.g. "مختبر العلوم 1"
  isRepeatedWeekly?: boolean;
  createdAt?: string;
}

export type StudentNoteType =
  | 'ملاحظة دراسية'
  | 'تميز'
  | 'تحسن'
  | 'واجب غير مكتمل'
  | 'ضعف في مادة'
  | 'سلوك'
  | 'حضور'
  | 'تأخر'
  | 'ملاحظة عامة';

export interface StudentNote {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  gradeName?: string;
  classroomName?: string;
  noteType: StudentNoteType;
  title: string;
  content: string;
  subjectName?: string;
  importanceLevel: 'عادي' | 'هام' | 'عاجل';
  isParentVisible: boolean;
  isStudentVisible: boolean;
  isAdminOnly: boolean;
  createdAt: string;
}

export type AttendanceStatus =
  | 'حاضر'
  | 'غائب'
  | 'غائب بعذر'
  | 'متأخر'
  | 'present'
  | 'absent'
  | 'excused'
  | 'late';

export interface AttendanceRecord {
  id: string;
  schoolId: string;
  teacherId: string;
  teacherName?: string;
  gradeName: string;
  classroomName: string;
  date: string; // YYYY-MM-DD
  periodNumber: number;
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  notes?: string;
  createdAt?: string;
}

export interface TeacherQuizQuestion {
  id: string;
  question?: string;
  questionText?: string;
  options: string[];
  correctAnswer?: number;
  correctAnswerIndex?: number;
  points: number;
  explanation?: string;
}

export interface TeacherQuiz {
  id: string;
  schoolId: string;
  teacherId: string;
  teacherName?: string;
  gradeName: string;
  classroomName: string;
  subjectName: string;
  title: string;
  description?: string;
  examDate: string; // YYYY-MM-DD
  examTime?: string; // HH:MM
  durationMinutes: number;
  totalPoints: number;
  questions: TeacherQuizQuestion[];
  isPublished: boolean;
  createdAt: string;
}

export type CommunicationTargetType =
  | 'class_announcement'
  | 'student_msg'
  | 'parent_msg'
  | 'homework_alert'
  | 'quiz_alert';

export interface TeacherCommunication {
  id: string;
  schoolId: string;
  teacherId: string;
  teacherName: string;
  targetType: CommunicationTargetType;
  gradeName: string;
  classroomName: string;
  targetId?: string; // studentId or parentId
  targetName?: string;
  title: string;
  content: string;
  isUrgent?: boolean;
  createdAt: string;
}

export interface TeacherPermissions {
  canAddStudent: boolean;
  canEditStudent: boolean;
  canManageSchedule: boolean;
  canRecordAttendance: boolean;
  canAddNotes: boolean;
  canCreateHomework: boolean;
  canCreateQuizzes: boolean;
  canMessageParents: boolean;
}
