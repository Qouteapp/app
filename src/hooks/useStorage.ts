import { useEffect, useState } from '../lib/teact/teact';

import type { Workspace } from '../types';

import { DEFAULT_WORKSPACE } from '../config';

export function useStorage() {
  const [isAutoDoneEnabled, setIsAutoDoneEnabled] = useLocalStorage<boolean>('ulu_is_autodone_enabled', false);
  const [
    isAutoArchiverEnabled,
    setIsAutoArchiverEnabled,
  ] = useLocalStorage<boolean>('ulu_is_autoarchiver_enabled', false);
  const [
    isArchiveWhenDoneEnabled,
    setIsArchiveWhenDoneEnabled,
  ] = useLocalStorage<boolean>('ulu_is_archive_when_done_enabled', false);
  const [isFoldersTreeEnabled, setIsFoldersTreeEnabled] = useLocalStorage<boolean>(
    'ulu_is_folders_tree_enabled',
    false,
  );

  const [doneChatIds, setDoneChatIds] = useLocalStorage<string[]>('ulu_done_chat_ids', []);

  const [savedWorkspaces, setSavedWorkspaces] = useLocalStorage<Workspace[]>('workspaces', []);
  const [
    currentWorkspaceId,
    setCurrentWorkspaceId,
  ] = useLocalStorage<string>('current_workspace_id', DEFAULT_WORKSPACE.id);

  const [
    isInitialMarkAsDone,
    setIsInitialMarkAsDone,
  ] = useLocalStorage<boolean>('ulu_is_initial_mark_as_done', false);

  return {
    isAutoDoneEnabled,
    setIsAutoDoneEnabled,
    isAutoArchiverEnabled,
    setIsAutoArchiverEnabled,
    isArchiveWhenDoneEnabled,
    setIsArchiveWhenDoneEnabled,
    isFoldersTreeEnabled,
    setIsFoldersTreeEnabled,
    doneChatIds,
    setDoneChatIds,
    savedWorkspaces,
    setSavedWorkspaces,
    currentWorkspaceId,
    setCurrentWorkspaceId,
    isInitialMarkAsDone,
    setIsInitialMarkAsDone,
  };
}

function useLocalStorage<T>(key: string, defaultValue: T): [value: T, setValue: (val: T) => void] {
  const eventName = `update_storage_${key}`;

  const getStoredValue: () => (T | undefined) = () => {
    const value = localStorage.getItem(key);
    // eslint-disable-next-line no-null/no-null
    if (value !== null) {
      try {
        const parsedValue = JSON.parse(value);
        if (typeof parsedValue !== typeof defaultValue) {
          throw new Error();
        }
        return parsedValue as T;
      } catch { /* */ }
    }
    return undefined;
  };

  const writeValue: (value: T) => void = (value) => {
    const stringifiedValue = JSON.stringify(value);
    if (localStorage.getItem(key) !== stringifiedValue) {
      localStorage.setItem(key, stringifiedValue);
      window.dispatchEvent(new Event(eventName));
    }
  };

  const reinitValue: () => T = () => {
    const storedValue = getStoredValue();
    if (storedValue !== undefined) {
      return storedValue;
    } else {
      writeValue(defaultValue);
      return defaultValue;
    }
  };

  const [state, setState] = useState<T>(reinitValue());

  useEffect(() => {
    const listenStorageChange = () => {
      setState(reinitValue());
    };
    window.addEventListener(eventName, listenStorageChange);
    return () => window.removeEventListener(eventName, listenStorageChange);
  // eslint-disable-next-line react-hooks-static-deps/exhaustive-deps
  }, []);

  const setStateFiltered = (value: T) => {
    if (value === undefined || typeof value !== typeof defaultValue) {
      throw new Error(`Unexpected setState for ${key}: ${JSON.stringify(value)}`);
    }

    setState(value);
    writeValue(value);
  };

  return [state, setStateFiltered];
}
