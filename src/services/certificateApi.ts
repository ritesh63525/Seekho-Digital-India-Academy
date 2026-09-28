import {
  Platform,
} from 'react-native';

import ReactNativeBlobUtil from 'react-native-blob-util';

import {
  API_BASE_URL,
} from './authApi';

export type StudentCertificate = {
  id: string;

  title: string;
  courseTitle: string;
  description: string;

  certificateNumber: string;
  issuedAt: string;

  locked: boolean;

  raw: Record<string, any>;
};

type RefreshTokenFn =
  () => Promise<string>;

type MyCertificatesResponse = {
  success?: boolean;
  message?: string;

  data?:
    | any[]
    | {
        items?: any[];
        certificates?: any[];
      };

  items?: any[];
  certificates?: any[];
};

function getErrorMessage(
  result: any,
  fallback: string,
) {
  return (
    result?.error?.message ||
    result?.detail ||
    result?.message ||
    fallback
  );
}

async function readJson(
  response: Response,
) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function normalizeRows(
  payload: MyCertificatesResponse | any,
): any[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (
    Array.isArray(
      payload?.data?.items,
    )
  ) {
    return payload.data.items;
  }

  if (
    Array.isArray(
      payload?.data?.certificates,
    )
  ) {
    return payload.data.certificates;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (
    Array.isArray(
      payload?.certificates,
    )
  ) {
    return payload.certificates;
  }

  return [];
}

function safeText(
  value: unknown,
) {
  if (
    value === null ||
    value === undefined
  ) {
    return '';
  }

  return String(value).trim();
}

function getCertificateId(
  item: any,
  index: number,
) {
  return safeText(
    item?.id ??
      item?.certificate_id ??
      item?.certificateId ??
      `certificate-${index}`,
  );
}

function getLockedState(
  item: any,
) {
  if (
    typeof item?.is_locked ===
    'boolean'
  ) {
    return item.is_locked;
  }

  if (
    typeof item?.locked ===
    'boolean'
  ) {
    return item.locked;
  }

  if (
    typeof item?.is_unlocked ===
    'boolean'
  ) {
    return !item.is_unlocked;
  }

  if (
    typeof item?.can_download ===
    'boolean'
  ) {
    return !item.can_download;
  }

  const status =
    safeText(
      item?.status ??
        item?.certificate_status,
    ).toLowerCase();

  if (
    status === 'locked' ||
    status === 'pending' ||
    status === 'unavailable'
  ) {
    return true;
  }

  return false;
}

function normalizeCertificate(
  item: any,
  index: number,
): StudentCertificate {
  return {
    id:
      getCertificateId(
        item,
        index,
      ),

    title:
      safeText(
        item?.title ??
          item?.certificate_title ??
          item?.name,
      ) || 'Course Certificate',

    courseTitle:
      safeText(
        item?.course_title ??
          item?.course?.title ??
          item?.course_name ??
          item?.program_name,
      ),

    description:
      safeText(
        item?.description ??
          item?.subtitle,
      ),

    certificateNumber:
      safeText(
        item?.certificate_number ??
          item?.serial_number ??
          item?.number,
      ),

    issuedAt:
      safeText(
        item?.issued_at ??
          item?.issue_date ??
          item?.published_at ??
          item?.created_at,
      ),

    locked:
      getLockedState(item),

    raw:
      item ?? {},
  };
}

async function fetchWithRefresh(
  path: string,
  accessToken: string,
  refreshAccessToken: RefreshTokenFn,
) {
  const perform =
    async (
      token: string,
    ) =>
      fetch(
        `${API_BASE_URL}${path}`,
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

  let response =
    await perform(accessToken);

  if (
    response.status === 401 ||
    response.status === 403
  ) {
    const freshToken =
      await refreshAccessToken();

    response =
      await perform(
        freshToken,
      );
  }

  return response;
}

export async function getMyCertificates(
  accessToken: string,
  refreshAccessToken: RefreshTokenFn,
): Promise<StudentCertificate[]> {
  const safeToken =
    safeText(accessToken);

  if (!safeToken) {
    throw new Error(
      'Student session not found. Please sign in again.',
    );
  }

  let response: Response;

  try {
    response =
      await fetchWithRefresh(
        '/api/v1/certificates/me',
        safeToken,
        refreshAccessToken,
      );
  } catch {
    throw new Error(
      'Unable to connect to the certificate service.',
    );
  }

  const result =
    await readJson(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        result,
        'Unable to load certificates.',
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
        'Unable to load certificates.',
      ),
    );
  }

  return normalizeRows(result)
    .map(normalizeCertificate);
}

async function blobFetchWithRefresh(
  path: string,
  accessToken: string,
  refreshAccessToken: RefreshTokenFn,
  download: boolean,
  fileName: string,
) {
  const run =
    async (
      token: string,
    ) => {
      const config =
        download &&
        Platform.OS === 'android'
          ? ReactNativeBlobUtil.config({
              addAndroidDownloads: {
                useDownloadManager:
                  true,

                notification:
                  true,

                title:
                  fileName,

                description:
                  'Certificate download',

                mime:
                  'application/pdf',

                mediaScannable:
                  true,
              },
            })
          : ReactNativeBlobUtil.config({
              fileCache: true,

              appendExt:
                'pdf',
            });

      return config.fetch(
        'GET',
        `${API_BASE_URL}${path}`,
        {
          Authorization:
            `Bearer ${token}`,

          Accept:
            'application/pdf',
        },
      );
    };

  let response =
    await run(
      accessToken,
    );

  const firstStatus =
    response.info().status;

  if (
    firstStatus === 401 ||
    firstStatus === 403
  ) {
    try {
      const firstPath =
        response.path();

      if (
        firstPath &&
        !download
      ) {
        await ReactNativeBlobUtil.fs.unlink(
          firstPath,
        ).catch(() => {});
      }
    } catch {
      // Ignore temporary-file cleanup failure.
    }

    const freshToken =
      await refreshAccessToken();

    response =
      await run(
        freshToken,
      );
  }

  const status =
    response.info().status;

  if (
    status < 200 ||
    status >= 300
  ) {
    let message =
      'Unable to open certificate file.';

    try {
      const body =
        await response.text();

      const parsed =
        JSON.parse(body);

      message =
        getErrorMessage(
          parsed,
          message,
        );
    } catch {
      // File endpoint may not return JSON.
    }

    throw new Error(message);
  }

  return response;
}

function sanitizeFileName(
  value: string,
) {
  const safe =
    safeText(value)
      .replace(
        /[\\/:*?"<>|]+/g,
        '-',
      )
      .replace(
        /\s+/g,
        ' ',
      )
      .trim();

  return safe ||
    'certificate';
}

export async function viewCertificateFile(
  certificate: StudentCertificate,
  accessToken: string,
  refreshAccessToken: RefreshTokenFn,
) {
  if (certificate.locked) {
    throw new Error(
      'This certificate is locked.',
    );
  }

  const response =
    await blobFetchWithRefresh(
      `/api/v1/certificates/${encodeURIComponent(
        certificate.id,
      )}/file?download=false`,
      accessToken,
      refreshAccessToken,
      false,
      `${sanitizeFileName(
        certificate.title,
      )}.pdf`,
    );

  const path =
    response.path();

  if (!path) {
    throw new Error(
      'Certificate file could not be opened.',
    );
  }

  if (
    Platform.OS === 'android'
  ) {
    await ReactNativeBlobUtil.android
      .actionViewIntent(
        path,
        'application/pdf',
      );

    return;
  }

  ReactNativeBlobUtil.ios
    .openDocument(path);
}

export async function downloadCertificateFile(
  certificate: StudentCertificate,
  accessToken: string,
  refreshAccessToken: RefreshTokenFn,
) {
  if (certificate.locked) {
    throw new Error(
      'This certificate is locked.',
    );
  }

  const fileName =
    `${sanitizeFileName(
      certificate.title,
    )}.pdf`;

  const response =
    await blobFetchWithRefresh(
      `/api/v1/certificates/${encodeURIComponent(
        certificate.id,
      )}/file?download=true`,
      accessToken,
      refreshAccessToken,
      true,
      fileName,
    );

  const path =
    response.path();

  if (
    Platform.OS === 'ios' &&
    path
  ) {
    ReactNativeBlobUtil.ios
      .previewDocument(path);
  }

  return path;
}
