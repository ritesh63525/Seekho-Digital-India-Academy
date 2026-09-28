
import {API_BASE_URL} from './authApi';

import {
  getOnboardingCourses,
  type OnboardingCourse,
} from './onboardingCoursesApi';

type ApiObject = Record<string, unknown>;

export type LearningCourse = OnboardingCourse;

export type StudentLearningProfile = {
  name: string;
  email: string;
  studentStatus: string;
  assignedCourseId: string;
  assignedCourseTitle: string;
};

export type LearningCourseDetails = {
  id: string;
  title: string;
  description: string;
};

function asObject(value: unknown): ApiObject {
  if (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    return value as ApiObject;
  }

  return {};
}

function asText(value: unknown): string {
  if (
    typeof value === 'string' ||
    typeof value === 'number'
  ) {
    return String(value).trim();
  }

  return '';
}

function firstText(...values: unknown[]): string {
  for (const value of values) {
    const text = asText(value);

    if (text) {
      return text;
    }
  }

  return '';
}

function apiError(
  result: unknown,
  fallback: string,
): string {
  const root = asObject(result);
  const detail = root.detail;

  if (typeof detail === 'string' && detail.trim()) {
    return detail.trim();
  }

  const message = root.message;

  if (typeof message === 'string' && message.trim()) {
    return message.trim();
  }

  return fallback;
}

async function getJSON(
  path: string,
  token?: string,
): Promise<unknown> {
  const baseURL = API_BASE_URL.replace(/\/+$/, '');

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(
      `${baseURL}${path}`,
      {
        method: 'GET',
        headers,
      },
    );
  } catch {
    throw new Error(
      'Unable to connect to the academy server. Check your network and try again.',
    );
  }

  let result: unknown;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      'The academy server returned an invalid response.',
    );
  }

  if (!response.ok) {
    throw new Error(
      apiError(
        result,
        `Request failed (${response.status}).`,
      ),
    );
  }

  if (asObject(result).success === false) {
    throw new Error(
      apiError(
        result,
        'Unable to load learning information.',
      ),
    );
  }

  return result;
}

/*
 * Logged-in student's real profile.
 *
 * Endpoint:
 * GET /api/v1/student-auth/profile
 */

export async function getStudentLearningProfile(
  accessToken: string,
): Promise<StudentLearningProfile> {
  if (!accessToken.trim()) {
    throw new Error(
      'Your student session is missing. Please sign in again.',
    );
  }

  const response = await getJSON(
    '/api/v1/student-auth/profile',
    accessToken,
  );

  const root = asObject(response);
  const data = asObject(root.data ?? root);

  const student = asObject(
    data.student ?? data.profile ?? data,
  );

  const account = asObject(data.account);

  if (Object.keys(student).length === 0) {
    throw new Error(
      'The student profile response is empty.',
    );
  }

  const course = asObject(
    student.assigned_course ??
      student.course ??
      data.assigned_course,
  );

  const combinedName = [
    asText(student.first_name),
    asText(student.last_name),
  ]
    .filter(Boolean)
    .join(' ');

  const courseTitle = firstText(
    course.title,
    course.name,
    course.course_name,
    student.course_name,
    data.course_name,
    typeof student.assigned_course === 'string'
      ? student.assigned_course
      : '',
    typeof student.course === 'string'
      ? student.course
      : '',
  );

  const courseId = firstText(
    course.id,
    course.course_id,
    course.uuid,
    student.assigned_course_id,
    student.course_id,
    data.assigned_course_id,
    data.course_id,
  );

  return {
    name:
      firstText(
        student.full_name,
        student.name,
        combinedName,
      ) || 'Student',

    email: firstText(
      student.email,
      account.email,
      data.email,
    ),

    studentStatus: firstText(
      student.status,
      account.status,
    ),

    assignedCourseId: courseId,

    assignedCourseTitle: courseTitle,
  };
}

/*
 * Real public course catalog.
 *
 * Reuse the service that already powers
 * Courses We Offer in onboarding.
 *
 * Endpoint:
 * GET /api/v1/courses
 */

export async function getLearningCourses(): Promise<
  LearningCourse[]
> {
  return getOnboardingCourses();
}

/*
 * Real course details.
 *
 * Endpoint:
 * GET /api/v1/courses/{id}
 *
 * This does not invent lesson or progress data.
 */

export async function getLearningCourseDetails(
  courseId: string,
): Promise<LearningCourseDetails> {
  const id = courseId.trim();

  if (!id) {
    throw new Error('Course ID is missing.');
  }

  const response = await getJSON(
    `/api/v1/courses/${encodeURIComponent(id)}`,
  );

  const root = asObject(response);
  const data = asObject(root.data ?? root);

  const course = asObject(
    data.course ?? data,
  );

  const title = firstText(
    course.title,
    course.name,
    course.course_name,
  );

  if (!title) {
    throw new Error(
      'The course details response is incomplete.',
    );
  }

  return {
    id: firstText(
      course.id,
      course.uuid,
      id,
    ),

    title,

    description: firstText(
      course.short_description,
      course.description,
    ),
  };
}