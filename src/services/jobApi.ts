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
 * JOB MODEL
 * =====================================================
 */

export type JobItem = {
  id: string;

  title: string;

  company_name?: string | null;

  opportunity_type?: string | null;

  work_mode?: string | null;

  location?: string | null;

  salary?: string | null;

  experience?: string | null;

  qualification?: string | null;

  skills?: string | null;

  description?: string | null;

  deadline?: string | null;

  application_type?: string | null;

  apply_url?: string | null;

  is_active?: boolean;

  company_logo?: string | null;

  created_at?: string | null;

  updated_at?: string | null;

  [key: string]: unknown;
};

/*
 * =====================================================
 * COMMON AUTH GET
 * =====================================================
 */

async function authorizedGet<T>(
  path: string,
  accessToken: string,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}${path}`,
      {
        method: 'GET',

        headers: {
          Accept: 'application/json',

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
        'Unable to load job information.',
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
        'Unable to load job information.',
      ),
    );
  }

  return result as T;
}

/*
 * =====================================================
 * JOB LIST RESPONSE
 * =====================================================
 */

type RawJobsResponse =
  | JobItem[]
  | {
      success?: boolean;

      message?: string;

      data?:
        | JobItem[]
        | {
            items?: JobItem[];

            jobs?: JobItem[];

            pagination?: {
              page?: number;

              limit?: number;

              total?: number;

              total_pages?: number;
            };
          };

      items?: JobItem[];

      jobs?: JobItem[];

      pagination?: {
        page?: number;

        limit?: number;

        total?: number;

        total_pages?: number;
      };
    };

export type JobsResponse = {
  items: JobItem[];

  message?: string;

  pagination?: {
    page?: number;

    limit?: number;

    total?: number;

    total_pages?: number;
  };
};

function normalizeJobsResponse(
  result: RawJobsResponse,
): JobsResponse {
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
        result.data.jobs,
      )
    ) {
      return {
        items:
          result.data.jobs,

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
    Array.isArray(result.jobs)
  ) {
    return {
      items:
        result.jobs,

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
 * GET JOBS
 *
 * GET /api/v1/jobs
 * =====================================================
 */

export async function getJobs(
  accessToken: string,
): Promise<JobsResponse> {
  const result =
    await authorizedGet<RawJobsResponse>(
      '/api/v1/jobs',
      accessToken,
    );

  return normalizeJobsResponse(
    result,
  );
}

/*
 * =====================================================
 * JOB DETAIL RESPONSE
 * =====================================================
 */

type RawJobDetailResponse =
  | JobItem
  | {
      success?: boolean;

      message?: string;

      data?:
        | JobItem
        | {
            job?: JobItem;
          };

      job?: JobItem;
    };

export type JobDetailResponse = {
  job: JobItem;

  message?: string;
};

function isJobItem(
  value: unknown,
): value is JobItem {
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

function normalizeJobDetail(
  result: RawJobDetailResponse,
): JobDetailResponse {
  if (isJobItem(result)) {
    return {
      job: result,
    };
  }

  const wrapper =
    result as Exclude<
      RawJobDetailResponse,
      JobItem
    >;

  if (
    isJobItem(
      wrapper.data,
    )
  ) {
    return {
      job: wrapper.data,

      message:
        wrapper.message,
    };
  }

  if (
    wrapper.data &&
    typeof wrapper.data ===
      'object' &&
    'job' in wrapper.data &&
    isJobItem(
      wrapper.data.job,
    )
  ) {
    return {
      job:
        wrapper.data.job,

      message:
        wrapper.message,
    };
  }

  if (
    isJobItem(
      wrapper.job,
    )
  ) {
    return {
      job: wrapper.job,

      message:
        wrapper.message,
    };
  }

  throw new Error(
    'Job details were not returned by the server.',
  );
}

/*
 * =====================================================
 * GET JOB BY ID
 *
 * GET /api/v1/jobs/{jobId}
 * =====================================================
 */

export async function getJobById(
  accessToken: string,
  jobId: string,
): Promise<JobDetailResponse> {
  const result =
    await authorizedGet<RawJobDetailResponse>(
      `/api/v1/jobs/${encodeURIComponent(
        jobId,
      )}`,
      accessToken,
    );

  return normalizeJobDetail(
    result,
  );
}