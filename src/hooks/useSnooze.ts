/* eslint-disable no-console */
import TeactDOM from '../lib/teact/teact-dom';
import { getActions, getGlobal } from '../global';

import {
  getChatLink, getMainUsername,
} from '../global/helpers';
import useLastCallback from './useLastCallback';
import useSchedule from './useSchedule';

export default function useSnooze() {
  const global = getGlobal();
  const { sendMessage } = getActions();
  const currentUserId = global.currentUserId || ''; // Ensure currentUserId is a string

  // Используем useSchedule здесь, а не внутри других функций
  const [requestCalendar, calendar] = useSchedule();

  // Обработчик, который будет вызван после выбора времени в календаре
  const handleScheduledMessage = useLastCallback((chatId: string, scheduledAt: number, threadId: number = 0) => {
    console.log('handleScheduledMessage called', { chatId, scheduledAt });

    const chat = global.chats.byId[chatId];
    const mainUsername = getMainUsername(chat);

    let chatLink = chat ? getChatLink(chat) : `https://t.me/${mainUsername}`;
    let reminderText = `Напоминание про чат: ${chatLink}`;

    if (threadId !== 0) {
      chatLink += '/threadId'; // Создаем ссылку на тред
      reminderText = `Напоминание про тред в чате: ${chatLink}`; // Изменяем текст напоминания
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
  });

  const snooze = useLastCallback(({ chatId, threadId = 0 }: { chatId: string; threadId?: number }) => {
    console.log('snooze called', { chatId });

    const scheduledMessageHandler = (scheduledAt: number) => {
      console.log('scheduledMessageHandler called', { scheduledAt });
      handleScheduledMessage(chatId, scheduledAt, threadId);
    };

    requestCalendar(scheduledMessageHandler);
  });

  TeactDOM.render(calendar, document.createElement('div'));

  return { snooze };
}
