import { useMemo } from '../lib/teact/teact';
import TeactDOM from '../lib/teact/teact-dom';
import { getActions, getGlobal } from '../global';

import {
  getChatLink, getMainUsername,
} from '../global/helpers';
import { selectCurrentChat } from '../global/selectors';
import useLastCallback from './useLastCallback';
import useSchedule from './useSchedule';

export default function useSnooze() {
  const { sendMessage, showNotification } = getActions();

  // Используем useSchedule здесь, а не внутри других функций
  const [requestCalendar, calendar] = useSchedule(true, true);

  // Обработчик, который будет вызван после выбора времени в календаре
  const handleScheduledMessage = useLastCallback((chatId: string, scheduledAt: number, threadId: number = 0) => {
    // eslint-disable-next-line no-console
    console.log('handleScheduledMessage called', { chatId, scheduledAt });
    const global = getGlobal();
    const currentUserId = global.currentUserId || ''; // Ensure currentUserId is a string
    const chat = global.chats.byId[chatId];
    const mainUsername = getMainUsername(chat);

    let chatLink = chat ? getChatLink(chat) : `https://t.me/${mainUsername}`;
    let reminderText = `Reminder about the chat: ${chatLink}`;

    if (threadId !== 0) {
      chatLink += '/threadId'; // Создаем ссылку на тред
      reminderText = `Reminder about thread in chat: ${chatLink}`;
    }
    sendMessage({
      text: reminderText,
      scheduledAt,
      messageList: {
        chatId: currentUserId,
        threadId,
        type: 'thread',
      },
    });
    showNotification({ message: 'You will be reminded!' });
  });

  const snooze = useLastCallback(({ chatId, threadId = 0 }: { chatId?: string; threadId?: number }) => {
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
  TeactDOM.render(calendar, root);

  return { snooze };
}
