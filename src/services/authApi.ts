import Config from 'react-native-config';

const API_BASE_URL =
  String(
    Config.API_BASE_URL || '',
  ).replace(/\/+$/, '');

export class AuthApiError extends Error {
  status?: number;
  code?: string;

  constructor(
    message: string,
    status?: number,
    code?: string,
  ) {
    super(message);

    this.name = 'AuthApiError';
    this.status = status;
    this.code = code;
  }
}

type BackendErrorResponse = {
  success?: boolean;
  message?: string;

  detail?:
    | string
    | {
        message?: string;
      };

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

function safeText(
  value: unknown,
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return '';
  }

  return String(value).trim();
}

function getErrorMessage(
  result:
    | BackendErrorResponse
    | null,
  fallback: string,
): string {
  if (
    typeof result?.detail ===
      'string' &&
    result.detail.trim()
  ) {
    return result.detail.trim();
  }

  if (
    result?.detail &&
    typeof result.detail ===
      'object' &&
    typeof result.detail.message ===
      'string' &&
    result.detail.message.trim()
  ) {
    return result.detail.message.trim();
  }

  if (
    typeof result?.error?.message ===
      'string' &&
    result.error.message.trim()
  ) {
    return result.error.message.trim();
  }

  if (
    typeof result?.message ===
      'string' &&
    result.message.trim()
  ) {
    return result.message.trim();
  }

  return fallback;
}

async function request<T>(
  path: string,
  options: RequestInit,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}${path}`,
      options,
    );
  } catch {
    throw new AuthApiError(
      'Unable to connect to the server. Please check your internet connection and try again.',
    );
  }

  const result =
    await readJson(response);

  if (!response.ok) {
    throw new AuthApiError(
      getErrorMessage(
        result,
        `Request failed (${response.status}).`,
      ),
      response.status,
      safeText(
        result?.error?.code,
      ),
    );
  }

  if (
    result &&
    result.success === false
  ) {
    throw new AuthApiError(
      getErrorMessage(
        result,
        'Something went wrong. Please try again.',
      ),
      response.status,
      safeText(
        result?.error?.code,
      ),
    );
  }

  return result as T;
}

/*
 * =====================================================
 * LOGIN
 * =====================================================
 */

export type StudentLoginData = {
  role?: string;

  access_token: string;

  refresh_token: string;

  token_type: string;

  user_id?: string;

  account_id?: string;

  cvengine_student_id: string;

  email: string;

  must_change_password: boolean;
};

export type StudentLoginResponse = {
  success?: boolean;

  message?: string;

  data?: StudentLoginData;

  role?: string;

  access_token?: string;

  refresh_token?: string;

  token_type?: string;

  user_id?: string;

  account_id?: string;

  cvengine_student_id?: string;

  email?: string;

  must_change_password?: boolean;
};

export async function loginStudent(
  email: string,
  password: string,
): Promise<StudentLoginResponse> {
  const normalizedEmail =
    safeText(email).toLowerCase();

  const normalizedPassword =
    String(password ?? '');

  if (!normalizedEmail) {
    throw new Error(
      'Please enter your portal email.',
    );
  }

  if (
    !normalizedPassword.trim()
  ) {
    throw new Error(
      'Please enter your password.',
    );
  }

  return request<StudentLoginResponse>(
    '/api/v1/platform-auth/login',
    {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/json',
      },

      body: JSON.stringify({
        email:
          normalizedEmail,

        password:
          normalizedPassword,
      }),
    },
  );
}

/*
 * =====================================================
 * REFRESH TOKEN
 * =====================================================
 */

type RefreshTokenPayload = {
  access_token?: string;

  token_type?: string;

  /*
   * Optional support.
   * Agar backend future/current implementation
   * refresh token rotate karta hai to preserve ho.
   */
  refresh_token?: string;
};

export type RefreshStudentTokenResponse = {
  success?: boolean;

  message?: string;

  data?:
    | RefreshTokenPayload
    | {
        data?:
          RefreshTokenPayload;
      };

  access_token?: string;

  token_type?: string;

  refresh_token?: string;
};

export type RefreshedStudentToken = {
  access_token: string;

  token_type: string;

  refresh_token?: string;
};

function getRefreshPayload(
  result:
    RefreshStudentTokenResponse,
): RefreshTokenPayload {
  /*
   * Supports:
   *
   * 1)
   * {
   *   access_token: "..."
   * }
   *
   * 2)
   * {
   *   data: {
   *     access_token: "..."
   *   }
   * }
   *
   * 3)
   * {
   *   data: {
   *     data: {
   *       access_token: "..."
   *     }
   *   }
   * }
   */

  const first: any =
    result?.data &&
    typeof result.data ===
      'object'
      ? result.data
      : result;

  const second: any =
    first?.data &&
    typeof first.data ===
      'object'
      ? first.data
      : first;

  return second ?? {};
}

export async function refreshStudentToken(
  refreshToken: string,
): Promise<RefreshedStudentToken> {
  const safeRefreshToken =
    safeText(refreshToken);

  if (!safeRefreshToken) {
    throw new Error(
      'Refresh token not found. Please sign in again.',
    );
  }

  const result =
    await request<RefreshStudentTokenResponse>(
      '/api/v1/student-auth/refresh',
      {
        method: 'POST',

        headers: {
          Accept:
            'application/json',

          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({
          refresh_token:
            safeRefreshToken,
        }),
      },
    );

  const payload =
    getRefreshPayload(
      result,
    );

  /*
   * Wrapped + flat response
   * dono support.
   */
  const nextAccessToken =
    safeText(
      payload?.access_token ??
        result?.access_token,
    );

  const nextTokenType =
    safeText(
      payload?.token_type ??
        result?.token_type ??
        'bearer',
    ) || 'bearer';

  const nextRefreshToken =
    safeText(
      payload?.refresh_token ??
        result?.refresh_token,
    );

  if (!nextAccessToken) {
    throw new Error(
      'Token refresh response did not contain a new access token.',
    );
  }

  return {
    access_token:
      nextAccessToken,

    token_type:
      nextTokenType,

    ...(nextRefreshToken
      ? {
          refresh_token:
            nextRefreshToken,
        }
      : {}),
  };
}

/*
 * =====================================================
 * CHANGE PASSWORD
 * =====================================================
 */

export type ChangePasswordResponse = {
  success: true;

  message: string;

  data?: {
    role?: string;
  };
};

export async function changeStudentPassword(
  accessToken: string,
  currentPassword: string,
  newPassword: string,
) {
  const safeToken =
    safeText(accessToken);

  const safeCurrentPassword =
    String(
      currentPassword ?? '',
    );

  const safeNewPassword =
    String(
      newPassword ?? '',
    );

  if (!safeToken) {
    throw new Error(
      'Student session not found. Please sign in again.',
    );
  }

  if (
    !safeCurrentPassword.trim()
  ) {
    throw new Error(
      'Please enter your current password.',
    );
  }

  if (
    !safeNewPassword.trim()
  ) {
    throw new Error(
      'Please enter your new password.',
    );
  }

  return request<ChangePasswordResponse>(
    '/api/v1/student-auth/change-password',
    {
      method: 'POST',

      headers: {
        Accept:
          'application/json',

        'Content-Type':
          'application/json',

        Authorization:
          `Bearer ${safeToken}`,
      },

      body: JSON.stringify({
        current_password:
          safeCurrentPassword,

        new_password:
          safeNewPassword,
      }),
    },
  );
}

/*
 * =====================================================
 * FORGOT PASSWORD
 * =====================================================
 */

export type ForgotPasswordResponse = {
  success: true;

  message: string;
};

export async function forgotStudentPassword(
  email: string,
) {
  const normalizedEmail =
    safeText(
      email,
    ).toLowerCase();

  if (!normalizedEmail) {
    throw new Error(
      'Please enter your portal email.',
    );
  }

  return request<ForgotPasswordResponse>(
    '/api/v1/platform-auth/forgot-password',
    {
      method: 'POST',

      headers: {
        Accept:
          'application/json',

        'Content-Type':
          'application/json',
      },

      body: JSON.stringify({
        email:
          normalizedEmail,
      }),
    },
  );
}

/*
 * =====================================================
 * VERIFY RESET OTP
 * =====================================================
 */

export type VerifyResetOtpResponse = {
  success: true;

  message: string;

  data: {
    reset_token: string;
  };
};

export async function verifyStudentResetOtp(
  email: string,
  otp: string,
) {
  const normalizedEmail =
    safeText(
      email,
    ).toLowerCase();

  const normalizedOtp =
    safeText(otp);

  if (!normalizedEmail) {
    throw new Error(
      'Portal email is missing.',
    );
  }

  if (!normalizedOtp) {
    throw new Error(
      'Please enter the OTP.',
    );
  }

  return request<VerifyResetOtpResponse>(
    '/api/v1/platform-auth/verify-reset-otp',
    {
      method: 'POST',

      headers: {
        Accept:
          'application/json',

        'Content-Type':
          'application/json',
      },

      body: JSON.stringify({
        email:
          normalizedEmail,

        otp:
          normalizedOtp,
      }),
    },
  );
}

/*
 * =====================================================
 * RESET PASSWORD
 * =====================================================
 */

export type ResetPasswordResponse = {
  success: true;

  message: string;

  data?: Record<
    string,
    unknown
  >;
};

export async function resetStudentPassword(
  resetToken: string,
  newPassword: string,
  confirmPassword: string,
) {
  const safeResetToken =
    safeText(
      resetToken,
    );

  const safeNewPassword =
    String(
      newPassword ?? '',
    );

  const safeConfirmPassword =
    String(
      confirmPassword ?? '',
    );

  if (!safeResetToken) {
    throw new Error(
      'Reset session has expired or is missing. Please restart forgot password.',
    );
  }

  if (
    !safeNewPassword.trim()
  ) {
    throw new Error(
      'Please enter your new password.',
    );
  }

  if (
    !safeConfirmPassword.trim()
  ) {
    throw new Error(
      'Please confirm your new password.',
    );
  }

  if (
    safeNewPassword !==
    safeConfirmPassword
  ) {
    throw new Error(
      'Passwords do not match.',
    );
  }

  return request<ResetPasswordResponse>(
    '/api/v1/platform-auth/reset-password',
    {
      method: 'POST',

      headers: {
        Accept:
          'application/json',

        'Content-Type':
          'application/json',
      },

      body: JSON.stringify({
        reset_token:
          safeResetToken,

        new_password:
          safeNewPassword,

        confirm_password:
          safeConfirmPassword,
      }),
    },
  );
}

export {
  API_BASE_URL,
};