import {API_BASE_URL} from './authApi';

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
 * STUDENT SCHEDULE ITEM
 * =====================================================
 */

export type StudentScheduleItem = {
  id: string;

  title: string;

  description?: string | null;

  target_type?: string | null;

  target_course?: string | null;

  session_type?: string | null;

  instructor?: string | null;

  mode?: string | null;

  location?: string | null;

  meeting_url?: string | null;

  start_at?: string | null;

  end_at?: string | null;

  status?: string | null;

  is_read?: boolean;

  read?: boolean;

  created_at?: string | null;

  updated_at?: string | null;

  [key: string]: unknown;
};

/*
 * Backend GET response ka exact sample
 * collection me saved nahi hai,
 * isliye common wrappers safely support kar rahe hain.
 */

type RawScheduleResponse =
  | StudentScheduleItem[]
  | {
      success?: boolean;

      message?: string;

      data?:
        | StudentScheduleItem[]
        | {
            items?: StudentScheduleItem[];

            schedules?: StudentScheduleItem[];

            schedule?: StudentScheduleItem[];
          };

      items?: StudentScheduleItem[];

      schedules?: StudentScheduleItem[];

      schedule?: StudentScheduleItem[];

      pagination?: {
        page?: number;

        limit?: number;

        total?: number;

        total_pages?: number;
      };
    };

export type StudentScheduleResponse = {
  items: StudentScheduleItem[];

  message?: string;

  pagination?: {
    page?: number;

    limit?: number;

    total?: number;

    total_pages?: number;
  };
};

/*
 * =====================================================
 * NORMALIZE RESPONSE
 * =====================================================
 */

function normalizeScheduleResponse(
  result: RawScheduleResponse,
): StudentScheduleResponse {
  /*
   * Direct array
   */
  if (Array.isArray(result)) {
    return {
      items: result,
    };
  }

  /*
   * {
   *   data: [...]
   * }
   */
  if (
    Array.isArray(result.data)
  ) {
    return {
      items: result.data,

      message:
        result.message,

      pagination:
        result.pagination,
    };
  }

  /*
   * {
   *   data: {
   *     items: [...]
   *   }
   * }
   */
  if (
    result.data &&
    !Array.isArray(result.data)
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

        pagination:
          result.pagination,
      };
    }

    if (
      Array.isArray(
        result.data.schedules,
      )
    ) {
      return {
        items:
          result.data.schedules,

        message:
          result.message,

        pagination:
          result.pagination,
      };
    }

    if (
      Array.isArray(
        result.data.schedule,
      )
    ) {
      return {
        items:
          result.data.schedule,

        message:
          result.message,

        pagination:
          result.pagination,
      };
    }
  }

  /*
   * {
   *   items: [...]
   * }
   */
  if (
    Array.isArray(result.items)
  ) {
    return {
      items:
        result.items,

      message:
        result.message,

      pagination:
        result.pagination,
    };
  }

  /*
   * {
   *   schedules: [...]
   * }
   */
  if (
    Array.isArray(
      result.schedules,
    )
  ) {
    return {
      items:
        result.schedules,

      message:
        result.message,

      pagination:
        result.pagination,
    };
  }

  /*
   * {
   *   schedule: [...]
   * }
   */
  if (
    Array.isArray(
      result.schedule,
    )
  ) {
    return {
      items:
        result.schedule,

      message:
        result.message,

      pagination:
        result.pagination,
    };
  }

  return {
    items: [],

    message:
      result.message,

    pagination:
      result.pagination,
  };
}

/*
 * =====================================================
 * GET STUDENT SCHEDULE
 *
 * scope:
 * all
 * upcoming
 * past
 * =====================================================
 */

export async function getStudentSchedule(
  accessToken: string,
  options?: {
    page?: number;

    limit?: number;

    unreadOnly?: boolean;

    scope?:
      | 'all'
      | 'upcoming'
      | 'past';
  },
): Promise<StudentScheduleResponse> {
  const page =
    options?.page ?? 1;

  const limit =
    options?.limit ?? 20;

  const unreadOnly =
    options?.unreadOnly ??
    false;

  const scope =
    options?.scope ?? 'all';

  const query =
    `page=${page}` +
    `&limit=${limit}` +
    `&unread_only=${unreadOnly}` +
    `&scope=${scope}`;

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/api/v1/schedule/student?${query}`,
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
        'Unable to load live classes.',
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
        'Unable to load live classes.',
      ),
    );
  }

  return normalizeScheduleResponse(
    result as RawScheduleResponse,
  );
}