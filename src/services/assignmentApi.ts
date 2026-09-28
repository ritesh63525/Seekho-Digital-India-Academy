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
 * ASSIGNMENT MODEL
 * =====================================================
 */

export type StudentAssignment = {
  id: string;

  title: string;

  description?: string | null;

  instructions?: string | null;

  target_type?: string | null;

  target_course_id?: string | null;

  target_course_name?: string | null;

  due_at?: string | null;

  max_marks?: number | null;

  status?: string | null;

  is_read?: boolean;

  read?: boolean;

  attachment_name?: string | null;

  attachment_url?: string | null;

  submitted?: boolean;

  submission_status?: string | null;

  submitted_at?: string | null;

  text_answer?: string | null;

  marks_obtained?: number | null;

  feedback?: string | null;

  created_at?: string | null;

  updated_at?: string | null;

  [key: string]: unknown;
};

/*
 * =====================================================
 * LIST RESPONSE
 *
 * Exact response wrapper sample Postman me
 * saved nahi hai, isliye common wrappers
 * safely handle kar rahe hain.
 * =====================================================
 */

type RawAssignmentsResponse =
  | StudentAssignment[]
  | {
      success?: boolean;

      message?: string;

      data?:
        | StudentAssignment[]
        | {
            items?: StudentAssignment[];

            assignments?: StudentAssignment[];

            pagination?: {
              page?: number;
              limit?: number;
              total?: number;
              total_pages?: number;
            };
          };

      items?: StudentAssignment[];

      assignments?: StudentAssignment[];

      pagination?: {
        page?: number;
        limit?: number;
        total?: number;
        total_pages?: number;
      };
    };

export type StudentAssignmentsResponse = {
  items: StudentAssignment[];

  message?: string;

  pagination?: {
    page?: number;

    limit?: number;

    total?: number;

    total_pages?: number;
  };
};

function normalizeAssignmentsResponse(
  result: RawAssignmentsResponse,
): StudentAssignmentsResponse {
  if (Array.isArray(result)) {
    return {
      items: result,
    };
  }

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
          result.data.pagination ||
          result.pagination,
      };
    }

    if (
      Array.isArray(
        result.data.assignments,
      )
    ) {
      return {
        items:
          result.data.assignments,

        message:
          result.message,

        pagination:
          result.data.pagination ||
          result.pagination,
      };
    }
  }

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

  if (
    Array.isArray(
      result.assignments,
    )
  ) {
    return {
      items:
        result.assignments,

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
 * LIST STUDENT ASSIGNMENTS
 *
 * GET
 * /api/v1/assignments/student
 * =====================================================
 */

export async function getStudentAssignments(
  accessToken: string,
  options?: {
    page?: number;

    limit?: number;

    unreadOnly?: boolean;
  },
): Promise<StudentAssignmentsResponse> {
  const page =
    options?.page ?? 1;

  const limit =
    options?.limit ?? 20;

  const unreadOnly =
    options?.unreadOnly ??
    false;

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/api/v1/assignments/student?page=${page}&limit=${limit}&unread_only=${unreadOnly}`,
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
        'Unable to load assignments.',
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
        'Unable to load assignments.',
      ),
    );
  }

  return normalizeAssignmentsResponse(
    result as RawAssignmentsResponse,
  );
}

/*
 * =====================================================
 * MARK ONE ASSIGNMENT READ
 *
 * POST
 * /api/v1/assignments/student/{id}/read
 * =====================================================
 */

export async function markAssignmentRead(
  accessToken: string,
  assignmentId: string,
) {
  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/api/v1/assignments/student/${encodeURIComponent(
        assignmentId,
      )}/read`,
      {
        method: 'POST',

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
      'Unable to update assignment status.',
    );
  }

  const result =
    await readJson(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        result,
        'Unable to mark assignment as read.',
      ),
    );
  }

  return result;
}

/*
 * =====================================================
 * MARK ALL ASSIGNMENTS READ
 *
 * POST
 * /api/v1/assignments/student/mark-all-read
 * =====================================================
 */

export async function markAllAssignmentsRead(
  accessToken: string,
) {
  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/api/v1/assignments/student/mark-all-read`,
      {
        method: 'POST',

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
      'Unable to update assignments.',
    );
  }

  const result =
    await readJson(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        result,
        'Unable to mark assignments as read.',
      ),
    );
  }

  return result;
}

/*
 * =====================================================
 * SUBMISSION FILE TYPE
 * =====================================================
 */

export type AssignmentUploadFile = {
  uri: string;

  name: string;

  type: string;
};

/*
 * =====================================================
 * SUBMIT ASSIGNMENT
 *
 * POST
 * /api/v1/assignments/student/{id}/submit
 *
 * multipart/form-data:
 * text_answer
 * file
 * =====================================================
 */

export async function submitStudentAssignment(
  accessToken: string,
  assignmentId: string,
  options: {
    textAnswer?: string;

    file?: AssignmentUploadFile | null;
  },
) {
  const formData =
    new FormData();

  if (
    options.textAnswer?.trim()
  ) {
    formData.append(
      'text_answer',
      options.textAnswer.trim(),
    );
  }

  if (options.file) {
    formData.append(
      'file',
      {
        uri:
          options.file.uri,

        name:
          options.file.name,

        type:
          options.file.type,
      } as any,
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/api/v1/assignments/student/${encodeURIComponent(
        assignmentId,
      )}/submit`,
      {
        method: 'POST',

        headers: {
          Accept:
            'application/json',

          Authorization:
            `Bearer ${accessToken}`,

          /*
           * Content-Type manually MAT set karna.
           *
           * React Native automatically
           * multipart boundary generate karega.
           */
        },

        body: formData,
      },
    );
  } catch {
    throw new Error(
      'Unable to submit assignment. Please check your network connection.',
    );
  }

  const result =
    await readJson(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        result,
        'Unable to submit assignment.',
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
        'Unable to submit assignment.',
      ),
    );
  }

  return result;
}