import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  NotificationItem,
  UserProfile,
} from '../types/models';

import {
  refreshStudentToken,
} from '../services/authApi';

type AuthSession = {
  portalEmail: string;

  accessToken: string;

  refreshToken: string;

  tokenType: string;

  accountId: string;

  studentId: string;
};

type StoredAuthSession =
  AuthSession & {
    authenticated: boolean;
  };

const AUTH_SESSION_STORAGE_KEY =
  '@seekho/auth_session_v2';

function normalizeAuthSession(
  session:
    Partial<AuthSession>,
): AuthSession {
  return {
    portalEmail:
      String(
        session.portalEmail ??
          '',
      )
        .trim()
        .toLowerCase(),

    accessToken:
      String(
        session.accessToken ??
          '',
      ).trim(),

    refreshToken:
      String(
        session.refreshToken ??
          '',
      ).trim(),

    tokenType:
      String(
        session.tokenType ??
          'bearer',
      ).trim() ||
      'bearer',

    accountId:
      String(
        session.accountId ??
          '',
      ).trim(),

    studentId:
      String(
        session.studentId ??
          '',
      ).trim(),
  };
}

type AppContextValue = {
  isAuthReady: boolean;

  isAuthenticated: boolean;

  portalEmail:
    | string
    | null;

  accessToken:
    | string
    | null;

  tokenType:
    | string
    | null;

  accountId:
    | string
    | null;

  studentId:
    | string
    | null;

  saveAuthSession: (
    session: AuthSession,
  ) => void;

  updateAccessToken: (
    nextAccessToken: string,
    nextTokenType?: string,
  ) => void;

  refreshAccessToken:
    () => Promise<string>;

  completeLogin:
    () => void;

  logout:
    () => void;

  profile: UserProfile;

  updateProfile: (
    next: UserProfile,
  ) => void;

  completedLessonIds:
    string[];

  markLessonComplete: (
    lessonId: string,
  ) => void;

  appliedJobIds:
    string[];

  applyToJob: (
    jobId: string,
  ) => void;

  submittedAssignmentIds:
    string[];

  submitAssignment: (
    assignmentId: string,
  ) => void;

  notifications:
    NotificationItem[];

  unreadCount: number;

  markNotificationRead: (
    id: string,
  ) => void;

  markAllNotificationsRead:
    () => void;
};

const initialProfile:
  UserProfile = {
  name: 'Student',

  phone: '',

  email: '',

  city: '',

  education: '',

  college: '',

  graduationYear: '',

  skills: [],
};

const AppContext =
  createContext<
    AppContextValue |
      undefined
  >(undefined);

export function AppProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    isAuthReady,
    setIsAuthReady,
  ] = useState(false);

  const [
    isAuthenticated,
    setIsAuthenticated,
  ] = useState(false);

  const [
    portalEmail,
    setPortalEmail,
  ] =
    useState<
      string | null
    >(null);

  const [
    accessToken,
    setAccessToken,
  ] =
    useState<
      string | null
    >(null);

  const [
    tokenType,
    setTokenType,
  ] =
    useState<
      string | null
    >(null);

  const [
    accountId,
    setAccountId,
  ] =
    useState<
      string | null
    >(null);

  const [
    studentId,
    setStudentId,
  ] =
    useState<
      string | null
    >(null);

  const sessionRef =
    useRef<
      AuthSession | null
    >(null);

  const authenticatedRef =
    useRef(false);

  /*
   * One global refresh at a time.
   *
   * Agar Home + Settings + kisi aur API
   * ko ek saath 401 milta hai to multiple
   * refresh requests fire nahi hongi.
   */
  const refreshPromiseRef =
    useRef<
      Promise<string> |
        null
    >(null);

  /*
   * Prevent an old async refresh request
   * from restoring a session after logout
   * or after a new login.
   */
  const sessionGenerationRef =
    useRef(0);

  const storageQueueRef =
    useRef<
      Promise<void>
    >(
      Promise.resolve(),
    );

  const queueStorageWrite =
    useCallback(
      (
        task:
          () => Promise<void>,
      ) => {
        storageQueueRef.current =
          storageQueueRef.current
            .then(task)
            .catch(() => {
              /*
               * Storage problem should
               * not crash live session.
               */
            });
      },
      [],
    );

  const applySessionToState =
    useCallback(
      (
        session:
          AuthSession,
      ) => {
        sessionRef.current =
          session;

        setPortalEmail(
          session.portalEmail,
        );

        setAccessToken(
          session.accessToken,
        );

        setTokenType(
          session.tokenType,
        );

        setAccountId(
          session.accountId,
        );

        setStudentId(
          session.studentId,
        );
      },
      [],
    );

  /*
   * =====================================================
   * RESTORE SESSION
   * =====================================================
   */

  useEffect(() => {
    let active = true;

    const restoreSession =
      async () => {
        try {
          const raw =
            await AsyncStorage.getItem(
              AUTH_SESSION_STORAGE_KEY,
            );

          if (
            !active ||
            !raw
          ) {
            return;
          }

          const parsed =
            JSON.parse(
              raw,
            ) as
              Partial<
                StoredAuthSession
              >;

          const restored =
            normalizeAuthSession(
              parsed,
            );

          if (
            parsed
              ?.authenticated !==
              true ||
            !restored
              .portalEmail ||
            !restored
              .accessToken ||
            !restored
              .refreshToken
          ) {
            await AsyncStorage.removeItem(
              AUTH_SESSION_STORAGE_KEY,
            );

            return;
          }

          sessionGenerationRef.current +=
            1;

          applySessionToState(
            restored,
          );

          authenticatedRef.current =
            true;

          setIsAuthenticated(
            true,
          );
        } catch {
          try {
            await AsyncStorage.removeItem(
              AUTH_SESSION_STORAGE_KEY,
            );
          } catch {
            // Ignore cleanup error.
          }
        } finally {
          if (active) {
            setIsAuthReady(
              true,
            );
          }
        }
      };

    void restoreSession();

    return () => {
      active = false;
    };
  }, [
    applySessionToState,
  ]);

  /*
   * =====================================================
   * OTHER APP STATE
   * =====================================================
   */

  const [
    profile,
    setProfile,
  ] =
    useState<UserProfile>(
      initialProfile,
    );

  const [
    completedLessonIds,
    setCompletedLessonIds,
  ] =
    useState<string[]>(
      [],
    );

  const [
    appliedJobIds,
    setAppliedJobIds,
  ] =
    useState<string[]>(
      [],
    );

  const [
    submittedAssignmentIds,
    setSubmittedAssignmentIds,
  ] =
    useState<string[]>(
      [],
    );

  const [
    notifications,
    setNotifications,
  ] =
    useState<
      NotificationItem[]
    >([]);

  /*
   * =====================================================
   * SAVE LOGIN SESSION
   * =====================================================
   */

  const saveAuthSession =
    useCallback(
      (
        session:
          AuthSession,
      ) => {
        const normalized =
          normalizeAuthSession(
            session,
          );

        if (
          !normalized
            .portalEmail ||
          !normalized
            .accessToken ||
          !normalized
            .refreshToken
        ) {
          return;
        }

        /*
         * New login invalidates any
         * older in-flight refresh.
         */
        sessionGenerationRef.current +=
          1;

        refreshPromiseRef.current =
          null;

        applySessionToState(
          normalized,
        );
      },
      [
        applySessionToState,
      ],
    );

  /*
   * =====================================================
   * UPDATE ACCESS TOKEN
   * =====================================================
   */

  const updateAccessToken =
    useCallback(
      (
        nextAccessToken:
          string,

        nextTokenType =
          'bearer',
      ) => {
        const safeAccessToken =
          String(
            nextAccessToken ??
              '',
          ).trim();

        const safeTokenType =
          String(
            nextTokenType ??
              'bearer',
          ).trim() ||
          'bearer';

        if (
          !safeAccessToken
        ) {
          return;
        }

        const current =
          sessionRef.current;

        if (!current) {
          setAccessToken(
            safeAccessToken,
          );

          setTokenType(
            safeTokenType,
          );

          return;
        }

        const nextSession:
          AuthSession = {
          ...current,

          accessToken:
            safeAccessToken,

          tokenType:
            safeTokenType,
        };

        applySessionToState(
          nextSession,
        );

        if (
          authenticatedRef
            .current
        ) {
          queueStorageWrite(
            () =>
              AsyncStorage.setItem(
                AUTH_SESSION_STORAGE_KEY,

                JSON.stringify(
                  {
                    ...nextSession,

                    authenticated:
                      true,
                  } satisfies StoredAuthSession,
                ),
              ),
          );
        }
      },
      [
        applySessionToState,
        queueStorageWrite,
      ],
    );

  /*
   * =====================================================
   * REFRESH ACCESS TOKEN
   * =====================================================
   */

  const refreshAccessToken =
    useCallback(
      async (): Promise<string> => {
        /*
         * If refresh already running,
         * everybody waits for same one.
         */
        if (
          refreshPromiseRef
            .current
        ) {
          return refreshPromiseRef
            .current;
        }

        const current =
          sessionRef.current;

        const safeRefreshToken =
          String(
            current
              ?.refreshToken ??
              '',
          ).trim();

        if (
          !current ||
          !safeRefreshToken
        ) {
          throw new Error(
            'Student session expired. Please sign in again.',
          );
        }

        const generation =
          sessionGenerationRef
            .current;

        const refreshTask =
          (async () => {
            const refreshed =
              await refreshStudentToken(
                safeRefreshToken,
              );

            /*
             * Logout/new login happened
             * while API request was running.
             */
            if (
              generation !==
                sessionGenerationRef
                  .current ||
              !sessionRef.current
            ) {
              throw new Error(
                'Student session changed. Please try again.',
              );
            }

            const nextAccessToken =
              String(
                refreshed
                  ?.access_token ??
                  '',
              ).trim();

            const nextTokenType =
              String(
                refreshed
                  ?.token_type ??
                  'bearer',
              ).trim() ||
              'bearer';

            if (
              !nextAccessToken
            ) {
              throw new Error(
                'Unable to refresh student session.',
              );
            }

            /*
             * Some backends rotate refresh tokens.
             * If backend doesn't return a new one,
             * preserve current refresh token.
             */
            const nextRefreshToken =
              String(
                refreshed
                  ?.refresh_token ??
                  sessionRef
                    .current
                    ?.refreshToken ??
                  safeRefreshToken,
              ).trim();

            const latestSession =
              sessionRef.current;

            if (
              !latestSession
            ) {
              throw new Error(
                'Student session expired. Please sign in again.',
              );
            }

            const nextSession:
              AuthSession = {
              ...latestSession,

              accessToken:
                nextAccessToken,

              refreshToken:
                nextRefreshToken,

              tokenType:
                nextTokenType,
            };

            applySessionToState(
              nextSession,
            );

            if (
              authenticatedRef
                .current
            ) {
              queueStorageWrite(
                () =>
                  AsyncStorage.setItem(
                    AUTH_SESSION_STORAGE_KEY,

                    JSON.stringify(
                      {
                        ...nextSession,

                        authenticated:
                          true,
                      } satisfies StoredAuthSession,
                    ),
                  ),
              );
            }

            return nextAccessToken;
          })();

        refreshPromiseRef.current =
          refreshTask;

        try {
          return await refreshTask;
        } finally {
          if (
            refreshPromiseRef
              .current ===
            refreshTask
          ) {
            refreshPromiseRef.current =
              null;
          }
        }
      },
      [
        applySessionToState,
        queueStorageWrite,
      ],
    );

  /*
   * =====================================================
   * COMPLETE LOGIN
   * =====================================================
   */

  const completeLogin =
    useCallback(() => {
      const current =
        sessionRef.current;

      if (
        !current
          ?.portalEmail ||
        !current
          ?.accessToken ||
        !current
          ?.refreshToken
      ) {
        return;
      }

      authenticatedRef.current =
        true;

      setIsAuthenticated(
        true,
      );

      queueStorageWrite(
        () =>
          AsyncStorage.setItem(
            AUTH_SESSION_STORAGE_KEY,

            JSON.stringify(
              {
                ...current,

                authenticated:
                  true,
              } satisfies StoredAuthSession,
            ),
          ),
      );
    }, [
      queueStorageWrite,
    ]);

  /*
   * =====================================================
   * LOGOUT
   * =====================================================
   */

  const logout =
    useCallback(() => {
      /*
       * Invalidate any old
       * refresh request.
       */
      sessionGenerationRef.current +=
        1;

      refreshPromiseRef.current =
        null;

      authenticatedRef.current =
        false;

      sessionRef.current =
        null;

      setIsAuthenticated(
        false,
      );

      setPortalEmail(
        null,
      );

      setAccessToken(
        null,
      );

      setTokenType(
        null,
      );

      setAccountId(
        null,
      );

      setStudentId(
        null,
      );

      queueStorageWrite(
        () =>
          AsyncStorage.removeItem(
            AUTH_SESSION_STORAGE_KEY,
          ),
      );

      setProfile({
        ...initialProfile,

        skills: [],
      });

      setCompletedLessonIds(
        [],
      );

      setAppliedJobIds(
        [],
      );

      setSubmittedAssignmentIds(
        [],
      );

      setNotifications(
        [],
      );
    }, [
      queueStorageWrite,
    ]);

  const value =
    useMemo<AppContextValue>(
      () => ({
        isAuthReady,

        isAuthenticated,

        portalEmail,

        accessToken,

        tokenType,

        accountId,

        studentId,

        saveAuthSession,

        updateAccessToken,

        refreshAccessToken,

        completeLogin,

        logout,

        profile,

        updateProfile:
          setProfile,

        completedLessonIds,

        markLessonComplete:
          lessonId =>
            setCompletedLessonIds(
              previous =>
                previous.includes(
                  lessonId,
                )
                  ? previous
                  : [
                      ...previous,
                      lessonId,
                    ],
            ),

        appliedJobIds,

        applyToJob:
          jobId =>
            setAppliedJobIds(
              previous =>
                previous.includes(
                  jobId,
                )
                  ? previous
                  : [
                      ...previous,
                      jobId,
                    ],
            ),

        submittedAssignmentIds,

        submitAssignment:
          assignmentId =>
            setSubmittedAssignmentIds(
              previous =>
                previous.includes(
                  assignmentId,
                )
                  ? previous
                  : [
                      ...previous,
                      assignmentId,
                    ],
            ),

        notifications,

        unreadCount:
          notifications.filter(
            item =>
              !item.read,
          ).length,

        markNotificationRead:
          id =>
            setNotifications(
              previous =>
                previous.map(
                  item =>
                    item.id ===
                    id
                      ? {
                          ...item,
                          read:
                            true,
                        }
                      : item,
                ),
            ),

        markAllNotificationsRead:
          () =>
            setNotifications(
              previous =>
                previous.map(
                  item => ({
                    ...item,
                    read: true,
                  }),
                ),
            ),
      }),

      [
        isAuthReady,
        isAuthenticated,
        portalEmail,
        accessToken,
        tokenType,
        accountId,
        studentId,

        saveAuthSession,
        updateAccessToken,
        refreshAccessToken,
        completeLogin,
        logout,

        profile,
        completedLessonIds,
        appliedJobIds,
        submittedAssignmentIds,
        notifications,
      ],
    );

  return (
    <AppContext.Provider
      value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context =
    useContext(
      AppContext,
    );

  if (!context) {
    throw new Error(
      'useApp must be used inside AppProvider',
    );
  }

  return context;
}