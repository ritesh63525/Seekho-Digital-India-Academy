import {API_BASE_URL} from './authApi';
import {CourseItem} from './studentApi';

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

/*
 * =====================================================
 * COURSE DETAIL
 *
 * GET
 * /api/v1/courses/{courseId}
 * =====================================================
 */

type RawCourseDetailResponse =
  | CourseItem
  | {
      success?: boolean;

      message?: string;

      data?:
        | CourseItem
        | {
            course?: CourseItem;
          };

      course?: CourseItem;
    };

export type CourseDetailResponse = {
  course: CourseItem;

  message?: string;
};

function isCourseItem(
  value: unknown,
): value is CourseItem {
  if (
    !value ||
    typeof value !== 'object'
  ) {
    return false;
  }

  const item =
    value as Record<
      string,
      unknown
    >;

  return (
    typeof item.id ===
      'string' &&
    typeof item.title ===
      'string'
  );
}

function normalizeCourseDetail(
  result: RawCourseDetailResponse,
): CourseDetailResponse {
  /*
   * Direct course object
   */
  if (isCourseItem(result)) {
    return {
      course: result,
    };
  }

  /*
   * {
   *   data: {...course}
   * }
   */
  if (
    result.data &&
    isCourseItem(result.data)
  ) {
    return {
      course: result.data,
      message:
        result.message,
    };
  }

  /*
   * {
   *   data: {
   *     course: {...}
   *   }
   * }
   */
  if (
    result.data &&
    typeof result.data ===
      'object' &&
    'course' in result.data &&
    isCourseItem(
      result.data.course,
    )
  ) {
    return {
      course:
        result.data.course,

      message:
        result.message,
    };
  }

  /*
   * {
   *   course: {...}
   * }
   */
  if (
    result.course &&
    isCourseItem(
      result.course,
    )
  ) {
    return {
      course:
        result.course,

      message:
        result.message,
    };
  }

  throw new Error(
    'Course details were not found in the server response.',
  );
}

export async function getCourseById(
  accessToken: string,
  courseId: string,
): Promise<CourseDetailResponse> {
  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/api/v1/courses/${encodeURIComponent(
        courseId,
      )}`,
      {
        method: 'GET',

        headers: {
          Accept:
            'application/json',

          Authorization:
            `Bearer ${accessToken}`,
        },
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
        'Unable to load course details.',
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
        'Unable to load course details.',
      ),
    );
  }

  return normalizeCourseDetail(
    result as RawCourseDetailResponse,
  );
}