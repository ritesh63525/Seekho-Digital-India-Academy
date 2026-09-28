import {
  API_BASE_URL,
} from './authApi';

export type SupportCategory =
  | 'account_login'
  | 'course'
  | 'attendance'
  | 'fees'
  | 'certificate'
  | 'technical'
  | 'other';

export type SupportStatus =
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export type SupportTicket = {
  id: string;
  ticketNumber: string;
  studentAccountId: string;
  cvengineStudentId: string;
  studentEmail: string;
  category: SupportCategory | string;
  subject: string;
  status: SupportStatus | string;
  createdAt: string;
  updatedAt: string;
};

export type SupportMessage = {
  id: string;
  ticketId: string;
  senderType: string;
  senderId: string;
  message: string;
  createdAt: string;
};

export type SupportTicketList = {
  items: SupportTicket[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type SupportTicketDetail = {
  ticket: SupportTicket;
  messages: SupportMessage[];
};

export type CreateSupportTicketInput = {
  category: SupportCategory;
  subject: string;
  message: string;
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

function asText(
  value: unknown,
): string {
  if (
    typeof value === 'string'
  ) {
    return value.trim();
  }

  if (
    typeof value === 'number' &&
    Number.isFinite(value)
  ) {
    return String(value);
  }

  return '';
}

function asNumber(
  value: unknown,
  fallback = 0,
): number {
  if (
    typeof value === 'number' &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === 'string' &&
    value.trim()
  ) {
    const parsed =
      Number(value);

    if (
      Number.isFinite(parsed)
    ) {
      return parsed;
    }
  }

  return fallback;
}

function readError(
  body: any,
  status: number,
): string {
  if (
    typeof body?.detail ===
      'string' &&
    body.detail.trim()
  ) {
    return body.detail.trim();
  }

  if (
    typeof body?.message ===
      'string' &&
    body.message.trim()
  ) {
    return body.message.trim();
  }

  if (
    typeof body?.error?.message ===
      'string' &&
    body.error.message.trim()
  ) {
    return body.error.message.trim();
  }

  return `Support request failed (${status}).`;
}

function normalizeTicket(
  value: unknown,
): SupportTicket {
  const item =
    asObject(value);

  return {
    id:
      asText(item.id),

    ticketNumber:
      asText(
        item.ticket_number,
      ),

    studentAccountId:
      asText(
        item.student_account_id,
      ),

    cvengineStudentId:
      asText(
        item.cvengine_student_id,
      ),

    studentEmail:
      asText(
        item.student_email,
      ),

    category:
      asText(
        item.category,
      ) || 'other',

    subject:
      asText(
        item.subject,
      ) || 'Support request',

    status:
      asText(
        item.status,
      ) || 'open',

    createdAt:
      asText(
        item.created_at,
      ),

    updatedAt:
      asText(
        item.updated_at,
      ),
  };
}

function normalizeMessage(
  value: unknown,
): SupportMessage {
  const item =
    asObject(value);

  return {
    id:
      asText(item.id),

    ticketId:
      asText(
        item.ticket_id,
      ),

    senderType:
      asText(
        item.sender_type,
      ),

    senderId:
      asText(
        item.sender_id,
      ),

    message:
      asText(
        item.message,
      ),

    createdAt:
      asText(
        item.created_at,
      ),
  };
}

async function performRequest(
  path: string,
  token: string,
  options: RequestInit,
): Promise<Response> {
  const base =
    API_BASE_URL.replace(
      /\/+$/,
      '',
    );

  const headers = {
    Accept:
      'application/json',

    Authorization:
      `Bearer ${token}`,

    ...(options.body
      ? {
          'Content-Type':
            'application/json',
        }
      : {}),

    ...(options.headers ||
      {}),
  };

  try {
    return await fetch(
      `${base}${path}`,
      {
        ...options,
        headers,
      },
    );
  } catch {
    throw new Error(
      'Unable to connect to the support service.',
    );
  }
}

async function requestJson(
  path: string,
  accessToken: string,
  options: RequestInit,
  refreshAccessToken?:
    RefreshTokenFn,
): Promise<any> {
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
    await performRequest(
      path,
      safeToken,
      options,
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
      await performRequest(
        path,
        freshToken,
        options,
      );
  }

  let body: any = null;

  try {
    body =
      await response.json();
  } catch {
    body = null;
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

  return body;
}

export async function getSupportTickets(
  accessToken: string,
  options?: {
    page?: number;
    limit?: number;
    status?: SupportStatus;
  },
  refreshAccessToken?:
    RefreshTokenFn,
): Promise<SupportTicketList> {
  const page =
    Math.max(
      1,
      Number(
        options?.page ?? 1,
      ) || 1,
    );

  const limit =
    Math.max(
      1,
      Number(
        options?.limit ?? 20,
      ) || 20,
    );

  const params = [
    `page=${encodeURIComponent(
      String(page),
    )}`,
    `limit=${encodeURIComponent(
      String(limit),
    )}`,
  ];

  if (options?.status) {
    params.push(
      `status=${encodeURIComponent(
        options.status,
      )}`,
    );
  }

  const body =
    await requestJson(
      `/api/v1/support/tickets?${params.join(
        '&',
      )}`,
      accessToken,
      {
        method: 'GET',
      },
      refreshAccessToken,
    );

  const data =
    asObject(body?.data);

  const rawItems =
    Array.isArray(
      data.items,
    )
      ? data.items
      : [];

  return {
    items:
      rawItems
        .map(
          normalizeTicket,
        )
        .filter(
          item =>
            Boolean(item.id),
        ),

    page:
      asNumber(
        data.page,
        page,
      ),

    limit:
      asNumber(
        data.limit,
        limit,
      ),

    total:
      asNumber(
        data.total,
        rawItems.length,
      ),

    totalPages:
      asNumber(
        data.total_pages,
        0,
      ),
  };
}

export async function getSupportTicketDetail(
  accessToken: string,
  ticketId: string,
  refreshAccessToken?:
    RefreshTokenFn,
): Promise<SupportTicketDetail> {
  const safeTicketId =
    String(
      ticketId ?? '',
    ).trim();

  if (!safeTicketId) {
    throw new Error(
      'Support ticket ID is missing.',
    );
  }

  const body =
    await requestJson(
      `/api/v1/support/tickets/${encodeURIComponent(
        safeTicketId,
      )}`,
      accessToken,
      {
        method: 'GET',
      },
      refreshAccessToken,
    );

  const data =
    asObject(body?.data);

  const ticket =
    normalizeTicket(
      data.ticket,
    );

  if (!ticket.id) {
    throw new Error(
      'Support ticket details are missing from the server response.',
    );
  }

  const rawMessages =
    Array.isArray(
      data.messages,
    )
      ? data.messages
      : [];

  return {
    ticket,

    messages:
      rawMessages
        .map(
          normalizeMessage,
        )
        .filter(
          item =>
            Boolean(item.id),
        ),
  };
}

export async function createSupportTicket(
  accessToken: string,
  input:
    CreateSupportTicketInput,
  refreshAccessToken?:
    RefreshTokenFn,
): Promise<void> {
  const category =
    input.category;

  const subject =
    String(
      input.subject ?? '',
    ).trim();

  const message =
    String(
      input.message ?? '',
    ).trim();

  if (!subject) {
    throw new Error(
      'Please enter a subject.',
    );
  }

  if (!message) {
    throw new Error(
      'Please describe your issue.',
    );
  }

  await requestJson(
    '/api/v1/support/tickets',
    accessToken,
    {
      method: 'POST',
      body:
        JSON.stringify({
          category,
          subject,
          message,
        }),
    },
    refreshAccessToken,
  );
}

export async function addSupportTicketMessage(
  accessToken: string,
  ticketId: string,
  message: string,
  refreshAccessToken?:
    RefreshTokenFn,
): Promise<void> {
  const safeTicketId =
    String(
      ticketId ?? '',
    ).trim();

  const safeMessage =
    String(
      message ?? '',
    ).trim();

  if (!safeTicketId) {
    throw new Error(
      'Support ticket ID is missing.',
    );
  }

  if (!safeMessage) {
    throw new Error(
      'Please enter a message.',
    );
  }

  await requestJson(
    `/api/v1/support/tickets/${encodeURIComponent(
      safeTicketId,
    )}/messages`,
    accessToken,
    {
      method: 'POST',
      body:
        JSON.stringify({
          message:
            safeMessage,
        }),
    },
    refreshAccessToken,
  );
}
