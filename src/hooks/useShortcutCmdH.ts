import { useCallback, useEffect } from '../lib/teact/teact';

import { IS_MAC_OS } from '../util/windowEnvironment';
import useSnooze from './useSnooze';

function useShortcutCmdH(currentChatId: string | undefined) {
  const { snooze } = useSnooze();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (((IS_MAC_OS && e.metaKey) || (!IS_MAC_OS && e.ctrlKey)) && e.shiftKey && e.code === 'KeyH' && currentChatId) {
      e.preventDefault();
      snooze({ chatId: currentChatId }); // Обновленный вызов функции snooze
    }
  }, [snooze, currentChatId]); // Добавляем currentChatId в зависимости

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export default useShortcutCmdH;
