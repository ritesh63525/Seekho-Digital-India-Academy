import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  ArrowLeft,
  Building2,
  ChevronRight,
  CircleHelp,
  Inbox,
  MessageCircle,
  MessageSquareText,
  Plus,
  RefreshCw,
  Send,
  TicketCheck,
  X,
} from 'lucide-react-native';

import type {
  RootStackParamList,
} from '../../navigation/navigationTypes';

import {
  addSupportTicketMessage,
  createSupportTicket,
  getSupportTicketDetail,
  getSupportTickets,
  type SupportCategory,
  type SupportMessage,
  type SupportTicket,
  type SupportTicketDetail,
} from '../../services/supportApi';

import {
  useApp,
} from '../../state/AppContext';

import {
  useTheme,
} from '../../theme/ThemeContext';

import type {
  AppTheme,
} from '../../theme/brandThemes';

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    'Support'
  >;

type SupportTab =
  | 'requests'
  | 'contact'
  | 'faq';

const CATEGORIES: Array<{
  value: SupportCategory;
  label: string;
}> = [
  {
    value: 'account_login',
    label: 'Account / Login',
  },
  {
    value: 'course',
    label: 'Course',
  },
  {
    value: 'attendance',
    label: 'Attendance',
  },
  {
    value: 'fees',
    label: 'Fees',
  },
  {
    value: 'certificate',
    label: 'Certificate',
  },
  {
    value: 'technical',
    label: 'Technical',
  },
  {
    value: 'other',
    label: 'Other',
  },
];

function useSupportTheme() {
  const {theme} = useTheme();

  const styles = useMemo(
    () => createStyles(theme),
    [theme],
  );

  return {
    theme,
    styles,
  };
}

function normalizeStatus(
  value: string,
) {
  return String(
    value ?? '',
  )
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

function formatStatus(
  value: string,
) {
  const normalized =
    normalizeStatus(value);

  if (
    normalized ===
    'in_progress'
  ) {
    return 'In Progress';
  }

  if (!normalized) {
    return 'Open';
  }

  return normalized
    .split('_')
    .map(part =>
      part
        ? part[0]
            .toUpperCase() +
          part.slice(1)
        : '',
    )
    .join(' ');
}

function formatCategory(
  value: string,
) {
  return String(
    value ?? '',
  )
    .split('_')
    .filter(Boolean)
    .map(part =>
      part.charAt(0)
        .toUpperCase() +
      part.slice(1),
    )
    .join(' ');
}

function formatDate(
  value: string,
) {
  if (!value) {
    return '';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );
}

export default function SupportScreen({
  navigation,
}: Props) {
  const {
    theme,
    styles,
  } = useSupportTheme();

  const {
    accessToken,
    refreshAccessToken,
  } = useApp();

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<SupportTab>(
      'requests',
    );

  const [
    tickets,
    setTickets,
  ] =
    useState<SupportTicket[]>(
      [],
    );

  const [
    totalRequests,
    setTotalRequests,
  ] =
    useState(0);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState('');

  const [
    selectedTicketId,
    setSelectedTicketId,
  ] =
    useState('');

  const [
    detail,
    setDetail,
  ] =
    useState<SupportTicketDetail | null>(
      null,
    );

  const [
    detailLoading,
    setDetailLoading,
  ] =
    useState(false);

  const [
    detailError,
    setDetailError,
  ] =
    useState('');

  const [
    createOpen,
    setCreateOpen,
  ] =
    useState(false);

  const [
    category,
    setCategory,
  ] =
    useState<SupportCategory>(
      'technical',
    );

  const [
    subject,
    setSubject,
  ] =
    useState('');

  const [
    newMessage,
    setNewMessage,
  ] =
    useState('');

  const [
    createBusy,
    setCreateBusy,
  ] =
    useState(false);

  const [
    reply,
    setReply,
  ] =
    useState('');

  const [
    replyBusy,
    setReplyBusy,
  ] =
    useState(false);

  const loadTickets =
    useCallback(
      async (
        pullToRefresh = false,
      ) => {
        const token =
          String(
            accessToken ?? '',
          ).trim();

        if (!token) {
          setTickets([]);
          setTotalRequests(0);
          setError(
            'Student session not found. Please sign in again.',
          );
          setLoading(false);
          setRefreshing(false);
          return;
        }

        if (pullToRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError('');

        try {
          const result =
            await getSupportTickets(
              token,
              {
                page: 1,
                limit: 20,
              },
              refreshAccessToken,
            );

          setTickets(
            result.items,
          );

          setTotalRequests(
            result.total,
          );
        } catch (err) {
          setTickets([]);
          setTotalRequests(0);

          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load support requests.',
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        accessToken,
        refreshAccessToken,
      ],
    );

  const loadDetail =
    useCallback(
      async (
        ticketId: string,
      ) => {
        const token =
          String(
            accessToken ?? '',
          ).trim();

        if (
          !token ||
          !ticketId
        ) {
          return;
        }

        setDetailLoading(
          true,
        );
        setDetailError('');

        try {
          const result =
            await getSupportTicketDetail(
              token,
              ticketId,
              refreshAccessToken,
            );

          setDetail(
            result,
          );
        } catch (err) {
          setDetail(null);

          setDetailError(
            err instanceof Error
              ? err.message
              : 'Unable to load this support request.',
          );
        } finally {
          setDetailLoading(
            false,
          );
        }
      },
      [
        accessToken,
        refreshAccessToken,
      ],
    );

  React.useEffect(
    () => {
      void loadTickets();
    },
    [loadTickets],
  );

  React.useEffect(
    () => {
      if (
        selectedTicketId
      ) {
        void loadDetail(
          selectedTicketId,
        );
      }
    },
    [
      selectedTicketId,
      loadDetail,
    ],
  );

  const stats =
    useMemo(() => {
      let open = 0;
      let inProgress = 0;
      let resolved = 0;

      tickets.forEach(
        ticket => {
          const status =
            normalizeStatus(
              ticket.status,
            );

          if (
            status ===
            'resolved'
          ) {
            resolved += 1;
          } else if (
            status ===
            'in_progress'
          ) {
            inProgress += 1;
          } else if (
            status === 'open'
          ) {
            open += 1;
          }
        },
      );

      return {
        open,
        inProgress,
        resolved,
        total:
          totalRequests,
      };
    }, [
      tickets,
      totalRequests,
    ]);

  const submitTicket =
    async () => {
      const token =
        String(
          accessToken ?? '',
        ).trim();

      if (!token) {
        Alert.alert(
          'Session unavailable',
          'Please sign in again.',
        );
        return;
      }

      if (!subject.trim()) {
        Alert.alert(
          'Subject required',
          'Please enter a subject.',
        );
        return;
      }

      if (
        !newMessage.trim()
      ) {
        Alert.alert(
          'Message required',
          'Please describe your issue.',
        );
        return;
      }

      setCreateBusy(true);

      try {
        await createSupportTicket(
          token,
          {
            category,
            subject,
            message:
              newMessage,
          },
          refreshAccessToken,
        );

        setCreateOpen(false);
        setCategory(
          'technical',
        );
        setSubject('');
        setNewMessage('');

        await loadTickets();

        Alert.alert(
          'Request created',
          'Your support request has been submitted successfully.',
        );
      } catch (err) {
        Alert.alert(
          'Unable to create request',
          err instanceof Error
            ? err.message
            : 'Please try again.',
        );
      } finally {
        setCreateBusy(false);
      }
    };

  const submitReply =
    async () => {
      const token =
        String(
          accessToken ?? '',
        ).trim();

      const ticketId =
        selectedTicketId;

      if (
        !token ||
        !ticketId
      ) {
        return;
      }

      if (!reply.trim()) {
        return;
      }

      setReplyBusy(true);

      try {
        await addSupportTicketMessage(
          token,
          ticketId,
          reply,
          refreshAccessToken,
        );

        setReply('');

        await loadDetail(
          ticketId,
        );

        await loadTickets();
      } catch (err) {
        Alert.alert(
          'Unable to send message',
          err instanceof Error
            ? err.message
            : 'Please try again.',
        );
      } finally {
        setReplyBusy(false);
      }
    };

  const refreshAll =
    async () => {
      await loadTickets(
        true,
      );

      if (
        selectedTicketId
      ) {
        await loadDetail(
          selectedTicketId,
        );
      }
    };

  return (
    <SafeAreaView
      style={styles.safeArea}>
      <StatusBar
        barStyle={
          theme.dark
            ? 'light-content'
            : 'dark-content'
        }
      />

      <View style={styles.header}>
        <Pressable
          onPress={() =>
            navigation.goBack()
          }
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({pressed}) => [
            styles.headerButton,
            pressed &&
              styles.pressed,
          ]}>
          <ArrowLeft
            size={20}
            color={
              theme.colors.textPrimary
            }
            strokeWidth={2.3}
          />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>
            STUDENT PORTAL
          </Text>

          <Text style={styles.title}>
            Help & Support
          </Text>
        </View>

        <Pressable
          onPress={() =>
            void refreshAll()
          }
          disabled={refreshing}
          accessibilityRole="button"
          accessibilityLabel="Refresh support requests"
          style={({pressed}) => [
            styles.refreshButton,
            pressed &&
              styles.pressed,
          ]}>
          <RefreshCw
            size={17}
            color={
              theme.colors.secondary
            }
            strokeWidth={2.2}
          />

          <Text
            style={
              styles.refreshText
            }>
            Refresh
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={() =>
              void refreshAll()
            }
            tintColor={
              theme.colors.secondary
            }
            colors={[
              theme.colors.secondary,
              theme.colors.primary,
            ]}
          />
        }>

        <View style={styles.statsGrid}>
          <StatCard
            label="OPEN"
            value={stats.open}
            tone="info"
          />

          <StatCard
            label="IN PROGRESS"
            value={
              stats.inProgress
            }
            tone="warning"
          />

          <StatCard
            label="RESOLVED"
            value={
              stats.resolved
            }
            tone="success"
          />

          <StatCard
            label="TOTAL REQUESTS"
            value={stats.total}
            tone="neutral"
          />
        </View>

        <View style={styles.tabs}>
          <TabButton
            active={
              activeTab ===
              'requests'
            }
            icon={
              <TicketCheck
                size={16}
                color={
                  activeTab ===
                  'requests'
                    ? theme.colors.secondary
                    : theme.colors.iconMuted
                }
              />
            }
            title="My Support Requests"
            onPress={() =>
              setActiveTab(
                'requests',
              )
            }
          />

          <TabButton
            active={
              activeTab ===
              'contact'
            }
            icon={
              <Building2
                size={16}
                color={
                  activeTab ===
                  'contact'
                    ? theme.colors.secondary
                    : theme.colors.iconMuted
                }
              />
            }
            title="Contact Institute"
            onPress={() =>
              setActiveTab(
                'contact',
              )
            }
          />

          <TabButton
            active={
              activeTab ===
              'faq'
            }
            icon={
              <CircleHelp
                size={16}
                color={
                  activeTab ===
                  'faq'
                    ? theme.colors.secondary
                    : theme.colors.iconMuted
                }
              />
            }
            title="FAQ"
            onPress={() =>
              setActiveTab(
                'faq',
              )
            }
          />
        </View>

        {activeTab ===
        'requests' ? (
          <View>
            <View
              style={
                styles.sectionHeader
              }>
              <View>
                <Text
                  style={
                    styles.sectionEyebrow
                  }>
                  REQUESTS
                </Text>

                <Text
                  style={
                    styles.sectionTitle
                  }>
                  My Tickets
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  setCreateOpen(
                    true,
                  )
                }
                style={({pressed}) => [
                  styles.newButton,
                  pressed &&
                    styles.pressed,
                ]}>
                <Plus
                  size={17}
                  color={
                    theme.colors.black
                  }
                  strokeWidth={2.5}
                />

                <Text
                  style={
                    styles.newButtonText
                  }>
                  New Request
                </Text>
              </Pressable>
            </View>

            {loading ? (
              <StateCard
                loading
                title="Loading support requests..."
                message="Fetching your latest tickets."
              />
            ) : error ? (
              <StateCard
                title="Could not load support"
                message={error}
                onRetry={() =>
                  void loadTickets()
                }
              />
            ) : tickets.length ===
              0 ? (
              <StateCard
                title="No support requests yet"
                message="Create a request whenever you need institute support."
                ticket
              />
            ) : (
              <View
                style={
                  styles.ticketList
                }>
                {tickets.map(
                  ticket => (
                    <TicketCard
                      key={
                        ticket.id
                      }
                      ticket={
                        ticket
                      }
                      active={
                        ticket.id ===
                        selectedTicketId
                      }
                      onPress={() =>
                        setSelectedTicketId(
                          ticket.id,
                        )
                      }
                    />
                  ),
                )}
              </View>
            )}

            {!!selectedTicketId && (
              <View
                style={
                  styles.detailSection
                }>
                <Text
                  style={
                    styles.sectionEyebrow
                  }>
                  CONVERSATION
                </Text>

                <Text
                  style={
                    styles.sectionTitle
                  }>
                  Support Request
                </Text>

                {detailLoading ? (
                  <StateCard
                    loading
                    title="Loading conversation..."
                    message="Getting messages for this request."
                  />
                ) : detailError ? (
                  <StateCard
                    title="Could not load conversation"
                    message={
                      detailError
                    }
                    onRetry={() =>
                      void loadDetail(
                        selectedTicketId,
                      )
                    }
                  />
                ) : detail ? (
                  <TicketConversation
                    detail={detail}
                    reply={reply}
                    onReplyChange={
                      setReply
                    }
                    onSend={() =>
                      void submitReply()
                    }
                    sending={
                      replyBusy
                    }
                  />
                ) : null}
              </View>
            )}
          </View>
        ) : activeTab ===
          'contact' ? (
          <InfoPanel
            icon={
              <Building2
                size={28}
                color={
                  theme.colors.secondary
                }
              />
            }
            title="Contact Institute"
            message="The provided Help & Support API contract does not include institute phone, email or WhatsApp details. For now, use New Request to contact the institute through the ticket system."
          />
        ) : (
          <View style={styles.faqList}>
            <Text
              style={
                styles.sectionEyebrow
              }>
              HELP CENTER
            </Text>

            <Text
              style={
                styles.sectionTitle
              }>
              Frequently Asked Questions
            </Text>

            <FaqItem
              question="How do I raise a support request?"
              answer="Open My Support Requests, tap New Request, select a category, enter the subject and issue details, then submit."
            />

            <FaqItem
              question="Where can I see institute replies?"
              answer="Select a ticket from My Tickets. Its complete message conversation is loaded from the ticket detail API."
            />

            <FaqItem
              question="Can I reply to an existing ticket?"
              answer="Yes. Open the ticket conversation, write your message and tap Send."
            />

            <FaqItem
              question="Which support categories are available?"
              answer="Account/Login, Course, Attendance, Fees, Certificate, Technical and Other."
            />
          </View>
        )}
      </ScrollView>

      <CreateTicketModal
        visible={createOpen}
        category={category}
        subject={subject}
        message={newMessage}
        busy={createBusy}
        onCategoryChange={
          setCategory
        }
        onSubjectChange={
          setSubject
        }
        onMessageChange={
          setNewMessage
        }
        onClose={() => {
          if (!createBusy) {
            setCreateOpen(
              false,
            );
          }
        }}
        onSubmit={() =>
          void submitTicket()
        }
      />
    </SafeAreaView>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone:
    | 'info'
    | 'warning'
    | 'success'
    | 'neutral';
}) {
  const {
    theme,
    styles,
  } = useSupportTheme();

  const toneColor =
    tone === 'info'
      ? theme.colors.info
      : tone === 'warning'
        ? theme.colors.warning
        : tone === 'success'
          ? theme.colors.success
          : theme.colors.textPrimary;

  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.statValue,
          {
            color:
              toneColor,
          },
        ]}>
        {value}
      </Text>
    </View>
  );
}

function TabButton({
  active,
  icon,
  title,
  onPress,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
}) {
  const {styles} =
    useSupportTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.tabButton,
        active &&
          styles.tabButtonActive,
        pressed &&
          styles.pressed,
      ]}>
      {icon}

      <Text
        style={[
          styles.tabText,
          active &&
            styles.tabTextActive,
        ]}>
        {title}
      </Text>
    </Pressable>
  );
}

function TicketCard({
  ticket,
  active,
  onPress,
}: {
  ticket: SupportTicket;
  active: boolean;
  onPress: () => void;
}) {
  const {
    theme,
    styles,
  } = useSupportTheme();

  const status =
    normalizeStatus(
      ticket.status,
    );

  const statusColor =
    status === 'resolved'
      ? theme.colors.success
      : status ===
          'in_progress'
        ? theme.colors.warning
        : status ===
            'closed'
          ? theme.colors.textLight
          : theme.colors.info;

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.ticketCard,
        active &&
          styles.ticketCardActive,
        pressed &&
          styles.pressed,
      ]}>
      <View style={styles.ticketTop}>
        <View
          style={
            styles.ticketIcon
          }>
          <MessageSquareText
            size={20}
            color={
              theme.colors.secondary
            }
          />
        </View>

        <View
          style={
            styles.ticketContent
          }>
          <Text
            style={
              styles.ticketSubject
            }
            numberOfLines={2}>
            {ticket.subject}
          </Text>

          <Text
            style={
              styles.ticketNumber
            }>
            {ticket.ticketNumber ||
              ticket.id}
          </Text>

          <Text
            style={
              styles.ticketMeta
            }>
            {formatCategory(
              ticket.category,
            )}
            {ticket.createdAt
              ? ` • ${formatDate(
                  ticket.createdAt,
                )}`
              : ''}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                `${statusColor}18`,
            },
          ]}>
          <Text
            style={[
              styles.statusText,
              {
                color:
                  statusColor,
              },
            ]}>
            {formatStatus(
              ticket.status,
            )}
          </Text>
        </View>

        <ChevronRight
          size={17}
          color={
            theme.colors.iconMuted
          }
        />
      </View>
    </Pressable>
  );
}

function TicketConversation({
  detail,
  reply,
  onReplyChange,
  onSend,
  sending,
}: {
  detail: SupportTicketDetail;
  reply: string;
  onReplyChange: (
    value: string,
  ) => void;
  onSend: () => void;
  sending: boolean;
}) {
  const {
    theme,
    styles,
  } = useSupportTheme();

  return (
    <View
      style={
        styles.conversationCard
      }>
      <View
        style={
          styles.conversationHeader
        }>
        <View style={styles.conversationHeaderText}>
          <Text
            style={
              styles.conversationTitle
            }>
            {detail.ticket.subject}
          </Text>

          <Text
            style={
              styles.conversationNumber
            }>
            {detail.ticket.ticketNumber ||
              detail.ticket.id}
          </Text>

          <Text
            style={
              styles.conversationMeta
            }>
            {formatCategory(
              detail.ticket.category,
            )}
            {' • '}
            {formatStatus(
              detail.ticket.status,
            )}
          </Text>
        </View>

        <MessageCircle
          size={22}
          color={
            theme.colors.secondary
          }
        />
      </View>

      {detail.messages.length ===
      0 ? (
        <View
          style={
            styles.noMessages
          }>
          <MessageCircle
            size={28}
            color={
              theme.colors.iconMuted
            }
          />

          <Text
            style={
              styles.noMessagesText
            }>
            No conversation messages yet.
          </Text>
        </View>
      ) : (
        <View
          style={
            styles.messages
          }>
          {detail.messages.map(
            message => (
              <MessageBubble
                key={
                  message.id
                }
                message={
                  message
                }
              />
            ),
          )}
        </View>
      )}

      <View style={styles.replyBox}>
        <TextInput
          value={reply}
          onChangeText={
            onReplyChange
          }
          placeholder="Write a reply..."
          placeholderTextColor={
            theme.colors.textLight
          }
          selectionColor={
            theme.colors.primary
          }
          multiline
          style={
            styles.replyInput
          }
        />

        <Pressable
          onPress={onSend}
          disabled={
            sending ||
            !reply.trim()
          }
          style={({pressed}) => [
            styles.sendButton,
            (
              sending ||
              !reply.trim()
            ) &&
              styles.disabledButton,
            pressed &&
              styles.pressed,
          ]}>
          {sending ? (
            <ActivityIndicator
              size="small"
              color={
                theme.colors.black
              }
            />
          ) : (
            <Send
              size={17}
              color={
                theme.colors.black
              }
              strokeWidth={2.4}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}

function MessageBubble({
  message,
}: {
  message: SupportMessage;
}) {
  const {
    theme,
    styles,
  } = useSupportTheme();

  const sender =
    normalizeStatus(
      message.senderType,
    );

  const student =
    sender === 'student';

  return (
    <View
      style={[
        styles.messageBubble,
        student
          ? styles.studentBubble
          : styles.instituteBubble,
      ]}>
      <View
        style={
          styles.messageHeader
        }>
        <Text
          style={[
            styles.messageSender,
            {
              color:
                student
                  ? theme.colors.primary
                  : theme.colors.secondary,
            },
          ]}>
          {student
            ? 'You'
            : 'Institute'}
        </Text>

        {!!message.createdAt && (
          <Text
            style={
              styles.messageDate
            }>
            {formatDate(
              message.createdAt,
            )}
          </Text>
        )}
      </View>

      <Text
        style={
          styles.messageText
        }>
        {message.message}
      </Text>
    </View>
  );
}

function StateCard({
  loading = false,
  title,
  message,
  onRetry,
  ticket = false,
}: {
  loading?: boolean;
  title: string;
  message: string;
  onRetry?: () => void;
  ticket?: boolean;
}) {
  const {
    theme,
    styles,
  } = useSupportTheme();

  return (
    <View style={styles.stateCard}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color={
            theme.colors.secondary
          }
        />
      ) : (
        <View style={styles.stateIcon}>
          {ticket ? (
            <TicketCheck
              size={28}
              color={
                theme.colors.iconMuted
              }
            />
          ) : (
            <Inbox
              size={28}
              color={
                theme.colors.primary
              }
            />
          )}
        </View>
      )}

      <Text style={styles.stateTitle}>
        {title}
      </Text>

      <Text
        style={
          styles.stateMessage
        }>
        {message}
      </Text>

      {!!onRetry && (
        <Pressable
          onPress={onRetry}
          style={({pressed}) => [
            styles.retryButton,
            pressed &&
              styles.pressed,
          ]}>
          <RefreshCw
            size={16}
            color={
              theme.colors.black
            }
          />

          <Text
            style={
              styles.retryText
            }>
            Try Again
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function InfoPanel({
  icon,
  title,
  message,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
}) {
  const {styles} =
    useSupportTheme();

  return (
    <View style={styles.infoPanel}>
      <View style={styles.infoIcon}>
        {icon}
      </View>

      <Text style={styles.infoTitle}>
        {title}
      </Text>

      <Text
        style={
          styles.infoMessage
        }>
        {message}
      </Text>
    </View>
  );
}

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const {
    theme,
    styles,
  } = useSupportTheme();

  return (
    <View style={styles.faqItem}>
      <View style={styles.faqIcon}>
        <CircleHelp
          size={18}
          color={
            theme.colors.primary
          }
        />
      </View>

      <View style={styles.faqText}>
        <Text
          style={
            styles.faqQuestion
          }>
          {question}
        </Text>

        <Text
          style={
            styles.faqAnswer
          }>
          {answer}
        </Text>
      </View>
    </View>
  );
}

function CreateTicketModal({
  visible,
  category,
  subject,
  message,
  busy,
  onCategoryChange,
  onSubjectChange,
  onMessageChange,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  category: SupportCategory;
  subject: string;
  message: string;
  busy: boolean;
  onCategoryChange: (
    value: SupportCategory,
  ) => void;
  onSubjectChange: (
    value: string,
  ) => void;
  onMessageChange: (
    value: string,
  ) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const {
    theme,
    styles,
  } = useSupportTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={
        onClose
      }>
      <KeyboardAvoidingView
        style={
          styles.modalOverlay
        }
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }>
        <Pressable
          style={
            styles.modalBackdrop
          }
          onPress={
            onClose
          }
        />

        <View
          style={
            styles.modalCard
          }>
          <View
            style={
              styles.modalHandle
            }
          />

          <View
            style={
              styles.modalHeader
            }>
            <View>
              <Text
                style={
                  styles.modalEyebrow
                }>
                SUPPORT
              </Text>

              <Text
                style={
                  styles.modalTitle
                }>
                New Request
              </Text>
            </View>

            <Pressable
              onPress={
                onClose
              }
              disabled={busy}
              style={
                styles.closeButton
              }>
              <X
                size={19}
                color={
                  theme.colors.textPrimary
                }
              />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={
              false
            }>
            <Text
              style={
                styles.inputLabel
              }>
              Category
            </Text>

            <View
              style={
                styles.categoryWrap
              }>
              {CATEGORIES.map(
                item => {
                  const active =
                    item.value ===
                    category;

                  return (
                    <Pressable
                      key={
                        item.value
                      }
                      onPress={() =>
                        onCategoryChange(
                          item.value,
                        )
                      }
                      disabled={
                        busy
                      }
                      style={[
                        styles.categoryChip,
                        active &&
                          styles.categoryChipActive,
                      ]}>
                      <Text
                        style={[
                          styles.categoryChipText,
                          active &&
                            styles.categoryChipTextActive,
                        ]}>
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                },
              )}
            </View>

            <Text
              style={
                styles.inputLabel
              }>
              Subject
            </Text>

            <TextInput
              value={subject}
              onChangeText={
                onSubjectChange
              }
              editable={!busy}
              placeholder="What do you need help with?"
              placeholderTextColor={
                theme.colors.textLight
              }
              selectionColor={
                theme.colors.primary
              }
              style={
                styles.input
              }
            />

            <Text
              style={
                styles.inputLabel
              }>
              Message
            </Text>

            <TextInput
              value={message}
              onChangeText={
                onMessageChange
              }
              editable={!busy}
              multiline
              textAlignVertical="top"
              placeholder="Describe your issue..."
              placeholderTextColor={
                theme.colors.textLight
              }
              selectionColor={
                theme.colors.primary
              }
              style={[
                styles.input,
                styles.messageInput,
              ]}
            />

            <Pressable
              onPress={
                onSubmit
              }
              disabled={
                busy ||
                !subject.trim() ||
                !message.trim()
              }
              style={({pressed}) => [
                styles.submitButton,
                (
                  busy ||
                  !subject.trim() ||
                  !message.trim()
                ) &&
                  styles.disabledButton,
                pressed &&
                  styles.pressed,
              ]}>
              {busy ? (
                <ActivityIndicator
                  size="small"
                  color={
                    theme.colors.black
                  }
                />
              ) : (
                <>
                  <Plus
                    size={17}
                    color={
                      theme.colors.black
                    }
                    strokeWidth={2.5}
                  />

                  <Text
                    style={
                      styles.submitButtonText
                    }>
                    Create Request
                  </Text>
                </>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (
  theme: AppTheme,
) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        theme.colors.background,
    },

    container: {
      flex: 1,
    },

    content: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 40,
    },

    header: {
      minHeight: 76,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
      borderBottomWidth: 1,
      borderBottomColor:
        theme.colors.divider,
      backgroundColor:
        theme.colors.surface,
    },

    headerButton: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      backgroundColor:
        theme.colors.surfaceSoft,
    },

    headerText: {
      flex: 1,
    },

    eyebrow: {
      color:
        theme.colors.secondary,
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1.25,
    },

    title: {
      marginTop: 3,
      color:
        theme.colors.textPrimary,
      fontSize: 20,
      fontWeight: '900',
    },

    refreshButton: {
      minHeight: 40,
      paddingHorizontal: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      backgroundColor:
        theme.colors.surfaceSoft,
    },

    refreshText: {
      color:
        theme.colors.textPrimary,
      fontSize: 9,
      fontWeight: '800',
    },

    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent:
        'space-between',
    },

    statCard: {
      width: '48.5%',
      minHeight: 92,
      marginBottom: 10,
      padding: 14,
      borderRadius: 17,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      backgroundColor:
        theme.colors.surface,
    },

    statLabel: {
      color:
        theme.colors.textLight,
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1,
    },

    statValue: {
      marginTop: 11,
      fontSize: 24,
      fontWeight: '900',
    },

    tabs: {
      marginTop: 8,
      marginBottom: 21,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 7,
    },

    tabButton: {
      minHeight: 41,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      borderRadius: 12,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      backgroundColor:
        theme.colors.surface,
    },

    tabButtonActive: {
      borderColor:
        theme.colors.secondary,
      backgroundColor:
        theme.colors.secondarySoft,
    },

    tabText: {
      color:
        theme.colors.textSecondary,
      fontSize: 9,
      fontWeight: '800',
    },

    tabTextActive: {
      color:
        theme.colors.secondaryStrong,
    },

    sectionHeader: {
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      gap: 12,
    },

    sectionEyebrow: {
      color:
        theme.colors.secondary,
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1.1,
    },

    sectionTitle: {
      marginTop: 3,
      color:
        theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: '900',
    },

    newButton: {
      minHeight: 42,
      paddingHorizontal: 13,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 7,
      borderRadius: 12,
      backgroundColor:
        theme.colors.secondary,
    },

    newButtonText: {
      color:
        theme.colors.black,
      fontSize: 10,
      fontWeight: '900',
    },

    ticketList: {
      gap: 9,
    },

    ticketCard: {
      padding: 13,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      backgroundColor:
        theme.colors.surface,
    },

    ticketCardActive: {
      borderColor:
        theme.colors.secondary,
      backgroundColor:
        theme.colors.secondarySoft,
    },

    ticketTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
    },

    ticketIcon: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 13,
      backgroundColor:
        theme.colors.secondarySoft,
    },

    ticketContent: {
      flex: 1,
      minWidth: 0,
    },

    ticketSubject: {
      color:
        theme.colors.textPrimary,
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '900',
    },

    ticketNumber: {
      marginTop: 3,
      color:
        theme.colors.secondary,
      fontSize: 8,
      fontWeight: '800',
    },

    ticketMeta: {
      marginTop: 3,
      color:
        theme.colors.textSecondary,
      fontSize: 8,
    },

    statusBadge: {
      maxWidth: 86,
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius:
        theme.radius.pill,
    },

    statusText: {
      fontSize: 7,
      fontWeight: '900',
      textAlign: 'center',
    },

    detailSection: {
      marginTop: 24,
    },

    conversationCard: {
      marginTop: 12,
      padding: 15,
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      backgroundColor:
        theme.colors.surface,
    },

    conversationHeader: {
      paddingBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor:
        theme.colors.divider,
    },

    conversationHeaderText: {
      flex: 1,
    },

    conversationTitle: {
      color:
        theme.colors.textPrimary,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '900',
    },

    conversationNumber: {
      marginTop: 4,
      color:
        theme.colors.secondary,
      fontSize: 8,
      fontWeight: '800',
    },

    conversationMeta: {
      marginTop: 4,
      color:
        theme.colors.textSecondary,
      fontSize: 8,
    },

    messages: {
      marginTop: 13,
      gap: 9,
    },

    messageBubble: {
      maxWidth: '90%',
      padding: 11,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
    },

    studentBubble: {
      alignSelf: 'flex-end',
      backgroundColor:
        theme.colors.primarySoft,
    },

    instituteBubble: {
      alignSelf: 'flex-start',
      backgroundColor:
        theme.colors.secondarySoft,
    },

    messageHeader: {
      marginBottom: 5,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      gap: 12,
    },

    messageSender: {
      fontSize: 8,
      fontWeight: '900',
    },

    messageDate: {
      color:
        theme.colors.textLight,
      fontSize: 7,
    },

    messageText: {
      color:
        theme.colors.textPrimary,
      fontSize: 10,
      lineHeight: 16,
    },

    noMessages: {
      minHeight: 130,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    noMessagesText: {
      marginTop: 8,
      color:
        theme.colors.textSecondary,
      fontSize: 9,
    },

    replyBox: {
      minHeight: 54,
      marginTop: 14,
      padding: 6,
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
      borderRadius: 15,
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
      backgroundColor:
        theme.colors.surfaceSoft,
    },

    replyInput: {
      flex: 1,
      minHeight: 42,
      maxHeight: 120,
      paddingHorizontal: 10,
      paddingVertical: 10,
      color:
        theme.colors.textPrimary,
      fontSize: 10,
      textAlignVertical: 'top',
    },

    sendButton: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 12,
      backgroundColor:
        theme.colors.primary,
    },

    disabledButton: {
      opacity: 0.45,
    },

    stateCard: {
      minHeight: 210,
      padding: 24,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      backgroundColor:
        theme.colors.surface,
    },

    stateIcon: {
      width: 58,
      height: 58,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 18,
      backgroundColor:
        theme.colors.surfaceSoft,
    },

    stateTitle: {
      marginTop: 13,
      color:
        theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: '900',
      textAlign: 'center',
    },

    stateMessage: {
      maxWidth: 290,
      marginTop: 6,
      color:
        theme.colors.textSecondary,
      fontSize: 9,
      lineHeight: 15,
      textAlign: 'center',
    },

    retryButton: {
      minHeight: 42,
      marginTop: 15,
      paddingHorizontal: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 7,
      borderRadius: 12,
      backgroundColor:
        theme.colors.primary,
    },

    retryText: {
      color:
        theme.colors.black,
      fontSize: 9,
      fontWeight: '900',
    },

    infoPanel: {
      minHeight: 270,
      padding: 24,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      backgroundColor:
        theme.colors.surface,
    },

    infoIcon: {
      width: 62,
      height: 62,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 20,
      backgroundColor:
        theme.colors.secondarySoft,
    },

    infoTitle: {
      marginTop: 15,
      color:
        theme.colors.textPrimary,
      fontSize: 17,
      fontWeight: '900',
      textAlign: 'center',
    },

    infoMessage: {
      maxWidth: 320,
      marginTop: 7,
      color:
        theme.colors.textSecondary,
      fontSize: 10,
      lineHeight: 17,
      textAlign: 'center',
    },

    faqList: {
      gap: 10,
    },

    faqItem: {
      padding: 14,
      flexDirection: 'row',
      gap: 11,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      backgroundColor:
        theme.colors.surface,
    },

    faqIcon: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 12,
      backgroundColor:
        theme.colors.primarySoft,
    },

    faqText: {
      flex: 1,
    },

    faqQuestion: {
      color:
        theme.colors.textPrimary,
      fontSize: 11,
      fontWeight: '900',
    },

    faqAnswer: {
      marginTop: 5,
      color:
        theme.colors.textSecondary,
      fontSize: 9,
      lineHeight: 15,
    },

    modalOverlay: {
      flex: 1,
      justifyContent:
        'flex-end',
      backgroundColor:
        theme.colors.overlay,
    },

    modalBackdrop: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },

    modalCard: {
      maxHeight: '88%',
      paddingHorizontal: 18,
      paddingTop: 10,
      paddingBottom: 28,
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      backgroundColor:
        theme.colors.surface,
    },

    modalHandle: {
      width: 44,
      height: 4,
      alignSelf: 'center',
      marginBottom: 15,
      borderRadius:
        theme.radius.pill,
      backgroundColor:
        theme.colors.borderStrong,
    },

    modalHeader: {
      marginBottom: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    modalEyebrow: {
      color:
        theme.colors.secondary,
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1.1,
    },

    modalTitle: {
      marginTop: 3,
      color:
        theme.colors.textPrimary,
      fontSize: 20,
      fontWeight: '900',
    },

    closeButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      backgroundColor:
        theme.colors.surfaceSoft,
    },

    inputLabel: {
      marginTop: 12,
      marginBottom: 6,
      color:
        theme.colors.textPrimary,
      fontSize: 9,
      fontWeight: '900',
    },

    categoryWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 7,
      marginBottom: 3,
    },

    categoryChip: {
      minHeight: 37,
      paddingHorizontal: 11,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius:
        theme.radius.pill,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      backgroundColor:
        theme.colors.surfaceSoft,
    },

    categoryChipActive: {
      borderColor:
        theme.colors.secondary,
      backgroundColor:
        theme.colors.secondarySoft,
    },

    categoryChipText: {
      color:
        theme.colors.textSecondary,
      fontSize: 8,
      fontWeight: '800',
    },

    categoryChipTextActive: {
      color:
        theme.colors.secondaryStrong,
    },

    input: {
      minHeight: 50,
      paddingHorizontal: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
      backgroundColor:
        theme.colors.surfaceSoft,
      color:
        theme.colors.textPrimary,
      fontSize: 11,
    },

    messageInput: {
      minHeight: 120,
      paddingTop: 12,
      paddingBottom: 12,
    },

    submitButton: {
      minHeight: 50,
      marginTop: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 8,
      borderRadius: 14,
      backgroundColor:
        theme.colors.secondary,
    },

    submitButtonText: {
      color:
        theme.colors.black,
      fontSize: 11,
      fontWeight: '900',
    },

    pressed: {
      opacity: 0.76,
    },
  });
