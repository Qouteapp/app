import { useLayoutEffect, useMemo, useRef } from '../lib/teact/teact';
// import { useRef } from '../lib/teact/teact';
import TeactDOM from '../lib/teact/teact-dom';
import { getActions, getGlobal } from '../global';

import { MAIN_THREAD_ID } from '../api/types/messages';

import {
  getChatLink,
} from '../global/helpers';
import {
  selectChat,
  selectChatFullInfo,
  selectCurrentChat,
  selectCurrentMessageList,
  selectTopicLink,
} from '../global/selectors';
import useLastCallback from './useLastCallback';
import useSchedule from './useSchedule';

export default function useSnooze() {
  const { sendMessage, showNotification } = getActions();

  // Используем useSchedule здесь, а не внутри других функций
  const [requestCalendar, calendar] = useSchedule(true, true);

  // Обработчик, который будет вызван после выбора времени в календаре
  const handleScheduledMessage = useLastCallback((chatId: string, scheduledAt: number, threadId?: number) => {
    // eslint-disable-next-line no-console
    console.log('handleScheduledMessage called', { chatId, scheduledAt });
    const global = getGlobal();
    const chat = selectChat(global, chatId);
    if (!chat) {
      return;
    }

    let reminderTitle = '⏰ Reminder about the chat:';
    let link = getChatLink(chat) || selectChatFullInfo(global, chat.id)?.inviteLink;

    if (chat?.isForum) {
      reminderTitle = '⏰ Reminder about thread in chat:';
      const threadIdSafe = threadId || selectCurrentMessageList(global)?.threadId || MAIN_THREAD_ID;
      link = selectTopicLink(global, chatId, threadIdSafe);
    }
    sendMessage({
      text: [
        reminderTitle,
        chat.title,
        link,
      ].join('\n'),
      scheduledAt,
      messageList: {
        chatId: global.currentUserId || '',
        threadId: MAIN_THREAD_ID,
        type: 'thread',
      },
    });
    showNotification({ message: 'You will be reminded!' });
  });

  const snooze = useLastCallback(({ chatId, threadId }: { chatId?: string; threadId?: number }) => {
    const global = getGlobal();
    const currentChatId = selectCurrentChat(global)?.id;
    const chatIdSafe = chatId || currentChatId;
    if (!chatIdSafe) {
      return;
    }
    const scheduledMessageHandler = (scheduledAt: number) => {
      handleScheduledMessage(chatIdSafe, scheduledAt, threadId);
    };

    requestCalendar(scheduledMessageHandler);
  });

  const root = useMemo(() => document.createElement('div'), []);
  // const root = document.createElement('div');
  const rootRef = useRef<HTMLDivElement>();
  if (!rootRef.current) {
    rootRef.current = document.createElement('div');
  }

  useLayoutEffect(() => {
    // TeactDOM.render(calendar, rootRef.current!);
    TeactDOM.render(calendar, root);
  }, [calendar, root]);

  return { snooze };
}
