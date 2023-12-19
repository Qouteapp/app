import { useEffect, useState } from 'react';

import type { Workspace } from '../types';

import { DEFAULT_WORKSPACE, LOCAL_STORAGE_KEYS } from '../config';

export function useStorage() {
  const [isAutoDoneEnabled, setIsAutoDoneEnabled] = useLocalStorage<boolean>(
    LOCAL_STORAGE_KEYS.IS_AUTO_DONE_ENABLED,
    false,
  );
  const [
    isAutoArchiverEnabled,
    setIsAutoArchiverEnabled,
  ] = useLocalStorage<boolean>(LOCAL_STORAGE_KEYS.IS_AUTO_ARCHIVER_ENABLED, false);
  const [
    isArchiveWhenDoneEnabled,
    setIsArchiveWhenDoneEnabled,
  ] = useLocalStorage<boolean>(LOCAL_STORAGE_KEYS.IS_ARCHIVE_WHEN_DONE_ENABLED, false);
  const [isFoldersTreeEnabled, setIsFoldersTreeEnabled] = useLocalStorage<boolean>(
    LOCAL_STORAGE_KEYS.IS_FOLDERS_TREE_ENABLED,
    false,
  );

  const [doneChatIds, setDoneChatIds] = useLocalStorage<string[]>(LOCAL_STORAGE_KEYS.DONE_CHAT_IDS, []);

  const [savedWorkspaces, setSavedWorkspaces] = useLocalStorage<Workspace[]>(LOCAL_STORAGE_KEYS.WORKSPACES, []);
  const [
    currentWorkspaceId,
    setCurrentWorkspaceId,
  ] = useLocalStorage<string>(LOCAL_STORAGE_KEYS.CURRENT_WORKSPACE_ID, DEFAULT_WORKSPACE.id);

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
