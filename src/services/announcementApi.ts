import {API_BASE_URL} from './authApi';

export type StudentAnnouncement = {
  id: string;
  title: string;
  message: string;
  summary: string;
  category: string;
  createdAt: string;
  isRead: boolean;
  raw: Record<string, any>;
};

export type StudentAnnouncementPage = {
  items: StudentAnnouncement[];
  page: number;
  limit: number;
  total: number | null;
  hasMore: boolean;
};

type RefreshTokenFn = () => Promise<string>;

function asObject(value: unknown): Record<string, any> {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, any>;
  }
  return {};
}

function firstText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return '';
}

function readBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (value === 1 || value === '1' || value === 'true') return true;
  if (value === 0 || value === '0' || value === 'false') return false;
  return fallback;
}

function readNumber(...values: unknown[]): number | null {
  for (const value of values) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }
  return null;
}

function readError(body: any, status: number): string {
  return (
    firstText(
      typeof body?.detail === 'string' ? body.detail : '',
      body?.error?.message,
      body?.message,
    ) || `Server request failed (${status}).`
  );
}

function extractRows(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;

  const root = asObject(payload);
  if (Array.isArray(root.data)) return root.data;

  const containers = [root, asObject(root.data), asObject(asObject(root.data).data)];
  const keys = ['announcements', 'items', 'results', 'records', 'rows'];

  for (const container of containers) {
    for (const key of keys) {
      if (Array.isArray(container[key])) return container[key];
    }
  }

  return [];
}

function getMeta(payload: unknown) {
  const root = asObject(payload);
  const data = asObject(root.data);
  const nested = asObject(data.data);
  const pagination = asObject(
    root.pagination ?? data.pagination ?? nested.pagination,
  );

  return {
    total: readNumber(
      root.total,
      root.count,
      data.total,
      data.count,
      nested.total,
      nested.count,
      pagination.total,
      pagination.count,
    ),
    page: readNumber(root.page, data.page, nested.page, pagination.page),
    limit: readNumber(
      root.limit,
      data.limit,
      nested.limit,
      pagination.limit,
      pagination.page_size,
    ),
    hasMoreRaw:
      root.has_more ??
      data.has_more ??
      nested.has_more ??
      pagination.has_more,
  };
}

function normalizeAnnouncement(
  value: unknown,
  index: number,
): StudentAnnouncement {
  const item = asObject(value);

  const id =
    firstText(item.id, item.announcement_id, item.uuid) ||
    `announcement-${index}`;

  const title =
    firstText(item.title, item.subject, item.heading, item.name) ||
    'Announcement';

  const message = firstText(
    item.message,
    item.content,
    item.body,
    item.description,
    item.text,
  );

  const summary =
    firstText(item.summary, item.short_description, item.subtitle) || message;

  const category = firstText(
    item.category,
    item.type,
    item.announcement_type,
    item.priority,
  );

  const createdAt = firstText(
    item.created_at,
    item.published_at,
    item.sent_at,
    item.date,
    item.createdAt,
  );

  const hasExplicitRead =
    item.is_read !== undefined ||
    item.read !== undefined ||
    item.read_at !== undefined;

  const isRead = hasExplicitRead
    ? readBoolean(item.is_read ?? item.read, false) ||
      Boolean(firstText(item.read_at))
    : !readBoolean(item.unread, false);

  return {
    id,
    title,
    message,
    summary,
    category,
    createdAt,
    isRead,
    raw: item,
  };
}

async function authorizedRequest(
  path: string,
  accessToken: string,
  refreshAccessToken?: RefreshTokenFn,
  init: RequestInit = {},
): Promise<any> {
  const base = API_BASE_URL.replace(/\/+$/, '');

  const perform = async (token: string) => {
    try {
      return await fetch(`${base}${path}`, {
        ...init,
        headers: {
          Accept: 'application/json',
          ...(init.headers ?? {}),
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      throw new Error('Unable to connect to the announcement service.');
    }
  };

  let response = await perform(accessToken);

  if (
    (response.status === 401 || response.status === 403) &&
    refreshAccessToken
  ) {
    const freshToken = String(await refreshAccessToken()).trim();

    if (!freshToken) {
      throw new Error('Student session expired. Please sign in again.');
    }

    response = await perform(freshToken);
  }

  let body: any = null;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok || body?.success === false) {
    throw new Error(readError(body, response.status));
  }

  return body;
}

export async function getStudentAnnouncements(
  accessToken: string,
  refreshAccessToken?: RefreshTokenFn,
  options?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  },
): Promise<StudentAnnouncementPage> {
  const token = String(accessToken ?? '').trim();

  if (!token) {
    throw new Error('Student session not found. Please sign in again.');
  }

  const page = Math.max(1, Number(options?.page ?? 1) || 1);
  const limit = Math.min(100, Math.max(1, Number(options?.limit ?? 20) || 20));

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (options?.unreadOnly !== undefined) {
    params.set('unread_only', options.unreadOnly ? 'true' : 'false');
  }

  const body = await authorizedRequest(
    `/api/v1/announcements/student?${params.toString()}`,
    token,
    refreshAccessToken,
    {method: 'GET'},
  );

  const rows = extractRows(body);
  const items = rows.map(normalizeAnnouncement);
  const meta = getMeta(body);

  const total = meta.total;
  const resolvedPage = meta.page ?? page;
  const resolvedLimit = meta.limit ?? limit;

  const hasMore =
    meta.hasMoreRaw !== undefined
      ? readBoolean(meta.hasMoreRaw, false)
      : total !== null
        ? resolvedPage * resolvedLimit < total
        : rows.length >= resolvedLimit;

  return {
    items,
    page: resolvedPage,
    limit: resolvedLimit,
    total,
    hasMore,
  };
}

export async function markStudentAnnouncementRead(
  accessToken: string,
  announcementId: string,
  refreshAccessToken?: RefreshTokenFn,
): Promise<void> {
  const token = String(accessToken ?? '').trim();
  const id = String(announcementId ?? '').trim();

  if (!token) {
    throw new Error('Student session not found. Please sign in again.');
  }

  if (!id) {
    throw new Error('Announcement ID is missing.');
  }

  await authorizedRequest(
    `/api/v1/announcements/student/${encodeURIComponent(id)}/read`,
    token,
    refreshAccessToken,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}
