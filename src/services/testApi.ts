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

async function studentRequest<T>(
  path: string,
  accessToken: string,
  options?: {
    method?: 'GET' | 'POST';
    body?: unknown;
  },
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}${path}`,
      {
        method:
          options?.method ||
          'GET',

        headers: {
          Accept:
            'application/json',

          'Content-Type':
            'application/json',

          Authorization:
            `Bearer ${accessToken}`,
        },

        body:
          options?.body !==
          undefined
            ? JSON.stringify(
                options.body,
              )
            : undefined,
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
        'Unable to complete the request.',
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
        'Unable to complete the request.',
      ),
    );
  }

  return result as T;
}

/*
 * =====================================================
 * TEST MODEL
 * =====================================================
 */

export type StudentTest = {
  id: string;

  title: string;

  description?: string | null;

  instructions?: string | null;

  kind?: string | null;

  status?: string | null;

  duration_minutes?: number | null;

  passing_percentage?: number | null;

  max_attempts?: number | null;

  target_type?: string | null;

  target_course_id?: string | null;

  target_course_name?: string | null;

  start_at?: string | null;

  end_at?: string | null;

  show_result_immediately?: boolean;

  is_active?: boolean;

  questions_count?: number | null;

  attempt_count?: number | null;

  can_attempt?: boolean;

  [key: string]: unknown;
};

/*
 * Backend test creation model me
 * title, description, instructions,
 * kind, duration_minutes,
 * passing_percentage, max_attempts,
 * start_at/end_at etc. fields hain.
 */

/*
 * =====================================================
 * QUESTION MODEL
 * =====================================================
 */

export type TestQuestion = {
  id: string;

  test_question_id?: string;

  question_text: string;

  question_type?: string | null;

  difficulty?: string | null;

  option_a?: string | null;

  option_b?: string | null;

  option_c?: string | null;

  option_d?: string | null;

  marks?: number | null;

  order_index?: number | null;

  selected_option?: string | null;

  answer_text?: string | null;

  [key: string]: unknown;
};

/*
 * =====================================================
 * TEST LIST
 * =====================================================
 */

type RawTestsResponse =
  | StudentTest[]
  | {
      success?: boolean;

      message?: string;

      data?:
        | StudentTest[]
        | {
            items?: StudentTest[];

            tests?: StudentTest[];

            quizzes?: StudentTest[];
          };

      items?: StudentTest[];

      tests?: StudentTest[];

      quizzes?: StudentTest[];
    };

export type StudentTestsResponse = {
  items: StudentTest[];

  message?: string;
};

function normalizeTestsResponse(
  result: RawTestsResponse,
): StudentTestsResponse {
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
      };
    }

    if (
      Array.isArray(
        result.data.tests,
      )
    ) {
      return {
        items:
          result.data.tests,

        message:
          result.message,
      };
    }

    if (
      Array.isArray(
        result.data.quizzes,
      )
    ) {
      return {
        items:
          result.data.quizzes,

        message:
          result.message,
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
    };
  }

  if (
    Array.isArray(result.tests)
  ) {
    return {
      items:
        result.tests,

      message:
        result.message,
    };
  }

  if (
    Array.isArray(
      result.quizzes,
    )
  ) {
    return {
      items:
        result.quizzes,

      message:
        result.message,
    };
  }

  return {
    items: [],

    message:
      result.message,
  };
}

/*
 * =====================================================
 * GET STUDENT TESTS
 *
 * GET
 * /api/v1/tests-quizzes/student
 * =====================================================
 */

export async function getStudentTests(
  accessToken: string,
): Promise<StudentTestsResponse> {
  const result =
    await studentRequest<RawTestsResponse>(
      '/api/v1/tests-quizzes/student',
      accessToken,
    );

  return normalizeTestsResponse(
    result,
  );
}

/*
 * =====================================================
 * START TEST
 *
 * POST
 * /api/v1/tests-quizzes/student/{testId}/start
 * =====================================================
 */

export type StartTestResponse = {
  success?: boolean;

  message?: string;

  data?: {
    attempt_id?: string;

    attempt?: {
      id?: string;

      attempt_id?: string;

      [key: string]: unknown;
    };

    test?: StudentTest;

    questions?: TestQuestion[];

    [key: string]: unknown;
  };

  attempt_id?: string;

  attempt?: {
    id?: string;

    attempt_id?: string;

    [key: string]: unknown;
  };

  test?: StudentTest;

  questions?: TestQuestion[];

  [key: string]: unknown;
};

export async function startStudentTest(
  accessToken: string,
  testId: string,
): Promise<StartTestResponse> {
  return studentRequest<StartTestResponse>(
    `/api/v1/tests-quizzes/student/${encodeURIComponent(
      testId,
    )}/start`,
    accessToken,
    {
      method: 'POST',
    },
  );
}

/*
 * =====================================================
 * ATTEMPT ID HELPER
 * =====================================================
 */

export function getAttemptId(
  response: StartTestResponse,
): string | null {
  return (
    response.data
      ?.attempt_id ||
    response.data
      ?.attempt?.id ||
    response.data
      ?.attempt?.attempt_id ||
    response.attempt_id ||
    response.attempt?.id ||
    response.attempt
      ?.attempt_id ||
    null
  );
}

/*
 * =====================================================
 * QUESTIONS HELPER
 * =====================================================
 */

export function getAttemptQuestions(
  response: StartTestResponse,
): TestQuestion[] {
  if (
    Array.isArray(
      response.data
        ?.questions,
    )
  ) {
    return response.data
      ?.questions || [];
  }

  if (
    Array.isArray(
      response.questions,
    )
  ) {
    return (
      response.questions || []
    );
  }

  return [];
}

/*
 * =====================================================
 * SAVE TEST ANSWER
 *
 * POST
 * /api/v1/tests-quizzes/student/attempts/{attemptId}/answer
 *
 * BODY:
 * {
 *   test_question_id,
 *   selected_option,
 *   answer_text
 * }
 * =====================================================
 */

export type SaveTestAnswerPayload = {
  test_question_id: string;

  selected_option?: string;

  answer_text?: string;
};

export async function saveStudentTestAnswer(
  accessToken: string,
  attemptId: string,
  payload: SaveTestAnswerPayload,
) {
  return studentRequest<any>(
    `/api/v1/tests-quizzes/student/attempts/${encodeURIComponent(
      attemptId,
    )}/answer`,
    accessToken,
    {
      method: 'POST',

      body: {
        test_question_id:
          payload.test_question_id,

        selected_option:
          payload.selected_option ||
          '',

        answer_text:
          payload.answer_text ||
          '',
      },
    },
  );
}

/*
 * =====================================================
 * SUBMIT ATTEMPT
 *
 * POST
 * /api/v1/tests-quizzes/student/attempts/{attemptId}/submit
 *
 * BODY:
 * {
 *   confirm: true
 * }
 * =====================================================
 */

export type SubmitTestResponse = {
  success?: boolean;

  message?: string;

  data?: {
    score?: number;

    total?: number;

    total_marks?: number;

    obtained_marks?: number;

    percentage?: number;

    passed?: boolean;

    [key: string]: unknown;
  };

  score?: number;

  total?: number;

  percentage?: number;

  passed?: boolean;

  [key: string]: unknown;
};

export async function submitStudentTest(
  accessToken: string,
  attemptId: string,
): Promise<SubmitTestResponse> {
  return studentRequest<SubmitTestResponse>(
    `/api/v1/tests-quizzes/student/attempts/${encodeURIComponent(
      attemptId,
    )}/submit`,
    accessToken,
    {
      method: 'POST',

      body: {
        confirm: true,
      },
    },
  );
}

/*
 * =====================================================
 * TEST HISTORY
 *
 * GET
 * /api/v1/tests-quizzes/student/history
 * =====================================================
 */

export async function getStudentTestHistory(
  accessToken: string,
) {
  return studentRequest<any>(
    '/api/v1/tests-quizzes/student/history',
    accessToken,
  );
}