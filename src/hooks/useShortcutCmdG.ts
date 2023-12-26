import { useCallback, useEffect } from '../lib/teact/teact';

import useCommands from './useCommands';

function useShortcutCmdG() {
  const { runCommand } = useCommands();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.code === 'KeyG') {
      runCommand('NEW_GROUP');
      e.preventDefault();
      e.stopPropagation();
    }
  }, [runCommand]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export default useShortcutCmdG;
