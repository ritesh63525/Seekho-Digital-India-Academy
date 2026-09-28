
import {API_BASE_URL} from './authApi';

export type OnboardingCourse = {
  id: string;
  title: string;
  description: string;
};

type AnyObject = Record<string, any>;

function asObject(value: unknown): AnyObject {
  return value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
    ? (value as AnyObject)
    : {};
}

function getCourseArray(response: unknown): unknown[] {
  if (Array.isArray(response)) {
    return response;
  }

  const root = asObject(response);
  const data = root.data;

  if (Array.isArray(data)) {
    return data;
  }

  const nested = asObject(data);

  const possibleLists = [
    root.courses,
    root.items,
    root.results,
    nested.courses,
    nested.items,
    nested.results,
    nested.records,
  ];

  for (const list of possibleLists) {
    if (Array.isArray(list)) {
      return list;
    }
  }

  throw new Error(
    'Unexpected courses response. Please check the backend response format.',
  );
}

function normalizeCourse(
  value: unknown,
  index: number,
): OnboardingCourse | null {
  const course = asObject(value);

  // Inactive courses should not appear in onboarding.
  if (course.is_active === false || course.isActive === false) {
    return null;
  }

  const title = String(
    course.title ??
      course.name ??
      course.course_name ??
      '',
  ).trim();

  if (!title) {
    return null;
  }

  const id = String(
    course.id ??
      course._id ??
      course.uuid ??
      course.slug ??
      title,
  ).trim();

  const description = String(
    course.short_description ??
      course.description ??
      '',
  ).trim();

  return {
    id: id || `course-${index}`,
    title,
    description,
  };
}

function getTotalPages(response: unknown): number {
  const root = asObject(response);
  const data = asObject(root.data);

  const pagination = asObject(
    root.pagination ?? data.pagination ?? root.meta ?? data.meta,
  );

  const pages = Number(
    pagination.total_pages ??
      pagination.totalPages ??
      pagination.last_page ??
      root.total_pages ??
      data.total_pages ??
      0,
  );

  if (Number.isFinite(pages) && pages > 0) {
    return Math.ceil(pages);
  }

  const total = Number(
    pagination.total ??
      root.total ??
      data.total ??
      0,
  );

  const pageSize = Number(
    pagination.limit ??
      pagination.per_page ??
      pagination.page_size ??
      root.limit ??
      data.limit ??
      0,
  );

  if (
    Number.isFinite(total) &&
    Number.isFinite(pageSize) &&
    total > 0 &&
    pageSize > 0
  ) {
    return Math.ceil(total / pageSize);
  }

  return 1;
}

async function fetchCoursePage(page: number): Promise<unknown> {
  const baseURL = API_BASE_URL.replace(/\/+$/, '');

  const path =
    page === 1
      ? '/api/v1/courses'
      : `/api/v1/courses?page=${page}`;

  let response: Response;

  try {
    response = await fetch(`${baseURL}${path}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
  } catch {
    throw new Error(
      'Unable to load courses. Please check your internet connection and try again.',
    );
  }

  let result: unknown = null;

  try {
    result = await response.json();
  } catch {
    throw new Error('The courses server returned an invalid response.');
  }

  if (!response.ok) {
    const error = asObject(result);

    throw new Error(
      typeof error.detail === 'string'
        ? error.detail
        : typeof error.message === 'string'
          ? error.message
          : 'Unable to load courses. Please try again.',
    );
  }

  const body = asObject(result);

  if (body.success === false) {
    throw new Error(
      typeof body.message === 'string'
        ? body.message
        : 'Unable to load courses.',
    );
  }

  return result;
}

export async function getOnboardingCourses(): Promise<
  OnboardingCourse[]
> {
  const firstResponse = await fetchCoursePage(1);

  const allCourses: OnboardingCourse[] = [];
  const seen = new Set<string>();

  const addCourses = (response: unknown) => {
    const list = getCourseArray(response);

    let newCount = 0;

    for (const item of list) {
      const course = normalizeCourse(item, allCourses.length);

      if (!course) {
        continue;
      }

      const key = course.id.toLowerCase();

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      allCourses.push(course);
      newCount += 1;
    }

    return newCount;
  };

  addCourses(firstResponse);

  const totalPages = getTotalPages(firstResponse);

  // Pagination is used only when the backend reports page count.
  for (let page = 2; page <= totalPages; page += 1) {
    if (page > 50) {
      throw new Error(
        'The course catalog contains more pages than expected.',
      );
    }

    const response = await fetchCoursePage(page);
    const newCount = addCourses(response);

    if (newCount === 0) {
      throw new Error(
        'The backend did not return additional courses for the next page.',
      );
    }
  }

  return allCourses;
}