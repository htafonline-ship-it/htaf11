export type UserRole = 'student' | 'teacher' | 'parent' | 'counselor' | 'vice_principal' | 'principal' | 'school_admin' | 'school_manager' | 'super_admin' | 'platform_admin' | 'admin';

export interface AuthUser {
  id: string;
  username: string; // e.g. 'student.demo1' or 'teacher.demo1'
  fullName: string;
  email?: string;
  role: UserRole;
  avatarUrl?: string;
  loginMethod: 'google' | 'credentials';
  schoolId?: string;
  schoolName?: string;
  classId?: string;
  gradeId?: string;
  accountStatus?: 'active' | 'pending' | 'suspended';
  isDemoAccount?: boolean;
  demoExpiresAt?: string;
  nationalId?: string;
  badge?: string;
  createdAt?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: UserRole;
  schoolId?: string;
  schoolName?: string;
  classId?: string;
  gradeId?: string;
  accountStatus: 'active' | 'pending' | 'suspended';
  isDemoAccount: boolean;
  demoExpiresAt?: string;
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DemoAccountCreatePayload {
  fullName: string;
  username: string;
  email: string;
  temporaryPassword?: string;
  role: UserRole;
  schoolId: string;
  gradeId?: string;
  classId?: string;
  expiresAt: string;
  permissions?: string[];
}

export type StudyRoomType = 'فصل' | 'مادة' | 'مراجعة اختبار' | 'دعم دراسي' | 'موهوبين' | 'برمجة وابتكار';

export interface StudyRoomMember {
  roomId: string;
  userId: string;
  fullName?: string;
  username?: string;
  memberRole: 'owner' | 'supervisor' | 'member';
  joinedAt: string;
  isMuted: boolean;
  isBanned: boolean;
  avatarUrl?: string;
}

export interface StudyRoomItem {
  id: string;
  schoolId: string;
  roomName: string;
  roomType: StudyRoomType;
  subjectId?: string;
  subject?: string;
  gradeId?: string;
  grade?: string;
  classId?: string;
  createdBy: string;
  createdByName?: string;
  supervisorId?: string;
  supervisorName?: string;
  status: 'active' | 'archived' | 'locked';
  membersCount: number;
  icon?: string;
  description?: string;
  createdAt: string;
  expiresAt?: string;
  members?: StudyRoomMember[];
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

export type School = SchoolTenant;

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

export interface StudentBookProgress {
  bookId: string;
  studentId: string;
  schoolId?: string;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  lastLessonId?: string;
  lastLessonTitle?: string;
  lastUnitTitle?: string;
  lastOpenedAt?: string;
  lessonStatusMap?: Record<string, 'not_started' | 'in_progress' | 'completed'>;
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
  cover_image_url?: string;
  book_pdf_url?: string;
  source_url?: string;
  source_type?: 'official_moe' | 'ien_portal' | 'madrasati' | 'school_upload';
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
  ticketId?: string;
  senderId?: string;
  senderRole: UserRole;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  attachmentName?: string;
  attachmentUrl?: string;
}

export interface SupportTicket {
  id: string;
  schoolId?: string;
  ticketNumber?: string;
  userId?: string;
  studentName: string;
  grade: string;
  category: 'استفسار أكاديمي' | 'طلب مستندات رسمية' | 'إرشاد نفسي وتربوي' | 'شكوى/اقتراح' | 'الدعم الفني والمنصة';
  subject: string;
  status: 'جديد' | 'قيد المعالجة' | 'مكتمل' | 'مغلق';
  createdAt: string;
  lastUpdated: string;
  priority: 'عاجل' | 'متوسط' | 'عادي';
  assignedTo?: string;
  messages: TicketMessage[];
}

export type ConversationType = 'direct' | 'group' | 'administrative' | 'counseling' | 'parent_teacher';

export interface ConversationMember {
  id: string;
  conversationId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userAvatar?: string;
  joinedAt: string;
  lastReadAt?: string;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  schoolId?: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  attachmentUrl?: string;
  attachmentName?: string;
  problemCitation?: {
    question: string;
    finalAnswer: string;
    bookName: string;
    page: number;
  };
  homeworkCitation?: HomeworkCitation;
  isDeleted?: boolean;
  deletedBy?: string;
  isFlagged?: boolean;
}

export interface SchoolConversation {
  id: string;
  schoolId: string;
  conversationType: ConversationType;
  title: string;
  createdBy: string;
  createdByName?: string;
  createdByRole?: UserRole;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  members: ConversationMember[];
}

export interface StudyGroupMessage {
  id: string;
  groupId: string;
  schoolId?: string;
  senderId?: string;
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
  attachmentName?: string;
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

export type CircularCategoryType = 'إداري' | 'أكاديمي' | 'اختبار' | 'حضور' | 'نشاط' | 'طارئ' | 'عام';
export type CircularAudienceType = 'all_school' | 'teachers' | 'students' | 'parents' | 'specific_grade' | 'specific_class' | 'specific_users';

export interface CircularReadConfirmation {
  id: string;
  circularId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  confirmedAt?: string;
  viewedAt?: string;
  isConfirmed: boolean;
}

export interface SchoolCircular {
  id: string;
  schoolId?: string;
  title: string;
  number?: string;
  circularNumber?: string;
  date?: string;
  priority: 'عاجل' | 'هام' | 'عادي';
  category?: 'إداري' | 'اختبارات' | 'نشاط مالي/مدرسي' | 'إرشاد طلابي';
  circularType?: CircularCategoryType;
  content: string;
  targetAudience: 'الجميع' | 'الطلاب' | 'أولياء الأمور' | 'المعلمون' | CircularAudienceType;
  targetGrade?: string;
  targetClass?: string;
  targetUserIds?: string[];
  publishDate?: string;
  expiryDate?: string;
  requiresReadConfirmation?: boolean;
  attachedDocName?: string;
  attachmentName?: string;
  attachmentUrl?: string;
  createdById?: string;
  createdByName?: string;
  createdByRole?: string;
  stats?: {
    totalRecipients: number;
    viewedCount: number;
    confirmedCount: number;
    pendingCount: number;
  };
  isAcknowledgedByMe?: boolean;
  acknowledgedAt?: string;
  createdAt?: string;
}

export interface SchoolAnnouncement {
  id: string;
  schoolId: string;
  title: string;
  content: string;
  targetAudience: 'all_school' | 'teachers' | 'students' | 'parents' | 'class';
  gradeName?: string;
  classroomName?: string;
  createdById: string;
  createdByName: string;
  createdByRole: UserRole;
  isUrgent?: boolean;
  createdAt: string;
}

export interface ParentStudentRelation {
  id: string;
  schoolId: string;
  parentId: string;
  studentId: string;
  relationshipType: 'أب' | 'أم' | 'ولي أمر' | 'كفيل';
  parentName?: string;
  parentPhone?: string;
  studentName?: string;
  studentGrade?: string;
  studentClass?: string;
  createdAt: string;
}

export interface TeacherAssignment {
  id: string;
  schoolId: string;
  teacherId: string;
  teacherName: string;
  subjectName: string;
  gradeName: string;
  classroomName: string;
  classId?: string;
  createdAt?: string;
}

export interface AppNotification {
  id: string;
  schoolId: string;
  userId: string;
  title: string;
  body: string;
  type: 'message' | 'circular' | 'announcement' | 'ticket' | 'homework' | 'quiz' | 'note' | 'room';
  targetId?: string;
  isRead: boolean;
  createdAt: string;
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
