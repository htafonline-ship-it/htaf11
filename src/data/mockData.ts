import {
  SchoolTenant,
  CurriculumBook,
  HomeworkAssignment,
  QuizItem,
  StudentProfile,
  CounselingReferral,
  SchoolCircular,
  CurriculumSyncStatus,
  SupportTicket,
  StudyGroup,
  StudyGroupMessage,
  ModerationAuditLogItem,
  SchoolRegistrationCode,
  BulkStudentRow
} from '../types';

export const INITIAL_REGISTRATION_CODES: SchoolRegistrationCode[] = [
  {
    id: 'code-101',
    code: 'SCH-2026-RIYADH-01',
    schoolNameAssigned: 'مدرسة النموذجية الذكية بفرع الرياض',
    createdDate: '2026-01-01',
    status: 'مستخدم',
    usedBySchoolId: 'school-1',
    usedAtDate: '2026-01-05',
    cityRegion: 'الرياض'
  },
  {
    id: 'code-102',
    code: 'SCH-2026-JEDDAH-02',
    schoolNameAssigned: 'معد ومدارس الأجيال العالمية والأهلية',
    createdDate: '2026-01-10',
    status: 'مستخدم',
    usedBySchoolId: 'school-2',
    usedAtDate: '2026-01-12',
    cityRegion: 'جدة'
  },
  {
    id: 'code-103',
    code: 'SCH-2026-DAMMAM-03',
    schoolNameAssigned: 'مدارس المجد النموذجية الأهلية',
    createdDate: '2026-01-15',
    status: 'مستخدم',
    usedBySchoolId: 'school-3',
    usedAtDate: '2026-01-18',
    cityRegion: 'الدمام'
  },
  {
    id: 'code-104',
    code: 'SCH-2026-VIP-99',
    schoolNameAssigned: 'مدرسة جديدة (قيد التجهيز)',
    createdDate: '2026-02-01',
    status: 'نشط',
    cityRegion: 'الرياض - تعليم شرق'
  },
  {
    id: 'code-105',
    code: 'SCH-2026-MAKKAH-88',
    schoolNameAssigned: 'مدرسة مكة المتقدمة',
    createdDate: '2026-02-05',
    status: 'نشط',
    cityRegion: 'مكة المكرمة'
  }
];

export const INITIAL_BULK_STUDENTS_SAMPLE: BulkStudentRow[] = [
  {
    id: 'row-1',
    fullName: 'عبدالله بن فهد القحطاني',
    nationalId: '1098827361',
    grade: 'الصف الثالث المتوسط',
    section: '3/أ',
    parentPhone: '0501234567',
    status: 'valid'
  },
  {
    id: 'row-2',
    fullName: 'سعد بن عبدالعزيز الشهري',
    nationalId: '1087723910',
    grade: 'الصف الثالث المتوسط',
    section: '3/أ',
    parentPhone: '0559876543',
    status: 'valid'
  },
  {
    id: 'row-3',
    fullName: 'عمر بن خالد الدوسري',
    nationalId: '1098827361', // Duplicate ID for test demo
    grade: 'الصف الثالث المتوسط',
    section: '3/ب',
    parentPhone: '0543332211',
    status: 'duplicate_id'
  },
  {
    id: 'row-4',
    fullName: 'محمد بن راشد العتيبي',
    nationalId: '1076612984',
    grade: 'الصف الأول الثانوي',
    section: '1/ج',
    parentPhone: '0567788990',
    status: 'valid'
  },
  {
    id: 'row-5',
    fullName: 'يوسف بن سلمان الحربي',
    nationalId: '',
    grade: 'الصف الثاني المتوسط',
    section: '2/أ',
    parentPhone: '0500001122',
    status: 'missing_info'
  }
];

export const INITIAL_SCHOOLS: SchoolTenant[] = [
  {
    id: 'school-1',
    name: 'مدرسة النموذجية الذكية بفرع الرياض',
    nameEn: 'Al-Namouthajya Smart School',
    slug: 'al-namouthajya',
    logoText: 'هـ',
    badge: 'مدرسة متميزة VIP',
    primaryColor: '#059669', // Emerald
    accentColor: '#10b981',
    motto: 'نصنع قادة المستقبل برؤية تعليمية ذكية',
    location: 'الرياض - حي حطين',
    registrationCodeUsed: 'SCH-2026-RIYADH-01',
    isApproved: true,
    principalName: 'أ. د. عبدالمحسن العتيبي',
    principalEmail: 'principal@alnamouthajya.edu.sa',
    totalStudentsCount: 420,
    totalTeachersCount: 35,
    circulars: [
      {
        id: 'circ-101',
        title: 'الخطة الزمنية لاختبارات منتصف الفصل الدراسي الثاني',
        number: 'ت-2026/04',
        date: '2026-02-10',
        priority: 'عاجل',
        category: 'اختبارات',
        content: 'المكرمون أولياء الأمور والطلاب، نفيدكم ببدء اختبارات منتصف الفصل الدراسي الثاني اعتباراً من الأحد القادم. نأمل الالتزام بالحضور المبكر والاستعانة بخطط المراجعة في المنصة.',
        targetAudience: 'الجميع',
        attachedDocName: 'جدول_الاختبارات_النصفية.pdf'
      },
      {
        id: 'circ-102',
        title: 'تفعيل المساعد الذكي "هتاف العاصمي" لحل المسائل',
        number: 'ت-2026/02',
        date: '2026-02-01',
        priority: 'هام',
        category: 'إداري',
        content: 'تم تفعيل تقنية الذكاء الاصطناعي لحل المسائل وربطها بالكتب الوزارية المعتمدة. نوصي بفتح حسابات المتابعة لأولياء الأمور.',
        targetAudience: 'الجميع'
      }
    ]
  },
  {
    id: 'school-2',
    name: 'معد ومدارس الأجيال العالمية والأهلية',
    nameEn: 'Al-Ajeal Schools',
    slug: 'al-ajeal',
    logoText: 'جـ',
    badge: 'اعتماد دولي',
    primaryColor: '#2563eb', // Blue
    accentColor: '#3b82f6',
    motto: 'الأصالة والتطوير العلمي',
    location: 'جدة - حي الشاطئ',
    registrationCodeUsed: 'SCH-2026-JEDDAH-02',
    isApproved: true,
    principalName: 'د. سارة الماجد',
    principalEmail: 'principal@alajeal.edu.sa',
    totalStudentsCount: 310,
    totalTeachersCount: 28,
    circulars: [
      {
        id: 'circ-201',
        title: 'ورشة عمل التوجيه والإرشاد الطلابي للتفوق الأكاديمي',
        number: 'ت-ج/88',
        date: '2026-02-05',
        priority: 'عادي',
        category: 'إرشاد طلابي',
        content: 'يدعو قسم الإرشاد الطلابي أولياء أمور الطلاب لحضور الجلسة التفاعلية الذكية حول الاستعداد النفسي للاختبارات النهائية.',
        targetAudience: 'أولياء الأمور'
      }
    ]
  },
  {
    id: 'school-3',
    name: 'مدارس المجد النموذجية الأهلية',
    nameEn: 'Al-Majd Schools',
    slug: 'al-majd',
    logoText: 'مـ',
    badge: 'رائدة التكنولوجيا',
    primaryColor: '#7c3aed', // Purple
    accentColor: '#8b5cf6',
    motto: 'علمٌ يضيء ورؤية ترتقي',
    location: 'الدمام - حي الشاطئ الشرقي',
    registrationCodeUsed: 'SCH-2026-DAMMAM-03',
    isApproved: true,
    principalName: 'أ. خالد التميمي',
    principalEmail: 'principal@almajd.edu.sa',
    totalStudentsCount: 280,
    totalTeachersCount: 22,
    circulars: []
  }
];

export const INITIAL_CURRICULUM_SYNC_STATUS: CurriculumSyncStatus = {
  lastSyncTime: 'اليوم، 08:30 ص',
  portalSources: [
    'بوابة عين الوطنية الإثرائية (ien.edu.sa)',
    'منصة مدرستي الرقمية (madrasati.sa)',
    'مركز التخطيط والتطوير المناهجي بوزارة التعليم'
  ],
  currentAcademicYear: '1447هـ - 2026م (النظام الثلاثي للفصول)',
  activeTerm: 2,
  syncedBooksCount: 48,
  syncLogs: [
    {
      id: 'log-1',
      timestamp: '2026-02-09 08:30 ص',
      title: 'مزامنة تحديثات الرياضيات - الصف الثالث المتوسط (الفصل الثاني)',
      source: 'بوابة عين الوطنية (ien.edu.sa)',
      status: 'تم التحديث',
      details: 'تم تحديث تمارين الفصل الخامس وتحديث فهرس حلول المسائل الإلكترونية المعتمدة.',
      bookId: 'book-math-m3-t2'
    },
    {
      id: 'log-2',
      timestamp: '2026-02-08 14:15 م',
      title: 'إضافة مقرر مسار الهندسة والحاسب (الذكاء الاصطناعي 1)',
      source: 'منصة مدرستي الرقمية (madrasati.sa)',
      status: 'تم التحديث',
      details: 'رفع النسخة التفاعلية الجديدة 1447هـ وتحديث نماذج الممارسة الذكية.',
      bookId: 'book-ai-s2-t2'
    },
    {
      id: 'log-3',
      timestamp: '2026-02-07 10:00 ص',
      title: 'فحص مطابقة كتاب العلوم - الفصل الثاني مع توزيع الأسابيع الدراسية',
      source: 'مركز المناهج والكتب',
      status: 'مستقر',
      details: 'مطابقة 100% بين محتوى التمارين والخطة التدريسية لفصول السنة.'
    }
  ]
};

export const CURRICULUM_BOOKS: CurriculumBook[] = [
  {
    id: 'book-math-m3-t2',
    title: 'الرياضيات - الثالث المتوسط',
    book_name: 'الرياضيات - الثالث المتوسط',
    subject: 'الرياضيات',
    subject_name: 'الرياضيات',
    grade: 'الصف الثالث المتوسط',
    stage: 'middle',
    education_stage: 'middle',
    term: 2,
    semester: 2,
    academic_year: '1447هـ - 2026م',
    is_active: true,
    book_pdf_url: 'https://ien.edu.sa/preview/math-m3-ch5.pdf',
    source_url: 'https://ien.edu.sa/Home/Book/math-m3-t2',
    coverIcon: '📐',
    totalPages: 184,
    editionYear: '1447هـ - 2026م (طبعة وزارة التعليم المعتمدة)',
    portalUrl: 'https://ien.edu.sa/Home/Book/math-m3-t2',
    isLatestSync: true,
    chapters: [
      {
        id: 'ch-1',
        title: 'الفصل 5: الأنظمة الخطية والمعاملات',
        pageStart: 12,
        pageEnd: 48,
        topics: ['حل نظام من معادلتين خطيتين بيانياً', 'الحل بالتعويض', 'الحل بالحذف باستخدام الجمع أو الطرح'],
        pdfUrl: 'https://ien.edu.sa/preview/math-m3-ch5.pdf'
      },
      {
        id: 'ch-2',
        title: 'الفصل 6: الكسيرات والحدود والمربعات كاملة',
        pageStart: 49,
        pageEnd: 92,
        topics: ['ضرب وحيدات الحد', 'قسمة وحيدات الحد', 'تحليل المعادلات التربيعية: س² + ب س + ج = 0'],
        pdfUrl: 'https://ien.edu.sa/preview/math-m3-ch6.pdf'
      },
      {
        id: 'ch-3',
        title: 'الفصل 7: الدوال التربيعية والمعادلات',
        pageStart: 93,
        pageEnd: 140,
        topics: ['المعادلات التربيعية', 'إكمال المربع', 'القانون العام والقيمة المميزة (ب² - 4 أ ج)'],
        pdfUrl: 'https://ien.edu.sa/preview/math-m3-ch7.pdf'
      }
    ]
  },
  {
    id: 'book-science-m3-t2',
    title: 'العلوم - الثالث المتوسط',
    book_name: 'العلوم - الثالث المتوسط',
    subject: 'العلوم',
    subject_name: 'العلوم',
    grade: 'الصف الثالث المتوسط',
    stage: 'middle',
    education_stage: 'middle',
    term: 2,
    semester: 2,
    academic_year: '1447هـ - 2026م',
    is_active: true,
    book_pdf_url: 'https://ien.edu.sa/preview/science-m3-u3.pdf',
    source_url: 'https://ien.edu.sa/Home/Book/science-m3-t2',
    coverIcon: '🧪',
    totalPages: 160,
    editionYear: '1447هـ - 2026م (طبعة وزارة التعليم المعتمدة)',
    portalUrl: 'https://ien.edu.sa/Home/Book/science-m3-t2',
    isLatestSync: true,
    chapters: [
      {
        id: 'ch-s1',
        title: 'الوحدة 3: طبيعة المادة والجدول الدوري',
        pageStart: 10,
        pageEnd: 55,
        topics: ['بناء الذرة والنواة', 'الجدول الدوري الحديث', 'العناصر الانتقالية والفلزات'],
        pdfUrl: 'https://ien.edu.sa/preview/science-m3-u3.pdf'
      },
      {
        id: 'ch-s2',
        title: 'الوحدة 4: التفاعلات الكيميائية والطاقة',
        pageStart: 56,
        pageEnd: 110,
        topics: ['الروابط الكيميائية', 'التفاعلات الماصة والطاردة للطاقة', 'سرعة التفاعل الكيميائي والعوامل المساعدة'],
        pdfUrl: 'https://ien.edu.sa/preview/science-m3-u4.pdf'
      }
    ]
  },
  {
    id: 'book-ai-s2-t2',
    title: 'الذكاء الاصطناعي 1 - مسار الهندسة والحاسب',
    book_name: 'الذكاء الاصطناعي 1 - مسار الهندسة والحاسب',
    subject: 'الذكاء الاصطناعي',
    subject_name: 'الذكاء الاصطناعي',
    grade: 'الصف الثاني الثانوي',
    stage: 'secondary',
    education_stage: 'secondary',
    term: 2,
    semester: 2,
    academic_year: '1447هـ - 2026م',
    is_active: true,
    book_pdf_url: 'https://ien.edu.sa/preview/ai-s2.pdf',
    source_url: 'https://ien.edu.sa/Home/Book/ai-s2-t2',
    track: 'مسار الهندسة والحاسب',
    coverIcon: '🤖',
    totalPages: 195,
    editionYear: '1447هـ - 2026م (تحديث جديد عين)',
    portalUrl: 'https://ien.edu.sa/Home/Book/ai-s2-t2',
    isLatestSync: true,
    chapters: [
      {
        id: 'ch-ai1',
        title: 'الوحدة 1: أساسيات التعلم الآلي والشبكات العصبيّة',
        pageStart: 12,
        pageEnd: 65,
        topics: ['مفهوم التعلم الخاضع للإشراف Supervised Learning', 'بناء نماذج التصنيف والتنبؤ', 'أخلاقيات الذكاء الاصطناعي والأمن الرقمي']
      }
    ]
  },
  {
    id: 'book-health-s2-t2',
    title: 'علم الأحياء 2 - مسار الصحة والحياة',
    book_name: 'علم الأحياء 2 - مسار الصحة والحياة',
    subject: 'الأحياء',
    subject_name: 'الأحياء',
    grade: 'الصف الثاني الثانوي',
    stage: 'secondary',
    education_stage: 'secondary',
    term: 2,
    semester: 2,
    academic_year: '1447هـ - 2026م',
    is_active: true,
    book_pdf_url: 'https://ien.edu.sa/preview/biology-s2-t2.pdf',
    source_url: 'https://ien.edu.sa/Home/Book/biology-s2-t2',
    track: 'مسار الصحة والحياة',
    coverIcon: '🧬',
    totalPages: 220,
    editionYear: '1447هـ - 2026م (طبعة وزارة التعليم)',
    portalUrl: 'https://ien.edu.sa/Home/Book/biology-s2-t2',
    chapters: [
      {
        id: 'ch-bio1',
        title: 'الفصل 4: أجهزة الجسم والتكامل الهرموني',
        pageStart: 45,
        pageEnd: 98,
        topics: ['الجهاز العصبي المركزي والطرفي', 'جهاز الغدد الصماء والهرمونات', 'المناعة الطبيعية والمكتسبة']
      }
    ]
  },
  {
    id: 'book-physics-s1-t2',
    title: 'الفيزياء 1 - المرحلة الثانوية (المسار العام)',
    book_name: 'الفيزياء 1 - المرحلة الثانوية (المسار العام)',
    subject: 'الفيزياء',
    subject_name: 'الفيزياء',
    grade: 'الصف الأول الثانوي',
    stage: 'secondary',
    education_stage: 'secondary',
    term: 2,
    semester: 2,
    academic_year: '1447هـ - 2026م',
    is_active: true,
    book_pdf_url: 'https://ien.edu.sa/preview/physics-s1-t2.pdf',
    source_url: 'https://ien.edu.sa/Home/Book/physics-s1-t2',
    track: 'المسار العام',
    coverIcon: '⚡',
    totalPages: 210,
    editionYear: '1447هـ - 2026م (طبعة وزارة التعليم)',
    portalUrl: 'https://ien.edu.sa/Home/Book/physics-s1-t2',
    chapters: [
      {
        id: 'ch-p1',
        title: 'الفصل 3: الحركة المتسارعة وقوانين نيوتن',
        pageStart: 60,
        pageEnd: 105,
        topics: ['التسارع (العجلة)', 'الحركة بتسارع منتظم', 'القانون الثاني لنيوتن F = m × a', 'القوة والحركة في بعدين']
      }
    ]
  },
  {
    id: 'book-arabic-m3-t2',
    title: 'لغتي الخالدة - الثالث المتوسط',
    book_name: 'لغتي الخالدة - الثالث المتوسط',
    subject: 'اللغة العربية',
    subject_name: 'اللغة العربية',
    grade: 'الصف الثالث المتوسط',
    stage: 'middle',
    education_stage: 'middle',
    term: 2,
    semester: 2,
    academic_year: '1447هـ - 2026م',
    is_active: true,
    book_pdf_url: 'https://ien.edu.sa/preview/arabic-m3-t2.pdf',
    source_url: 'https://ien.edu.sa/Home/Book/arabic-m3-t2',
    coverIcon: '📖',
    totalPages: 142,
    editionYear: '1447هـ - 2026م (طبعة وزارة التعليم)',
    portalUrl: 'https://ien.edu.sa/Home/Book/arabic-m3-t2',
    chapters: [
      {
        id: 'ch-a1',
        title: 'الوحدة 4: قضايا العمل والصحة',
        pageStart: 15,
        pageEnd: 60,
        topics: ['اسم الفاعل واسم المفعول', 'الاستثناء بإلا وغير وسوى', 'كتابة المقال الرسمي والعلمي']
      }
    ]
  },
  {
    id: 'book-math-p6-t2',
    title: 'الرياضيات - السادس الابتدائي',
    book_name: 'الرياضيات - السادس الابتدائي',
    subject: 'الرياضيات',
    subject_name: 'الرياضيات',
    grade: 'الصف السادس الابتدائي',
    stage: 'primary',
    education_stage: 'primary',
    term: 2,
    semester: 2,
    academic_year: '1447هـ - 2026م',
    is_active: true,
    book_pdf_url: 'https://ien.edu.sa/preview/math-p6-t2.pdf',
    source_url: 'https://ien.edu.sa/Home/Book/math-p6-t2',
    coverIcon: '🔢',
    totalPages: 160,
    editionYear: '1447هـ - 2026م (طبعة وزارة التعليم)',
    portalUrl: 'https://ien.edu.sa/Home/Book/math-p6-t2',
    isLatestSync: true,
    chapters: [
      {
        id: 'ch-p6-1',
        title: 'الفصل 6: العمليات على الكسور الاعتيادية والنسبة المئوية',
        pageStart: 10,
        pageEnd: 50,
        topics: ['جمع الكسور وتطبيقاتها', 'ضرب الكسور الاعتيادية', 'النسبة المئوية والاحتمال']
      }
    ]
  },
  {
    id: 'book-science-p5-t2',
    title: 'العلوم - الخامس الابتدائي',
    book_name: 'العلوم - الخامس الابتدائي',
    subject: 'العلوم',
    subject_name: 'العلوم',
    grade: 'الصف الخامس الابتدائي',
    stage: 'primary',
    education_stage: 'primary',
    term: 2,
    semester: 2,
    academic_year: '1447هـ - 2026م',
    is_active: true,
    book_pdf_url: 'https://ien.edu.sa/preview/science-p5-t2.pdf',
    source_url: 'https://ien.edu.sa/Home/Book/science-p5-t2',
    coverIcon: '🌿',
    totalPages: 140,
    editionYear: '1447هـ - 2026م (طبعة وزارة التعليم)',
    portalUrl: 'https://ien.edu.sa/Home/Book/science-p5-t2',
    isLatestSync: true,
    chapters: [
      {
        id: 'ch-p5-1',
        title: 'الوحدة 3: الأنظمة البيئية وموارد الأرض',
        pageStart: 12,
        pageEnd: 60,
        topics: ['الدورات في النظام البيئي', 'الموارد الطبيعية وحمايتها', 'الطقس والمناخ']
      }
    ]
  },
  {
    id: 'book-arabic-p4-t2',
    title: 'لغتي الجميلة - الرابع الابتدائي',
    book_name: 'لغتي الجميلة - الرابع الابتدائي',
    subject: 'اللغة العربية',
    subject_name: 'اللغة العربية',
    grade: 'الصف الرابع الابتدائي',
    stage: 'primary',
    education_stage: 'primary',
    term: 2,
    semester: 2,
    academic_year: '1447هـ - 2026م',
    is_active: true,
    book_pdf_url: 'https://ien.edu.sa/preview/arabic-p4-t2.pdf',
    source_url: 'https://ien.edu.sa/Home/Book/arabic-p4-t2',
    coverIcon: '✏️',
    totalPages: 130,
    editionYear: '1447هـ - 2026م (طبعة وزارة التعليم)',
    portalUrl: 'https://ien.edu.sa/Home/Book/arabic-p4-t2',
    chapters: [
      {
        id: 'ch-p4-1',
        title: 'الوحدة 2: مجتمعي وتكافلي',
        pageStart: 15,
        pageEnd: 55,
        topics: ['أنواع المعارف والأسماء', 'الجملة الاسمية والجملة الفعلية', 'الإملاء والتاء المربوطة والمفتوحة']
      }
    ]
  }
];

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  id: 'std-2026-01',
  name: 'سارة عبد الله العاصمي',
  grade: 'الصف الثالث المتوسط (شعبة 3/أ)',
  stage: 'middle',
  avatar: '👧',
  schoolSlug: 'al-namouthajya',
  screenTimeDailyLimitMinutes: 90,
  screenTimeUsedTodayMinutes: 42,
  aiQuestionsCountToday: 8,
  subjectsPerformance: [
    {
      subject: 'الرياضيات',
      scorePercentage: 94,
      gradeLetter: 'ممتاز A+',
      masteryLevel: 'ممتاز',
      homeworkCompleted: 12,
      totalHomework: 12
    },
    {
      subject: 'العلوم',
      scorePercentage: 88,
      gradeLetter: 'جيد جداً A',
      masteryLevel: 'جيد جداً',
      homeworkCompleted: 10,
      totalHomework: 11
    },
    {
      subject: 'الفيزياء',
      scorePercentage: 82,
      gradeLetter: 'جيد جداً B+',
      masteryLevel: 'جيد جداً',
      homeworkCompleted: 7,
      totalHomework: 9
    },
    {
      subject: 'اللغة العربية',
      scorePercentage: 96,
      gradeLetter: 'ممتاز A+',
      masteryLevel: 'ممتاز',
      homeworkCompleted: 14,
      totalHomework: 14
    }
  ],
  upcomingExams: [
    {
      id: 'ex-1',
      subject: 'الرياضيات',
      date: '2026-02-15',
      topic: 'الفصل 6: تحليل المعادلات التربيعية وتطبيقاتها',
      difficulty: 'متوسط إلى متقدم'
    },
    {
      id: 'ex-2',
      subject: 'العلوم',
      date: '2026-02-18',
      topic: 'التفاعلات الكيميائية والجدول الدوري',
      difficulty: 'متوسط'
    }
  ],
  aiRevisionPlan: {
    title: 'خطة التفوق والاستعداد لاختبار الرياضيات والعلوم',
    description: 'خطة مراجعة ذكية مصممة خصيصاً لسارة بناءً على تحليل نقاط القوة وتدريبات هتاف العاصمي.',
    daysCount: 5,
    tasks: [
      { day: 1, title: 'مراجعة تحليل وحيدات الحد والمربعات الكاملة (كتاب الرياضيات - ص 52)', completed: true, subject: 'الرياضيات' },
      { day: 2, title: 'حل 5 مسائل على القانون العام والمميز ب²-4أج واستخدام حلال المسائل الذكي', completed: true, subject: 'الرياضيات' },
      { day: 3, title: 'مراجعة التركيب الذري والروابط الكيميائية (كتاب العلوم - ص 62)', completed: false, subject: 'العلوم' },
      { day: 4, title: 'جلسة المعلم التفاعلي الذكي للتأكد من فهم تفاعلات الأكسدة والسرعة الكيميائية', completed: false, subject: 'العلوم' },
      { day: 5, title: 'حل نموذج اختبار تجريبي شامل مع التقييم الفوري', completed: false, subject: 'الرياضيات' }
    ]
  }
};

export const INITIAL_HOMEWORKS: HomeworkAssignment[] = [
  {
    id: 'hw-101',
    title: 'حل واجب تحليل المعادلات التربيعية',
    subject: 'الرياضيات',
    dueDate: '2026-02-12',
    totalPoints: 10,
    status: 'pending',
    schoolSlug: 'al-namouthajya',
    gradeLevel: 'الثالث المتوسط',
    description: 'قم بحل المسائل رقم 3 و 7 و 12 في كتاب الطالب صفحة 64 مع توضيح خطوات الحل التفصيلية.',
    textbookPage: 64
  },
  {
    id: 'hw-102',
    title: 'تقرير مصغر عن الروابط التساهمية والأيونية',
    subject: 'العلوم',
    dueDate: '2026-02-14',
    totalPoints: 15,
    status: 'submitted',
    score: 14,
    feedback: 'عمل ممتاز يا سارة، الرسوم التوضيحية كانت واضحة ومتقنة.',
    schoolSlug: 'al-namouthajya',
    gradeLevel: 'الثالث المتوسط',
    description: 'كتابة ملخص من 200 كلمة يوضح الفرق بين الرابطة الأيونية والتساهمية مع إعطاء مثال لكل منهما من واقع الحياة.'
  },
  {
    id: 'hw-103',
    title: 'استخراج أسماء الفاعلين والمفعولين من نص النصيحة',
    subject: 'اللغة العربية',
    dueDate: '2026-02-10',
    totalPoints: 10,
    status: 'graded',
    score: 10,
    feedback: 'درجة كاملة، إجابات دقيقة واعراب صحيح.',
    schoolSlug: 'al-namouthajya',
    gradeLevel: 'الثالث المتوسط',
    description: 'استخرج من النص في صفحة 30 ثلاثة أسماء فاعل وزنتها واذكر أفعالها الثلاثية.'
  }
];

export const INITIAL_QUIZZES: QuizItem[] = [
  {
    id: 'qz-201',
    title: 'اختبار قصير: المعادلات الخطية ونظام المعادلتين',
    subject: 'الرياضيات',
    durationMinutes: 15,
    status: 'available',
    totalQuestions: 4,
    questions: [
      {
        id: 'q1',
        question: 'ما قيمة س في المعادلة: 2س + 5 = 15؟',
        options: ['س = 3', 'س = 5', 'س = 10', 'س = 7'],
        correctAnswer: 1,
        explanation: 'بطرح 5 من الطرفين: 2س = 10، ثم بالقسمة على 2 نحصل على س = 5.'
      },
      {
        id: 'q2',
        question: 'المقدار المميز في القانون العام للمعادلات التربيعية يساوي:',
        options: ['أ² + ب²', 'ب² - 4أج', '2أ / ب', 'ب / (2أ)'],
        correctAnswer: 1,
        explanation: 'المميز هو ب² - 4أج ويحدد عدد ونوع جذور المعادلة التربيعية.'
      },
      {
        id: 'q3',
        question: 'إذا كان المميز أقل من الصفر (سالب)، فإن المعادلة التربيعية:',
        options: ['لها حلان حقيقيان', 'لها حل حقيقي واحد', 'ليس لها حلول حقيقية (حلول مركبة)', 'لها عدد لا نهائي من الحلول'],
        correctAnswer: 2,
        explanation: 'عندما يكون المميز سالباً، لا يوجد جذر تربيعي حقيقي له وبالتالي لا توجد حلول حقيقية.'
      },
      {
        id: 'q4',
        question: 'تحليل المقدار س² + 5س + 6 هو:',
        options: ['(س + 1)(س + 6)', '(س + 2)(س + 3)', '(س - 2)(س - 3)', '(س + 5)(س + 1)'],
        correctAnswer: 1,
        explanation: 'نبحث عن عددين حاصل ضربهما 6 ومجموعهما 5، وهما 2 و 3.'
      }
    ]
  },
  {
    id: 'qz-202',
    title: 'اختبار قصير: الجدول الدوري والتوزيع الإلكتروني',
    subject: 'العلوم',
    durationMinutes: 10,
    status: 'completed',
    score: 100,
    totalQuestions: 3,
    questions: [
      {
        id: 'qs1',
        question: 'شحنة النواة في الذرة تكون دائماً:',
        options: ['سالبة', 'موجبة', 'متعادلة', 'متغيرة'],
        correctAnswer: 1,
        explanation: 'النواة تحتوي على البروتونات الموجبة والنيوترونات المتعادلة، فتكون شحنتها الكلية موجبة.'
      }
    ]
  }
];

export const INITIAL_REFERRALS: CounselingReferral[] = [
  {
    id: 'ref-301',
    studentName: 'أحمد خالد الشمري',
    grade: 'الصف الأول الثانوي (شعبة 1/ب)',
    referrerName: 'أ. منصور العتيبي',
    referrerRole: 'معلم',
    date: '2026-02-08',
    category: 'أكاديمي',
    priority: 'متوسط',
    status: 'قيد المتابعة',
    reason: 'تراجع ملحوظ في درجات مادة الفيزياء وقسوة التشتت أثناء الحصص الأخيرة.',
    confidentialNotes: [
      {
        id: 'cn-1',
        author: 'الموجه الطلابي د. إبراهيم السعيد',
        date: '2026-02-09',
        note: 'تمت مقابلة الطالب ودياً، وتبين وجود صعوبة في مراجعة دروس الحركة المتسارعة. تم تحويله لخطة التمكين واستخدام المساعد الذكي "هتاف العاصمي".'
      }
    ],
    actionPlan: 'جلسة أسبوعية مع الموجه الطلابي + استدعاء ولي الأمر لتنسيق تنظيم وقت الاستيعاب.'
  },
  {
    id: 'ref-302',
    studentName: 'ريان فهد العبد الله',
    grade: 'الصف الثاني المتوسط (شعبة 2/أ)',
    referrerName: 'أم ريان (ولي أمر)',
    referrerRole: 'ولي أمر',
    date: '2026-02-04',
    category: 'غياب وتأخر',
    priority: 'عاجل',
    status: 'جديد',
    reason: 'طلب مساعدة من الموجه الطلابي لمعالجة القلق النفسي الشديد قبل الاختبارات القصيرة.',
    confidentialNotes: [],
    actionPlan: ''
  }
];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-101',
    studentName: 'سارة عبد الله العاصمي',
    grade: 'الثالث المتوسط (3/أ)',
    category: 'استفسار أكاديمي',
    subject: 'طلب توضيح آلية درجات منتصف الفصل في مادة الرياضيات',
    status: 'قيد المعالجة',
    createdAt: '2026-02-08 09:15 ص',
    lastUpdated: '2026-02-09 08:10 ص',
    priority: 'متوسط',
    messages: [
      {
        id: 'msg-t1',
        senderRole: 'student',
        senderName: 'سارة عبد الله العاصمي',
        text: 'السلام عليكم ورحمة الله، أود الاستفسار عن توزيع درجات المشروعات العملية في مادة الرياضيات وهل تم احتساب حلول المسائل عبر المنصة؟',
        timestamp: '2026-02-08 09:15 ص'
      },
      {
        id: 'msg-t2',
        senderRole: 'principal',
        senderName: 'إدارة شؤون الطلاب - أ. عبد العزيز المقرن',
        text: 'وعليكم السلام ورحمة الله وبركاته، أهلاً يا سارة. نعم، يتم احتساب 10% من الدرجة للأنشطة الذكية وحل الواجبات عبر منصة هتاف العاصمي. يسعدنا حرصك وتفوقك!',
        timestamp: '2026-02-09 08:10 ص'
      }
    ]
  },
  {
    id: 'tkt-102',
    studentName: 'فيصل محمد الدوسري',
    grade: 'الصف الثاني الثانوي',
    category: 'طلب مستندات رسمية',
    subject: 'طلب تعريف طالب إلكتروني مختوم لمسار الهندسة',
    status: 'مكتمل',
    createdAt: '2026-02-07 11:30 ص',
    lastUpdated: '2026-02-07 14:00 م',
    priority: 'عادي',
    messages: [
      {
        id: 'msg-f1',
        senderRole: 'student',
        senderName: 'فيصل محمد الدوسري',
        text: 'أرجو إصدار مشهد إثبات طالب لمسار الهندسة والحاسب موجه للجهات المعنية.',
        timestamp: '2026-02-07 11:30 ص'
      },
      {
        id: 'msg-f2',
        senderRole: 'principal',
        senderName: 'إدارة التسجيل والقبول',
        text: 'تم إصدار المشهد رسمياً وتصديقه رقمياً. تجدون الملف مرفقاً أدناه.',
        timestamp: '2026-02-07 14:00 م',
        attachmentName: 'إثبات_طالب_مختوم_2026.pdf'
      }
    ]
  }
];

export const INITIAL_STUDY_GROUPS: StudyGroup[] = [
  {
    id: 'group-math-m3',
    name: 'غرفة مذاكرة الرياضيات - الثالث المتوسط',
    subject: 'الرياضيات',
    grade: 'الصف الثالث المتوسط',
    membersCount: 28,
    icon: '📐',
    description: 'مجموعة مخصصة للمناقشة الجماعية وتداول حلول مسائل المعادلات التربيعية المنهجية.'
  },
  {
    id: 'group-science-m3',
    name: 'نادي العلوم والابتكار (الثالث المتوسط)',
    subject: 'العلوم',
    grade: 'الصف الثالث المتوسط',
    membersCount: 22,
    icon: '🧪',
    description: 'مناقشة تجارب التفاعلات الكيميائية والجدول الدوري وتحضير الاختبارات القصيرة.'
  },
  {
    id: 'group-ai-s2',
    name: 'مجموعة مسار الهندسة والحاسب - الذكاء الاصطناعي',
    subject: 'الذكاء الاصطناعي',
    grade: 'الصف الثاني الثانوي',
    membersCount: 19,
    icon: '🤖',
    description: 'نقاشات التعلم الآلي، البرمجة، وتطبيقات منصة مدرستي وعين.'
  }
];

export const INITIAL_STUDY_MESSAGES: StudyGroupMessage[] = [
  {
    id: 'sgm-1',
    groupId: 'group-math-m3',
    senderName: 'سارة عبد الله العاصمي',
    senderAvatar: '👧',
    senderRole: 'student',
    text: 'يا زميلاتي، من جربت حل مسألة المميز في صفحة 64؟ القانون هو ب² - 4 أ ج والحل دقيق جداً باستخدام المساعد الذكي!',
    timestamp: 'منذ 10 دقائق',
    problemCitation: {
      question: 'أوجد مميز المعادلة: 2س² + 5س + 3 = 0',
      finalAnswer: 'المميز = 1 (حلان حقيقيان نسبيا)',
      bookName: 'الرياضيات - الثالث المتوسط',
      page: 64
    }
  },
  {
    id: 'sgm-2',
    groupId: 'group-math-m3',
    senderName: 'نورة الفهد',
    senderAvatar: '👩',
    senderRole: 'student',
    text: 'شرح ممتاز جداً يا سارة، جزاك الله خيراً! استوعبت خطوة التعويض الآن.',
    timestamp: 'منذ 5 دقائق'
  },
  {
    id: 'sgm-3',
    groupId: 'group-math-m3',
    senderName: 'أ. منصور العتيبي (معلم المادة)',
    senderAvatar: '👨‍🏫',
    senderRole: 'teacher',
    text: 'ممتازات يا طالبات، إجابة سارة صحيحة 100%. واصلن المراجعة معاً ولا تترددن في طرح الأفكار الصعبة.',
    timestamp: 'منذ دقيقتين'
  }
];

export const INITIAL_AUDIT_LOGS: ModerationAuditLogItem[] = [
  {
    id: 'audit-1',
    timestamp: '2026-02-09 08:32 ص',
    actorName: 'نظام الفلترة الآلي (AI Content Guard)',
    actorRole: 'super_admin',
    action: 'تنبيه فلترة آلية',
    targetUser: 'طالب في مجموعة العامة',
    details: 'تم رصد استخدام كلمة غير لائق محتواه وتفعيل الحظر الآلي لمنع النشر في غرفة المذاكرة.',
    severity: 'متوسط'
  },
  {
    id: 'audit-2',
    timestamp: '2026-02-08 11:20 ص',
    actorName: 'أ. عبد العزيز المقرن (مدير النظام)',
    actorRole: 'principal',
    action: 'تحديث منهج من بوابة عين',
    details: 'استنزال النسخة التفاعلية لكتاب الذكاء الاصطناعي 1 - مسارات 1447هـ.',
    severity: 'منخفض'
  },
  {
    id: 'audit-3',
    timestamp: '2026-02-07 15:45 م',
    actorName: 'د. إبراهيم السعيد (الموجه الطلابي)',
    actorRole: 'counselor',
    action: 'إغلاق تكت استفسار',
    targetUser: 'سارة العاصمي',
    details: 'إغلاق تكت التوجيه الأكاديمي بعد تزويد الطالبة بخطة المراجعة الذكية.',
    severity: 'منخفض'
  }
];

