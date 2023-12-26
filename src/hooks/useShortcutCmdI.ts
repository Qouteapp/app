import { useCallback, useEffect } from '../lib/teact/teact';

import useCommands from './useCommands';

function useShortcutCmdI() {
  const { runCommand } = useCommands();
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const selection = window.getSelection();
    const hasSelection = selection && selection.toString() !== '';

    if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.code === 'KeyI' && !hasSelection) {
      runCommand('OPEN_INBOX');
      e.preventDefault();
      e.stopPropagation();
    }
  }, [runCommand]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export default useShortcutCmdI;
