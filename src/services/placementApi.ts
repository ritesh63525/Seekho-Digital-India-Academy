import {API_BASE_URL} from './authApi';

/*
 * =========================================
 * PLACEMENT API
 *
 * Available endpoints:
 * GET /api/v1/jobs
 * GET /api/v1/jobs/{id}
 * GET /api/v1/placements
 *
 * Application submission and interview APIs
 * are not included until their backend
 * contracts are confirmed.
 * =========================================
 */

export type PlacementJob = {
  id: string;
  title: string;
  company: string;
  type: string;
  workMode: string;
  location: string;
  salary: string;
  experience: string;
  qualification: string;
  skills: string;
  description: string;
  deadline: string;
  applicationType: string;
  applyUrl: string;
  isActive: boolean | null;
};

export type AcademyPlacement = {
  id: string;
  name: string;
  company: string;
  role: string;
  transformation: string;
  special: string;
  imageUrl: string;
  isActive: boolean | null;
};

type RefreshTokenFn =
  () => Promise<string>;

function asObject(
  value: unknown,
): Record<string, any> {
  if (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    return value as Record<string, any>;
  }

  return {};
}

function firstText(
  ...values: unknown[]
): string {
  for (const value of values) {
    if (
      typeof value === 'string' &&
      value.trim()
    ) {
      return value.trim();
    }

    if (
      typeof value === 'number' &&
      Number.isFinite(value)
    ) {
      return String(value);
    }
  }

  return '';
}

function readBoolean(
  value: unknown,
): boolean | null {
  if (typeof value === 'boolean') {
    return value;
  }

  if (
    value === 1 ||
    value === 'true'
  ) {
    return true;
  }

  if (
    value === 0 ||
    value === 'false'
  ) {
    return false;
  }

  return null;
}

function readError(
  body: any,
  status: number,
): string {
  const detail = body?.detail;

  return (
    firstText(
      typeof detail === 'string'
        ? detail
        : '',
      body?.error?.message,
      body?.message,
    ) ||
    `Server request failed (${status}).`
  );
}

async function readJsonResponse(
  response: Response,
) {
  try {
    return await response.json();
  } catch {
    throw new Error(
      `Invalid server response (${response.status}).`,
    );
  }
}

async function authorizedGet(
  path: string,
  accessToken: string,
  refreshAccessToken?: RefreshTokenFn,
): Promise<unknown> {
  const safeToken =
    String(accessToken ?? '')
      .trim();

  if (!safeToken) {
    throw new Error(
      'Student session not found. Please sign in again.',
    );
  }

  const base =
    API_BASE_URL.replace(/\/+$/, '');

  const perform =
    async (
      token: string,
    ) => {
      try {
        return await fetch(
          `${base}${path}`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              Authorization:
                `Bearer ${token}`,
            },
          },
        );
      } catch {
        throw new Error(
          'Unable to connect to the server. Check your network connection.',
        );
      }
    };

  let response =
    await perform(
      safeToken,
    );

  if (
    (
      response.status === 401 ||
      response.status === 403
    ) &&
    refreshAccessToken
  ) {
    const freshToken =
      String(
        await refreshAccessToken(),
      ).trim();

    if (!freshToken) {
      throw new Error(
        'Student session expired. Please sign in again.',
      );
    }

    response =
      await perform(
        freshToken,
      );
  }

  const body =
    await readJsonResponse(
      response,
    );

  if (
    !response.ok ||
    body?.success === false
  ) {
    throw new Error(
      readError(
        body,
        response.status,
      ),
    );
  }

  return body;
}

async function publicGet(
  path: string,
): Promise<unknown> {
  const base =
    API_BASE_URL.replace(/\/+$/, '');

  let response: Response;

  try {
    response =
      await fetch(
        `${base}${path}`,
        {
          method: 'GET',
          headers: {
            Accept:
              'application/json',
          },
        },
      );
  } catch {
    throw new Error(
      'Unable to connect to the server. Check your network connection.',
    );
  }

  const body =
    await readJsonResponse(
      response,
    );

  if (
    !response.ok ||
    body?.success === false
  ) {
    throw new Error(
      readError(
        body,
        response.status,
      ),
    );
  }

  return body;
}

function extractList(
  response: unknown,
  keys: string[],
): unknown[] {
  if (Array.isArray(response)) {
    return response;
  }

  const root =
    asObject(response);

  const data =
    root.data;

  if (Array.isArray(data)) {
    return data;
  }

  const containers = [
    asObject(data),
    root,
    asObject(
      asObject(data).data,
    ),
  ];

  for (
    const container
    of containers
  ) {
    for (
      const key
      of keys
    ) {
      if (
        Array.isArray(
          container[key],
        )
      ) {
        return container[key];
      }
    }
  }

  throw new Error(
    'Unexpected API list format. Please share the backend response JSON.',
  );
}

function normalizeJob(
  value: unknown,
): PlacementJob | null {
  const item =
    asObject(value);

  const id =
    firstText(
      item.id,
      item.job_id,
    );

  const title =
    firstText(
      item.title,
      item.job_title,
    );

  if (
    !id ||
    !title
  ) {
    return null;
  }

  return {
    id,
    title,

    company:
      firstText(
        item.company_name,
        item.company,
      ),

    type:
      firstText(
        item.opportunity_type,
        item.job_type,
        item.type,
      ),

    workMode:
      firstText(
        item.work_mode,
      ),

    location:
      firstText(
        item.location,
      ),

    salary:
      firstText(
        item.salary,
      ),

    experience:
      firstText(
        item.experience,
      ),

    qualification:
      firstText(
        item.qualification,
      ),

    skills:
      Array.isArray(
        item.skills,
      )
        ? item.skills
            .map(String)
            .join(', ')
        : firstText(
            item.skills,
          ),

    description:
      firstText(
        item.description,
      ),

    deadline:
      firstText(
        item.deadline,
      ),

    applicationType:
      firstText(
        item.application_type,
      ),

    applyUrl:
      firstText(
        item.apply_url,
      ),

    isActive:
      readBoolean(
        item.is_active,
      ),
  };
}

function resolveImageUrl(
  value: unknown,
): string {
  const image =
    firstText(value);

  if (!image) {
    return '';
  }

  if (
    /^https?:\/\//i.test(
      image,
    )
  ) {
    return image;
  }

  const base =
    API_BASE_URL.replace(
      /\/+$/,
      '',
    );

  return `${base}/${
    image.replace(/^\/+/, '')
  }`;
}

export async function getPlacementJobs(
  accessToken: string,
  refreshAccessToken?: RefreshTokenFn,
): Promise<PlacementJob[]> {
  const response =
    await authorizedGet(
      '/api/v1/jobs',
      accessToken,
      refreshAccessToken,
    );

  const list =
    extractList(
      response,
      [
        'jobs',
        'items',
        'results',
        'records',
      ],
    );

  return list
    .map(normalizeJob)
    .filter(
      (
        item,
      ): item is PlacementJob =>
        item !== null &&
        item.isActive !== false,
    );
}

export async function getPlacementJobDetails(
  accessToken: string,
  jobId: string,
  refreshAccessToken?: RefreshTokenFn,
): Promise<PlacementJob> {
  if (!jobId.trim()) {
    throw new Error(
      'Job ID is missing.',
    );
  }

  const response =
    await authorizedGet(
      `/api/v1/jobs/${encodeURIComponent(
        jobId,
      )}`,
      accessToken,
      refreshAccessToken,
    );

  const root =
    asObject(response);

  const data =
    asObject(
      root.data,
    );

  const candidate =
    data.job ??
    data.item ??
    (
      Object.keys(data).length >
      0
        ? data
        : root.job ??
          root.item ??
          root
    );

  const job =
    normalizeJob(
      candidate,
    );

  if (!job) {
    throw new Error(
      'Unable to read job details. Please share the backend response JSON.',
    );
  }

  return job;
}

export async function getAcademyPlacements(
  _accessToken?: string,
): Promise<AcademyPlacement[]> {
  const response =
    await publicGet(
      '/api/v1/placements',
    );

  const list =
    extractList(
      response,
      [
        'placements',
        'items',
        'results',
        'records',
      ],
    );

  return list
    .map(
      (
        value,
      ): AcademyPlacement | null => {
        const item =
          asObject(value);

        const isActive =
          readBoolean(
            item.is_active,
          );

        if (
          isActive === false
        ) {
          return null;
        }

        const name =
          firstText(
            item.name,
            item.company_name,
            item.company,
          );

        const role =
          firstText(
            item.role,
          );

        if (
          !name &&
          !role
        ) {
          return null;
        }

        return {
          id:
            firstText(
              item.id,
              item.placement_id,
            ) ||
            `${name}-${role}`,

          name,

          company:
            name,

          role,

          transformation:
            firstText(
              item.transformation,
            ),

          special:
            firstText(
              item.special,
            ),

          imageUrl:
            resolveImageUrl(
              item.image ??
              item.image_url ??
              item.photo ??
              item.photo_url,
            ),

          isActive,
        };
      },
    )
    .filter(
      (
        item,
      ): item is AcademyPlacement =>
        item !== null,
    );
}
