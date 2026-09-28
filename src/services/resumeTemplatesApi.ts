import {
  API_BASE_URL,
} from './authApi';

export type ResumeTemplate = {
  id: string;
  title: string;
  description: string;
  category: string;

  imageUrl: string;
  fileUrl: string;

  isActive: boolean | null;

  raw: Record<string, any>;
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
  return (
    firstText(
      typeof body?.detail === 'string'
        ? body.detail
        : '',
      body?.error?.message,
      body?.message,
    ) ||
    `Server request failed (${status}).`
  );
}

function resolveUrl(
  value: unknown,
): string {
  const raw =
    firstText(value);

  if (!raw) {
    return '';
  }

  if (
    /^https?:\/\//i.test(raw)
  ) {
    return raw;
  }

  const base =
    API_BASE_URL.replace(
      /\/+$/,
      '',
    );

  return `${base}/${
    raw.replace(/^\/+/, '')
  }`;
}

function extractList(
  response: unknown,
): unknown[] {
  if (Array.isArray(response)) {
    return response;
  }

  const root =
    asObject(response);

  if (
    Array.isArray(
      root.data,
    )
  ) {
    return root.data;
  }

  const containers = [
    root,
    asObject(root.data),
    asObject(
      asObject(root.data).data,
    ),
  ];

  const keys = [
    'resume_templates',
    'templates',
    'items',
    'results',
    'records',
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
    'Unexpected resume template API format. Please share the backend response JSON.',
  );
}

function normalizeTemplate(
  value: unknown,
  index: number,
): ResumeTemplate | null {
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

  const title =
    firstText(
      item.name,
      item.title,
      item.template_name,
      item.template_title,
    );

  if (!title) {
    return null;
  }

  const id =
    firstText(
      item.id,
      item.template_id,
    ) ||
    `resume-template-${index}`;

  return {
    id,

    title,

    description:
      firstText(
        item.description,
        item.summary,
        item.subtitle,
      ),

    category:
      firstText(
        item.category,
        item.type,
        item.template_type,
      ),

    imageUrl:
      resolveUrl(
        item.image ??
        item.image_url ??
        item.thumbnail ??
        item.thumbnail_url ??
        item.preview_image ??
        item.preview_image_url,
      ),

    fileUrl:
      resolveUrl(
        item.file ??
        item.file_url ??
        item.template_url ??
        item.download_url ??
        item.url,
      ),

    isActive,

    raw:
      item,
  };
}

async function performGet(
  token: string,
) {
  const base =
    API_BASE_URL.replace(
      /\/+$/,
      '',
    );

  try {
    return await fetch(
      `${base}/api/v1/resume-templates`,
      {
        method: 'GET',

        headers: {
          Accept:
            'application/json',

          Authorization:
            `Bearer ${token}`,
        },
      },
    );
  } catch {
    throw new Error(
      'Unable to connect to the resume template service.',
    );
  }
}

export async function getResumeTemplates(
  accessToken: string,
  refreshAccessToken?: RefreshTokenFn,
): Promise<ResumeTemplate[]> {
  const safeToken =
    String(
      accessToken ?? '',
    ).trim();

  if (!safeToken) {
    throw new Error(
      'Student session not found. Please sign in again.',
    );
  }

  let response =
    await performGet(
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
      await performGet(
        freshToken,
      );
  }

  let body: any;

  try {
    body =
      await response.json();
  } catch {
    throw new Error(
      `Invalid server response (${response.status}).`,
    );
  }

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

  return extractList(body)
    .map(normalizeTemplate)
    .filter(
      (
        item,
      ): item is ResumeTemplate =>
        item !== null,
    );
}
