import {API_BASE_URL} from './authApi';

/*
 * =====================================================
 * COMMON BACKEND ERROR
 * =====================================================
 */

type BackendErrorResponse = {
  success?: boolean;

  message?: string;

  detail?: string;

  error?: {
    code?: string;
    message?: string;
  };
};

async function readJson(
  response: Response,
): Promise<any> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getErrorMessage(
  result: BackendErrorResponse | null,
  fallback: string,
) {
  return (
    result?.error?.message ||
    result?.detail ||
    result?.message ||
    fallback
  );
}

async function authorizedGet<T>(
  path: string,
  accessToken?: string | null,
): Promise<T> {
  let response: Response;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (accessToken) {
    headers.Authorization =
      `Bearer ${accessToken}`;
  }

  try {
    response = await fetch(
      `${API_BASE_URL}${path}`,
      {
        method: 'GET',
        headers,
      },
    );
  } catch {
    throw new Error(
      'Unable to connect to the server. Please check your network connection.',
    );
  }

  const result =
    await readJson(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        result,
        'Unable to load data.',
      ),
    );
  }

  if (
    result &&
    result.success === false
  ) {
    throw new Error(
      getErrorMessage(
        result,
        'Unable to load data.',
      ),
    );
  }

  return result as T;
}

/*
 * =====================================================
 * STUDENT PROFILE
 *
 * GET
 * /api/v1/student-auth/profile
 * =====================================================
 */

export type StudentAccount = {
  id: string;

  cvengine_student_id: string;

  email: string;

  is_active: boolean;

  must_change_password: boolean;
};

export type StudentProfileData = {
  id: string;

  name: string;

  first_name?: string | null;

  last_name?: string | null;

  email: string;

  phone: string;

  course: string;

  status: string;

  isActive: boolean;

  address?: string | null;

  admission_date?: string | null;

  fees_status?: string | null;

  total_fees?: number | null;

  paid_fees?: number | null;

  remaining_fees?: number | null;

  profile_photo?: string | null;

  id_proof_document?: string | null;

  qualification_document?: string | null;

  created_at?: string | null;

  updated_at?: string | null;

  created_by?: string | null;

  updated_by?: string | null;
};

export type StudentProfileResponse = {
  success: true;

  message: string;

  data: {
    account: StudentAccount;

    student: StudentProfileData;
  };
};

export async function getStudentProfile(
  accessToken: string,
) {
  return authorizedGet<StudentProfileResponse>(
    '/api/v1/student-auth/profile',
    accessToken,
  );
}

/*
 * =====================================================
 * STUDENT ATTENDANCE
 *
 * GET
 * /api/v1/student-auth/attendance?page=1&limit=30
 * =====================================================
 */

export type AttendanceSummary = {
  total_days: number;

  present: number;

  absent: number;

  late: number;

  leave: number;

  half_day: number;

  attendance_percentage: number;
};

export type AttendanceItem = {
  id: string;

  date: string;

  student_id: string;

  student_name: string;

  student_email: string;

  course: string;

  status: string;

  check_in?: string | null;

  check_out?: string | null;

  remarks?: string | null;

  marked_by?: string | null;

  created_at?: string | null;

  updated_at?: string | null;
};

export type StudentAttendanceResponse = {
  success: true;

  message: string;

  data: {
    student: StudentProfileData;

    summary: AttendanceSummary;

    items: AttendanceItem[];

    pagination?: {
      page?: number;

      limit?: number;

      total?: number;

      total_pages?: number;
    };
  };
};

export async function getStudentAttendance(
  accessToken: string,
  page = 1,
  limit = 30,
) {
  return authorizedGet<StudentAttendanceResponse>(
    `/api/v1/student-auth/attendance?page=${page}&limit=${limit}`,
    accessToken,
  );
}

/*
 * =====================================================
 * COURSES
 *
 * GET
 * /api/v1/courses
 *
 * Exact GET response wrapper backend ne
 * abhi separately sample nahi bheja hai.
 * Isliye normalization defensive rakhi hai.
 * =====================================================
 */

export type CourseItem = {
  id: string;

  title: string;

  slug?: string | null;

  short_description?: string | null;

  description?: string | null;

  is_active?: boolean;

  price?: number | null;

  discount_price?: number | null;

  is_free?: boolean;

  enrollment_open?: boolean;

  thumbnail?: string | null;

  image?: string | null;

  duration?: string | null;

  created_at?: string | null;

  updated_at?: string | null;

  [key: string]: unknown;
};

type RawCoursesResponse =
  | CourseItem[]
  | {
      success?: boolean;

      message?: string;

      data?:
        | CourseItem[]
        | {
            items?: CourseItem[];
            courses?: CourseItem[];
          };

      items?: CourseItem[];

      courses?: CourseItem[];
    };

export type CoursesResponse = {
  items: CourseItem[];

  message?: string;
};

function normalizeCoursesResponse(
  result: RawCoursesResponse,
): CoursesResponse {
  if (Array.isArray(result)) {
    return {
      items: result,
    };
  }

  if (
    Array.isArray(
      result?.data,
    )
  ) {
    return {
      items: result.data,
      message: result.message,
    };
  }

  if (
    result?.data &&
    !Array.isArray(
      result.data,
    )
  ) {
    if (
      Array.isArray(
        result.data.items,
      )
    ) {
      return {
        items:
          result.data.items,
        message:
          result.message,
      };
    }

    if (
      Array.isArray(
        result.data.courses,
      )
    ) {
      return {
        items:
          result.data.courses,
        message:
          result.message,
      };
    }
  }

  if (
    Array.isArray(
      result?.items,
    )
  ) {
    return {
      items: result.items,
      message: result.message,
    };
  }

  if (
    Array.isArray(
      result?.courses,
    )
  ) {
    return {
      items: result.courses,
      message: result.message,
    };
  }

  return {
    items: [],
    message:
      result?.message,
  };
}

export async function getCourses(
  accessToken?: string | null,
): Promise<CoursesResponse> {
  const result =
    await authorizedGet<RawCoursesResponse>(
      '/api/v1/courses',
      accessToken,
    );

  return normalizeCoursesResponse(
    result,
  );
}