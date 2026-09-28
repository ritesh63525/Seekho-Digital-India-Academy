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

export type CreateEnquiryPayload = {
  name: string;
  phone: string;
  email: string;
  course_id: string;
  message: string;
};

export type CreateEnquiryResponse = {
  success?: boolean;
  message?: string;
  data?: unknown;

  [key: string]: unknown;
};

export async function createEnquiry(
  accessToken: string,
  payload: CreateEnquiryPayload,
): Promise<CreateEnquiryResponse> {
  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/api/v1/enquiries`,
      {
        method: 'POST',

        headers: {
          Accept: 'application/json',

          'Content-Type':
            'application/json',

          Authorization:
            `Bearer ${accessToken}`,
        },

        body: JSON.stringify({
          name:
            payload.name.trim(),

          phone:
            payload.phone.trim(),

          email:
            payload.email
              .trim()
              .toLowerCase(),

          course_id:
            payload.course_id,

          message:
            payload.message.trim(),
        }),
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
        'Unable to submit your enquiry.',
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
        'Unable to submit your enquiry.',
      ),
    );
  }

  return (
    result || {
      success: true,
      message:
        'Enquiry submitted successfully.',
    }
  ) as CreateEnquiryResponse;
}