import {API_BASE_URL} from './authApi';

export type StudentTest = {
  id: string;
  title: string;
  description: string;
  status: string;
  type: string;
  questionsCount: number | null;
  durationMinutes: number | null;
  startAt: string;
  endAt: string;
  raw: any;
};

export type StudentTestHistory = {
  id: string;
  testId: string;
  title: string;
  score: number | null;
  total: number | null;
  percentage: number | null;
  passed: boolean | null;
  completedAt: string;
  status: string;
  raw: any;
};

export type StudentTestsResponse = {
  items: StudentTest[];
  summary: {
    total: number | null;
    available: number | null;
    upcoming: number | null;
  };
};

export type StudentTestHistoryResponse = {
  items: StudentTestHistory[];
  summary: {
    completed: number | null;
    passed: number | null;
  };
};

function safeText(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function safeNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const next = Number(value);
  return Number.isFinite(next) ? next : null;
}

function safeBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 1 || value === '1') {
    return true;
  }

  if (value === 0 || value === '0') {
    return false;
  }

  const text = safeText(value).toLowerCase();

  if (['true', 'yes', 'passed', 'pass'].includes(text)) {
    return true;
  }

  if (['false', 'no', 'failed', 'fail'].includes(text)) {
    return false;
  }

  return null;
}

function getErrorMessage(result: any, fallback: string): string {
  const detail = result?.detail;

  if (typeof detail === 'string' && detail.trim()) {
    return detail.trim();
  }

  if (
    detail &&
    typeof detail === 'object' &&
    typeof detail.message === 'string'
  ) {
    return detail.message;
  }

  return (
    result?.error?.message ||
    result?.message ||
    fallback
  );
}

async function readJson(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function findArray(payload: any, keys: string[]): any[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) {
      return payload[key];
    }

    if (Array.isArray(payload?.data?.[key])) {
      return payload.data[key];
    }
  }

  return [];
}

function firstNumber(...values: unknown[]): number | null {
  for (const value of values) {
    const next = safeNumber(value);

    if (next !== null) {
      return next;
    }
  }

  return null;
}

function normalizeTest(item: any, index: number): StudentTest {
  return {
    id:
      safeText(
        item?.id ??
          item?.test_id ??
          item?.quiz_id ??
          item?.testId,
      ) || `test-${index}`,

    title:
      safeText(
        item?.title ??
          item?.name ??
          item?.test_title ??
          item?.quiz_title,
      ) || 'Assessment',

    description: safeText(
      item?.description ??
        item?.short_description ??
        item?.instructions,
    ),

    status: safeText(
      item?.status ??
        item?.attempt_status ??
        item?.availability_status,
    ),

    type: safeText(
      item?.type ??
        item?.test_type ??
        item?.assessment_type,
    ),

    questionsCount: firstNumber(
      item?.questions_count,
      item?.question_count,
      item?.total_questions,
      item?.questions?.length,
    ),

    durationMinutes: firstNumber(
      item?.duration_minutes,
      item?.duration,
      item?.time_limit_minutes,
      item?.time_limit,
    ),

    startAt: safeText(
      item?.start_at ??
        item?.starts_at ??
        item?.scheduled_at ??
        item?.available_from,
    ),

    endAt: safeText(
      item?.end_at ??
        item?.ends_at ??
        item?.due_at ??
        item?.available_until,
    ),

    raw: item,
  };
}

function normalizeHistory(
  item: any,
  index: number,
): StudentTestHistory {
  const score = firstNumber(
    item?.score,
    item?.correct_answers,
    item?.correct_count,
  );

  const total = firstNumber(
    item?.total,
    item?.total_questions,
    item?.question_count,
  );

  let percentage = firstNumber(
    item?.percentage,
    item?.score_percentage,
    item?.percent,
  );

  if (
    percentage === null &&
    score !== null &&
    total !== null &&
    total > 0
  ) {
    percentage = Math.round((score / total) * 100);
  }

  return {
    id:
      safeText(
        item?.attempt_id ??
          item?.id ??
          item?.attemptId,
      ) || `attempt-${index}`,

    testId: safeText(
      item?.test_id ??
        item?.quiz_id ??
        item?.test?.id,
    ),

    title:
      safeText(
        item?.title ??
          item?.test_title ??
          item?.quiz_title ??
          item?.test?.title ??
          item?.test?.name,
      ) || 'Assessment',

    score,
    total,
    percentage,

    passed: safeBoolean(
      item?.passed ??
        item?.is_passed ??
        item?.result,
    ),

    completedAt: safeText(
      item?.completed_at ??
        item?.submitted_at ??
        item?.finished_at ??
        item?.created_at,
    ),

    status: safeText(
      item?.status ??
        item?.attempt_status,
    ),

    raw: item,
  };
}

async function studentRequest(
  path: string,
  accessToken: string,
): Promise<any> {
  const token = safeText(accessToken);

  if (!token) {
    throw new Error(
      'Student session not found. Please sign in again.',
    );
  }

  const base = safeText(API_BASE_URL).replace(/\/+$/, '');

  let response: Response;

  try {
    response = await fetch(`${base}${path}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error(
      'Unable to connect to the academy server. Check your network and try again.',
    );
  }

  const result = await readJson(response);

  if (!response.ok || result?.success === false) {
    throw new Error(
      getErrorMessage(
        result,
        `Request failed (${response.status}).`,
      ),
    );
  }

  return result;
}

export async function getStudentTests(
  accessToken: string,
): Promise<StudentTestsResponse> {
  const result = await studentRequest(
    '/api/v1/tests-quizzes/student',
    accessToken,
  );

  const rows = findArray(result, [
    'tests',
    'quizzes',
    'items',
    'results',
  ]);

  const root = result ?? {};
  const data = root?.data ?? {};
  const summary = data?.summary ?? root?.summary ?? {};

  return {
    items: rows.map(normalizeTest),
    summary: {
      total: firstNumber(
        summary?.total,
        data?.total,
        root?.total,
        data?.pagination?.total,
        root?.pagination?.total,
      ),
      available: firstNumber(
        summary?.available,
        summary?.available_count,
        data?.available,
        data?.available_count,
        root?.available,
        root?.available_count,
      ),
      upcoming: firstNumber(
        summary?.upcoming,
        summary?.upcoming_count,
        data?.upcoming,
        data?.upcoming_count,
        root?.upcoming,
        root?.upcoming_count,
      ),
    },
  };
}

export async function getStudentTestHistory(
  accessToken: string,
): Promise<StudentTestHistoryResponse> {
  const result = await studentRequest(
    '/api/v1/tests-quizzes/student/history',
    accessToken,
  );

  const rows = findArray(result, [
    'history',
    'attempts',
    'items',
    'results',
    'tests',
    'quizzes',
  ]);

  const root = result ?? {};
  const data = root?.data ?? {};
  const summary = data?.summary ?? root?.summary ?? {};

  return {
    items: rows.map(normalizeHistory),
    summary: {
      completed: firstNumber(
        summary?.completed,
        summary?.completed_count,
        summary?.total,
        data?.completed,
        data?.completed_count,
        root?.completed,
        root?.completed_count,
        data?.pagination?.total,
        root?.pagination?.total,
      ),
      passed: firstNumber(
        summary?.passed,
        summary?.passed_count,
        data?.passed,
        data?.passed_count,
        root?.passed,
        root?.passed_count,
      ),
    },
  };
}
