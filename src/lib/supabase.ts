import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve Supabase credentials from Environment or LocalStorage fallback settings
const getSupabaseCredentials = () => {
  const meta = import.meta as any;
  const envUrl = meta.env?.VITE_SUPABASE_URL || meta.env?.SUPABASE_URL || '';
  const envKey = meta.env?.VITE_SUPABASE_ANON_KEY || meta.env?.SUPABASE_ANON_KEY || '';

  const savedUrl = localStorage.getItem('CUSTOM_SUPABASE_URL') || '';
  const savedKey = localStorage.getItem('CUSTOM_SUPABASE_ANON_KEY') || '';

  return {
    supabaseUrl: envUrl || savedUrl,
    supabaseAnonKey: envKey || savedKey,
  };
};

const credentials = getSupabaseCredentials();

export const isSupabaseConfigured = Boolean(
  credentials.supabaseUrl && credentials.supabaseAnonKey
);

// Fallback dummy values to prevent crash on initialization if keys aren't added yet
const dummyUrl = 'https://placeholder.supabase.co';
const dummyKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export const supabase: SupabaseClient = createClient(
  credentials.supabaseUrl || dummyUrl,
  credentials.supabaseAnonKey || dummyKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// Helper to update Supabase custom credentials if user enters them in UI settings
export function updateSupabaseConfig(url: string, key: string) {
  localStorage.setItem('CUSTOM_SUPABASE_URL', url.trim());
  localStorage.setItem('CUSTOM_SUPABASE_ANON_KEY', key.trim());
  window.location.reload();
}

// -------------------------------------------------------------
// SUPABASE AUTH HELPERS
// -------------------------------------------------------------

export async function signInWithGoogle() {
  const redirectUrl = window.location.origin;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, pass: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, pass: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });
  if (error) throw error;
  return data;
}

export async function signOutSupabase() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Signout error:', error);
}

export async function getCurrentSupabaseUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// -------------------------------------------------------------
// SUPABASE REAL DATABASE QUERIES
// -------------------------------------------------------------

export interface DbSchool {
  id: string;
  name: string;
  type: string; // حكومية / أهلية / عالمية
  gender_type: string; // بنين / بنات / مشتركة
  stage: string; // ابتدائي / متوسط / ثانوي / مجمع
  country: string;
  region: string;
  city: string;
  principal_name: string;
  phone: string;
  email: string;
  license_number?: string;
  academic_year: string;
  logo_url?: string;
  slug: string; // e.g. hataf-school
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  created_at: string;
}

export interface DbSchoolUser {
  id: string;
  school_id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: string; // school_admin | teacher | student | parent | counselor | vice_principal | administrator
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  created_at: string;
}

export type SupabaseSchoolUserLink = DbSchoolUser;

export interface DbStudent {
  id: string;
  user_id?: string;
  school_id: string;
  classroom_name: string;
  grade_name: string;
  student_number?: string;
  email: string;
  full_name: string;
  parent_phone?: string;
  parent_email?: string;
  teacher_id?: string;
  subject_name?: string;
  notes?: string;
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  created_at: string;
}

export interface DbInvitation {
  id: string;
  code: string;
  school_id: string;
  role: string;
  email?: string;
  student_name?: string;
  grade_name?: string;
  classroom_name?: string;
  teacher_id?: string;
  status: 'pending' | 'used' | 'cancelled';
  created_at: string;
}

export interface DbTeacherJoinRequest {
  id: string;
  school_id: string;
  user_id: string;
  full_name: string;
  email: string;
  subject: string;
  stage: string;
  grades?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

// 1. Fetch All Schools from Supabase
export async function fetchSupabaseSchools(): Promise<DbSchool[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .neq('status', 'inactive')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Supabase fetchSchools error or table missing:', error.message);
    return [];
  }
  return data || [];
}

// 2. Fetch Single School by Slug or ID
export async function fetchSupabaseSchoolBySlugOrId(identifier: string): Promise<DbSchool | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .or(`slug.eq.${identifier},id.eq.${identifier}`)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

// 3. Create a Real School in Supabase
export async function createSupabaseSchool(
  schoolData: Omit<DbSchool, 'id' | 'created_at' | 'status'>,
  userId: string,
  userEmail: string,
  userFullName: string
): Promise<{ school: DbSchool; userLink: DbSchoolUser }> {
  const schoolPayload = {
    ...schoolData,
    status: 'active',
    created_at: new Date().toISOString(),
  };

  const { data: school, error: schoolErr } = await supabase
    .from('schools')
    .insert([schoolPayload])
    .select()
    .single();

  if (schoolErr) throw schoolErr;

  const userLinkPayload = {
    school_id: school.id,
    user_id: userId,
    email: userEmail,
    full_name: userFullName,
    role: 'school_admin',
    status: 'active',
    created_at: new Date().toISOString(),
  };

  const { data: userLink, error: linkErr } = await supabase
    .from('school_users')
    .insert([userLinkPayload])
    .select()
    .single();

  if (linkErr) throw linkErr;

  return { school, userLink };
}

// 4. Get User's Active School Link from Supabase
export async function getSupabaseUserSchoolLink(userId: string, email?: string): Promise<DbSchoolUser | null> {
  if (!isSupabaseConfigured) return null;

  // First search by user_id
  let query = supabase.from('school_users').select('*').eq('user_id', userId).eq('status', 'active').maybeSingle();
  let { data, error } = await query;

  if (!data && email) {
    // If not found by user_id, search by email to auto-link
    const emailQuery = await supabase
      .from('school_users')
      .select('*')
      .eq('email', email)
      .eq('status', 'active')
      .maybeSingle();

    if (emailQuery.data) {
      // Update user_id to match Supabase auth user_id
      await supabase
        .from('school_users')
        .update({ user_id: userId })
        .eq('id', emailQuery.data.id);

      return { ...emailQuery.data, user_id: userId };
    }
  }

  if (error) return null;
  return data;
}

// 5. Match Invitation upon Google Sign-In
export async function checkAndMatchInvitationForUser(userId: string, userEmail: string, userFullName: string) {
  if (!isSupabaseConfigured || !userEmail) return null;

  // Search invitations matching user email
  const { data: invite, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('email', userEmail)
    .eq('status', 'pending')
    .maybeSingle();

  if (invite) {
    // Mark invitation as used
    await supabase.from('invitations').update({ status: 'used' }).eq('id', invite.id);

    // Create school_users record
    const { data: newSchoolUser } = await supabase
      .from('school_users')
      .insert([
        {
          school_id: invite.school_id,
          user_id: userId,
          email: userEmail,
          full_name: invite.student_name || userFullName,
          role: invite.role || 'student',
          status: 'active',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    // If role is student, link students table record
    if (invite.role === 'student') {
      await supabase
        .from('students')
        .update({ user_id: userId, status: 'active' })
        .eq('email', userEmail);
    }

    return newSchoolUser;
  }

  return null;
}

// 6. Join School using Code
export async function joinSupabaseSchoolByCode(code: string, userId: string, email: string, fullName: string) {
  if (!isSupabaseConfigured) throw new Error('قاعدة بيانات Supabase غير مهيأة.');

  // Check invitation code
  const { data: invite, error: inviteErr } = await supabase
    .from('invitations')
    .select('*')
    .eq('code', code.trim())
    .eq('status', 'pending')
    .maybeSingle();

  if (invite) {
    // Verify email if invite specified email
    if (invite.email && invite.email.toLowerCase() !== email.toLowerCase()) {
      throw new Error(`هذا البريد الإلكتروني (${email}) غير مطابق للبريد المخصص لدعوة المدرسة (${invite.email}).`);
    }

    await supabase.from('invitations').update({ status: 'used' }).eq('id', invite.id);

    const { data: link, error: linkErr } = await supabase
      .from('school_users')
      .insert([
        {
          school_id: invite.school_id,
          user_id: userId,
          email: email,
          full_name: invite.student_name || fullName,
          role: invite.role || 'student',
          status: 'active',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (linkErr) throw linkErr;

    if (invite.role === 'student') {
      await supabase.from('students').update({ user_id: userId, status: 'active' }).eq('email', email);
    }

    return link;
  }

  // Check school registration/access code directly
  const { data: school, error: schoolErr } = await supabase
    .from('schools')
    .select('*')
    .or(`id.eq.${code.trim()},license_number.eq.${code.trim()},slug.eq.${code.trim()}`)
    .maybeSingle();

  if (school) {
    const { data: link, error: linkErr } = await supabase
      .from('school_users')
      .insert([
        {
          school_id: school.id,
          user_id: userId,
          email: email,
          full_name: fullName,
          role: 'student', // Default role when joining school via code without specific role
          status: 'active',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (linkErr) throw linkErr;
    return link;
  }

  throw new Error('رمز الدعوة أو رمز المدرسة غير صحيح أو تم استخدامه مسبقاً.');
}

// 7. Add Student & Generate Invitation Code
export async function addSupabaseStudent(studentData: Omit<DbStudent, 'id' | 'created_at' | 'status'>) {
  const code = 'INV-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  const studentPayload = {
    ...studentData,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  const { data: student, error: studentErr } = await supabase
    .from('students')
    .insert([studentPayload])
    .select()
    .single();

  if (studentErr) throw studentErr;

  const invitationPayload = {
    code,
    school_id: studentData.school_id,
    role: 'student',
    email: studentData.email,
    student_name: studentData.full_name,
    grade_name: studentData.grade_name,
    classroom_name: studentData.classroom_name,
    teacher_id: studentData.teacher_id,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  const { data: invite, error: inviteErr } = await supabase
    .from('invitations')
    .insert([invitationPayload])
    .select()
    .single();

  if (inviteErr) throw inviteErr;

  return { student, invite };
}

// 8. Bulk Import Students
export async function bulkImportSupabaseStudents(
  studentsList: Array<{
    fullName: string;
    email: string;
    gradeName: string;
    classroomName: string;
    studentNumber?: string;
    parentPhone?: string;
    parentEmail?: string;
  }>,
  schoolId: string,
  teacherId?: string
) {
  const studentInserts = studentsList.map((s) => ({
    school_id: schoolId,
    full_name: s.fullName,
    email: s.email,
    grade_name: s.gradeName,
    classroom_name: s.classroomName,
    student_number: s.studentNumber || '',
    parent_phone: s.parentPhone || '',
    parent_email: s.parentEmail || '',
    teacher_id: teacherId || '',
    status: 'pending',
    created_at: new Date().toISOString(),
  }));

  const { data: insertedStudents, error: stErr } = await supabase
    .from('students')
    .insert(studentInserts)
    .select();

  if (stErr) throw stErr;

  const inviteInserts = studentsList.map((s) => ({
    code: 'INV-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    school_id: schoolId,
    role: 'student',
    email: s.email,
    student_name: s.fullName,
    grade_name: s.gradeName,
    classroom_name: s.classroomName,
    teacher_id: teacherId || '',
    status: 'pending',
    created_at: new Date().toISOString(),
  }));

  const { data: insertedInvites, error: invErr } = await supabase
    .from('invitations')
    .insert(inviteInserts)
    .select();

  if (invErr) throw invErr;

  return { insertedStudents, insertedInvites };
}

// 9. Fetch Students for School/Teacher
export async function fetchSupabaseStudents(schoolId: string, teacherId?: string): Promise<DbStudent[]> {
  if (!isSupabaseConfigured) return [];

  let query = supabase.from('students').select('*').eq('school_id', schoolId);

  if (teacherId) {
    query = query.eq('teacher_id', teacherId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) {
    console.warn('Fetch students error:', error.message);
    return [];
  }
  return data || [];
}

// 10. Fetch Teacher Join Requests for Principal Approval
export async function fetchSupabaseTeacherJoinRequests(schoolId: string): Promise<DbTeacherJoinRequest[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('teacher_join_requests')
    .select('*')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

// 11. Create Teacher Join Request
export async function createTeacherJoinRequest(reqData: Omit<DbTeacherJoinRequest, 'id' | 'created_at' | 'status'>) {
  const payload = {
    ...reqData,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('teacher_join_requests')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 12. Approve / Reject Teacher Join Request
export async function updateTeacherJoinRequestStatus(requestId: string, status: 'approved' | 'rejected') {
  const { data: request, error: reqErr } = await supabase
    .from('teacher_join_requests')
    .update({ status })
    .eq('id', requestId)
    .select()
    .single();

  if (reqErr) throw reqErr;

  if (status === 'approved') {
    // Add user as teacher in school_users
    await supabase.from('school_users').insert([
      {
        school_id: request.school_id,
        user_id: request.user_id,
        email: request.email,
        full_name: request.full_name,
        role: 'teacher',
        status: 'active',
        created_at: new Date().toISOString(),
      },
    ]);

    // Add row in teachers table
    await supabase.from('teachers').insert([
      {
        school_id: request.school_id,
        user_id: request.user_id,
        full_name: request.full_name,
        email: request.email,
        specialization: request.subject,
        assigned_classrooms: request.grades || '',
        assigned_subjects: request.subject,
        status: 'active',
        created_at: new Date().toISOString(),
      },
    ]);
  }

  return request;
}

// 13. Fetch Teachers for School
export async function fetchSupabaseTeachers(schoolId: string) {
  if (!isSupabaseConfigured) return [];
  
  // Query teachers table
  const { data: teachersData } = await supabase
    .from('teachers')
    .select('*')
    .eq('school_id', schoolId)
    .neq('status', 'inactive');

  // Also query school_users where role='teacher'
  const { data: schoolUsersData } = await supabase
    .from('school_users')
    .select('*')
    .eq('school_id', schoolId)
    .eq('role', 'teacher')
    .eq('status', 'active');

  const listMap = new Map<string, any>();

  if (teachersData) {
    teachersData.forEach((t) => {
      listMap.set(t.email || t.id, {
        id: t.id,
        fullName: t.full_name,
        email: t.email,
        subject: t.specialization || t.assigned_subjects || 'معلم مواد عامة',
        assignedClassrooms: t.assigned_classrooms || 'فصول متعددة',
        status: t.status || 'active',
        created_at: t.created_at
      });
    });
  }

  if (schoolUsersData) {
    schoolUsersData.forEach((u) => {
      if (!listMap.has(u.email)) {
        listMap.set(u.email, {
          id: u.id,
          fullName: u.full_name,
          email: u.email,
          subject: 'معلم تخصصي',
          assignedClassrooms: 'جميع فصول المرحلة',
          status: u.status || 'active',
          created_at: u.created_at
        });
      }
    });
  }

  return Array.from(listMap.values());
}

// 14. Fetch Principal Live Dashboard Statistics
export interface PrincipalDashboardStats {
  activeStudentsCount: number;
  activeTeachersCount: number;
  pendingJoinRequestsCount: number;
  pendingInvitationsCount: number;
  totalClassroomsCount: number;
  gradeDistribution: Array<{ name: string; count: number; percentage: number }>;
  classroomDistribution: Array<{ name: string; count: number; grade: string }>;
  teachersList: Array<{ id: string; fullName: string; email: string; subject: string; assignedClassrooms: string; status: string }>;
  studentsList: DbStudent[];
  joinRequests: DbTeacherJoinRequest[];
}

export async function fetchPrincipalDashboardStats(schoolId: string): Promise<PrincipalDashboardStats> {
  if (!isSupabaseConfigured) {
    return {
      activeStudentsCount: 0,
      activeTeachersCount: 0,
      pendingJoinRequestsCount: 0,
      pendingInvitationsCount: 0,
      totalClassroomsCount: 0,
      gradeDistribution: [],
      classroomDistribution: [],
      teachersList: [],
      studentsList: [],
      joinRequests: [],
    };
  }

  try {
    // 1. Fetch Students
    const students = await fetchSupabaseStudents(schoolId);

    // 2. Fetch School Users (to catch students/teachers without row in secondary tables)
    const { data: schoolUsers } = await supabase
      .from('school_users')
      .select('*')
      .eq('school_id', schoolId)
      .eq('status', 'active');

    // 3. Fetch Teachers
    const teachersList = await fetchSupabaseTeachers(schoolId);

    // 4. Fetch Join Requests
    const joinRequests = await fetchSupabaseTeacherJoinRequests(schoolId);
    const pendingRequests = joinRequests.filter(r => r.status === 'pending');

    // 5. Fetch Pending Invitations
    const { data: invitations } = await supabase
      .from('invitations')
      .select('*')
      .eq('school_id', schoolId)
      .eq('status', 'pending');

    // Count Active Students
    const studentUsersCount = (schoolUsers || []).filter(u => u.role === 'student').length;
    const activeStudentsCount = Math.max(students.length, studentUsersCount);

    // Count Active Teachers
    const teacherUsersCount = (schoolUsers || []).filter(u => u.role === 'teacher').length;
    const activeTeachersCount = Math.max(teachersList.length, teacherUsersCount);

    // Grade Distribution Calculation
    const gradeMap: Record<string, number> = {};
    const classMap: Record<string, { count: number; grade: string }> = {};

    students.forEach((st) => {
      const grade = st.grade_name || 'غير محدد';
      const classroom = st.classroom_name ? `${st.classroom_name}` : 'عام';

      gradeMap[grade] = (gradeMap[grade] || 0) + 1;

      const classKey = `${grade} - ${classroom}`;
      if (!classMap[classKey]) {
        classMap[classKey] = { count: 0, grade };
      }
      classMap[classKey].count += 1;
    });

    // Format Grade Distribution
    const totalWithGrades = Object.values(gradeMap).reduce((a, b) => a + b, 0) || 1;
    const gradeDistribution = Object.entries(gradeMap).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / totalWithGrades) * 100)
    }));

    // Format Classroom Distribution
    const classroomDistribution = Object.entries(classMap).map(([name, data]) => ({
      name,
      count: data.count,
      grade: data.grade
    }));

    return {
      activeStudentsCount,
      activeTeachersCount,
      pendingJoinRequestsCount: pendingRequests.length,
      pendingInvitationsCount: (invitations || []).length,
      totalClassroomsCount: Object.keys(classMap).length || 1,
      gradeDistribution,
      classroomDistribution,
      teachersList,
      studentsList: students,
      joinRequests: pendingRequests
    };
  } catch (err) {
    console.warn('Error fetching principal stats:', err);
    return {
      activeStudentsCount: 0,
      activeTeachersCount: 0,
      pendingJoinRequestsCount: 0,
      pendingInvitationsCount: 0,
      totalClassroomsCount: 0,
      gradeDistribution: [],
      classroomDistribution: [],
      teachersList: [],
      studentsList: [],
      joinRequests: []
    };
  }
}

