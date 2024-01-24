import { useCallback, useEffect } from '../lib/teact/teact';
import { getActions, getGlobal } from '../global';

import { JUNE_TRACK_EVENTS } from '../config';
import { selectCurrentChat } from '../global/selectors';
import { IS_MAC_OS } from '../util/windowEnvironment';
import { useJune } from './useJune';
import useLang from './useLang';

function useShortcutCmdU() {
  const { showNotification, toggleChatUnread } = getActions();
  const lang = useLang();
  const { track } = useJune();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const selectedText = window.getSelection()?.toString() || '';
    if (selectedText.length > 0) {
      return;
    }
    if (((IS_MAC_OS && e.metaKey) || (!IS_MAC_OS && e.ctrlKey)) && !e.shiftKey && e.code === 'KeyU') {
      e.preventDefault();
      const global = getGlobal();
      const chat = selectCurrentChat(global);
      if (chat && !chat.isForum) {
        showNotification({
          message: lang((chat.unreadCount || chat.hasUnreadMark) ? 'MarkedAsRead' : 'MarkedAsUnread'),
        });
        toggleChatUnread({ id: chat.id });
        track(
          (chat.unreadCount || chat.hasUnreadMark)
            ? JUNE_TRACK_EVENTS.MARK_CHAT_READ
            : JUNE_TRACK_EVENTS.MARK_CHAT_UNREAD,
          { source: 'Shortcut' },
        );
      }
    }
  }, [lang, track]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export default useShortcutCmdU;
