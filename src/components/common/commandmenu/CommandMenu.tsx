/* eslint-disable no-null/no-null */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-no-bind */
import React from 'react';
import { createRoot } from 'react-dom/client';
// eslint-disable-next-line react/no-deprecated
import { Command } from 'cmdk';
import type { FC } from '../../../lib/teact/teact';
import {
  memo, useCallback, useEffect, useRef,
  useState,
} from '../../../lib/teact/teact';
import { getGlobal } from '../../../lib/teact/teactn';
import { getActions, withGlobal } from '../../../global';

import type { ApiChat, ApiChatFolder, ApiUser } from '../../../api/types';
import type { GlobalState } from '../../../global/types';

import { cmdKey, DEFAULT_WORKSPACE, JUNE_TRACK_EVENTS } from '../../../config';
import {
  getChatTitle, getUserFullName,
} from '../../../global/helpers';
import { selectCurrentChat, selectTabState, selectUser } from '../../../global/selectors';
import { selectIsWorkspaceSettingsOpen } from '../../../global/selectors/ulu/workspaces';
import captureKeyboardListeners from '../../../util/captureKeyboardListeners';
import { convertLayout } from '../../../util/convertLayout';
import { transliterate } from '../../../util/transliterate';

import useArchiver from '../../../hooks/useArchiver';
import useCommands from '../../../hooks/useCommands';
import useDone from '../../../hooks/useDone';
import { useFocusMode } from '../../../hooks/useFocusMode';
import { useJune } from '../../../hooks/useJune';
import useLang from '../../../hooks/useLang';
import { useStorage } from '../../../hooks/useStorage';
import { useWorkspaces } from '../../../hooks/useWorkspaces';

import CommanMenuChatSearch from '../../left/search/CommanMenuChatSearch';
import AutomationSettings from '../../main/AutomationSettings';
import FolderPage from '../FolderPage';
import HomePage from './HomePage';
import ChangeThemePage from './HomePage/ChangeThemePage';
import FocusModePage from './HomePage/FocusModePage';

import './CommandMenu.scss';

const cmdkElement = document.getElementById('cmdk-root');
const cmdkRoot = createRoot(cmdkElement!);

type StateProps = {
  topUserIds?: string[];
  currentUser: ApiUser | undefined;
  currentChat?: ApiChat;
  currentChatId?: string;
  localContactIds?: string[];
  localChatIds?: string[];
  localUserIds?: string[];
  globalChatIds?: string[];
  globalUserIds?: string[];
  usersById: Record<string, ApiUser>;
  pinnedIds?: string[];
  activeListIds?: string[];
  archivedListIds?: string[];
  contactIds?: string[];
  folders: ApiChatFolder[];
  chatsById?: Record<string, ApiChat>;
  recentlyFoundChatIds?: string[];
  fetchingStatus?: { chats?: boolean; messages?: boolean };
  isWorkspaceSettingsOpen: boolean;
};

const customFilter = (value: string, search: string) => {
  const convertedSearch = convertLayout(search);
  const transliteratedSearch = transliterate(search).toLowerCase();
  if (value.toLowerCase().includes(search.toLowerCase())
      || value.toLowerCase().includes(convertedSearch.toLowerCase())
      || value.toLowerCase().includes(transliteratedSearch.toLowerCase())) {
    return 1; // полное соответствие
  }
  return 0; // нет соответствия
};

const CommandMenu: FC<StateProps> = ({
  topUserIds,
  currentUser,
  currentChat,
  currentChatId,
  usersById,
  chatsById,
  pinnedIds,
  recentlyFoundChatIds,
  folders,
}) => {
  const { track, analytics } = useJune();
  const {
    showNotification, openChatByUsername, toggleChatUnread, openWorkspaceSettings,
  } = getActions();
  const { useCommand } = useCommands();
  const lang = useLang();
  const [isOpen, setOpen] = useState(false);
  const {
    isAutoDoneEnabled, setIsAutoDoneEnabled,
    isArchiveWhenDoneEnabled, setIsArchiveWhenDoneEnabled,
    isFoldersTreeEnabled, setIsFoldersTreeEnabled,
  } = useStorage();
  const { archiveChats } = useArchiver({ isManual: true });
  const { doneAllReadChats } = useDone();
  const [inputValue, setInputValue] = useState('');
  const [menuItems, setMenuItems] = useState<Array<{ label: string; value: string }>>([]);
  const { runCommand } = useCommands();
  const [pages, setPages] = useState(['home']);
  const activePage = pages[pages.length - 1];
  // eslint-disable-next-line no-null/no-null
  const folderId = activePage.includes('folderPage:') ? activePage.split(':')[1] : null;

  // eslint-disable-next-line no-null/no-null
  const commandListRef = useRef<HTMLDivElement>(null);
  const [prevInputValue, setPrevInputValue] = useState('');

  // Закрытие всего меню
  const close = useCallback(() => {
    setOpen(false);
    setPages(['home']);
    setInputValue('');
  }, []);

  // анимация при выборе страницы

  // eslint-disable-next-line no-null/no-null
  const [isBouncing, setIsBouncing] = useState(false);

  // Настройки автоматизации
  const [isAutomationSettingsOpen, setAutomationSettingsOpen] = useState(false);

  const openAutomationSettings = useCallback(() => {
    setAutomationSettingsOpen(true);
  }, []);
  const closeAutomationSettings = useCallback(() => {
    setAutomationSettingsOpen(false);
  }, []);

  const handleOpenAutomationSettings = () => {
    close();
    openAutomationSettings();
  };

  useCommand('OPEN_AUTOMATION_SETTINGS', handleOpenAutomationSettings);

  // Настройки воркспейсов
  const { savedWorkspaces, currentWorkspace, setCurrentWorkspaceId } = useWorkspaces();
  const allWorkspaces = [
    ...savedWorkspaces,
    ...(currentWorkspace.id !== DEFAULT_WORKSPACE.id ? [DEFAULT_WORKSPACE] : []),
  ];

  const handleSelectWorkspace = (workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId);
    track?.(JUNE_TRACK_EVENTS.SWITCH_WORKSPACE, { source: 'Сommand Menu' });
    close();
  };

  const handleOpenWorkspaceSettings = useCallback((workspaceId?: string) => {
    close();
    openWorkspaceSettings({ workspaceId });
  }, [close, openWorkspaceSettings]);

  useCommand('OPEN_WORKSPACE_SETTINGS', (workspaceId) => {
    openWorkspaceSettings({ workspaceId });
  });

  const [selectedRange, setSelectedRange] = useState<Range | null>(null);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      setSelectedRange(selection.getRangeAt(0));
    }
  };

  const restoreSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selectedRange && selection) {
      selection.removeAllRanges();
      selection.addRange(selectedRange);
    }
  }, [selectedRange]);

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.code === 'KeyK') {
        saveSelection();
        setOpen(!isOpen);
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [isOpen]);

  const handleInputChange = (newValue: string) => {
    setPrevInputValue(inputValue);
    setInputValue(newValue);
  };

  useEffect(() => {
    if (!isOpen) {
      restoreSelection();
    }
  }, [isOpen, restoreSelection]);

  const resetSelectedRange = () => {
    // Установите selectedRange в null или в начальное состояние
    setSelectedRange(null);
  };

  useEffect(() => {
    // Проверяем, уменьшилась ли длина строки
    if (inputValue.length < prevInputValue.length && commandListRef.current) {
      commandListRef.current.scrollTop = 0; // Прокрутка наверх
    }
  }, [inputValue, prevInputValue]);

  // для сохранения OpenAI API key
  useEffect(() => {
    if (inputValue.length === 51) {
      // Создаем пункт меню для сохранения ключа
      const newLabel = `Save/update OpenAI key: ${inputValue}`;
      const newItem = { label: newLabel, value: 'save_api_key' };

      if (!menuItems.some((item) => item.label === newLabel)) {
        setMenuItems((prevItems) => [...prevItems, newItem]);
      }
    } else {
      setMenuItems([]); // Очищаем пункты меню, если ключ невалиден
    }
  }, [inputValue, menuItems]);

  const saveAPIKey = useCallback(() => {
    localStorage.setItem('openai_api_key', inputValue);
    showNotification({ message: 'The OpenAI API key has been saved.' });
    setOpen(false);
    track?.(JUNE_TRACK_EVENTS.ADD_OPENAI_KEY);
  }, [inputValue, track]);

  // Настройки переходов между страницами

  // Возврат на прошлую страницу по Backspace
  const handleBack = useCallback(() => {
    if (pages.length > 1) {
      setIsBouncing(true);
      setPages((prevPages) => prevPages.slice(0, -1));
      setTimeout(() => {
        setIsBouncing(false);
      }, 150);
    }
  }, [pages]);

  useEffect(() => (
    isOpen ? captureKeyboardListeners({ onEsc: close }) : undefined
  ), [isOpen, close]);

  const openFolderPage = useCallback((id) => { // Замена folderId на id
    setIsBouncing(true);
    setPages((prevPages) => [...prevPages, `folderPage:${id}`]);
    setTimeout(() => {
      setIsBouncing(false);
    }, 150);
  }, []);

  const openChangeThemePage = useCallback(() => {
    setIsBouncing(true);
    setPages((prevPages) => [...prevPages, 'Change Theme']);
    setTimeout(() => {
      setIsBouncing(false);
    }, 150);
  }, []);

  const { isFocusModeEnabled, disableFocusMode } = useFocusMode();

  const handleDisableFocusMode = useCallback(() => {
    disableFocusMode();
    showNotification({ message: 'Focus mode is turned off' });
    if (typeof track === 'function') {
      track(JUNE_TRACK_EVENTS.DISABLE_FOCUS_MODE);
    }
    close();
  }, [disableFocusMode, close, track]);

  const openFocusModePage = useCallback(() => {
    // Если фокус-режим не активен, открываем страницу настроек фокус-режима
    setIsBouncing(true);
    setPages((prevPages) => [...prevPages, 'Focus Mode']);
    setTimeout(() => setIsBouncing(false), 150);
    setInputValue('');
    // Не вызываем close(), чтобы страница осталась открытой
  }, [setInputValue]);

  const getFolderName = (id: number | null) => {
    // eslint-disable-next-line no-null/no-null
    if (id === null) return 'Unknown Folder';

    const global = getGlobal() as GlobalState;
    const folder = global.chatFolders.byId[id];
    return folder ? folder.title : `Folder ${id}`;
  };

  // Функция для получения названия чата
  const getCurrentChatName = () => {
    if (!currentChatId) return undefined;

    // Проверка на существование usersById и chatsById перед их использованием
    if (usersById && usersById[currentChatId]) {
      return getUserFullName(usersById[currentChatId]);
    }

    if (chatsById && chatsById[currentChatId]) {
      return getChatTitle(lang, chatsById[currentChatId]);
    }

    return undefined;
  };

  const currentChatName = getCurrentChatName();

  // Settings group

  const commandToggleArchiveWhenDone = useCallback(() => {
    const updIsArchiveWhenDoneEnabled = !isArchiveWhenDoneEnabled;
    showNotification({
      message: updIsArchiveWhenDoneEnabled
        ? 'Enabled "Аrchive chats when mark as done"'
        : 'Disabled "Аrchive chats when mark as done"',
    });
    setIsArchiveWhenDoneEnabled(updIsArchiveWhenDoneEnabled);
    close();
    if (analytics && currentUser) {
      analytics.identify(currentUser.id, {
        autoArchiveWhenDone: updIsArchiveWhenDoneEnabled,
      });
    }
  }, [analytics, close, currentUser, isArchiveWhenDoneEnabled, setIsArchiveWhenDoneEnabled]);

  const commandToggleAutoDone = useCallback(() => {
    const updIsAutoDoneEnabled = !isAutoDoneEnabled;
    showNotification({ message: updIsAutoDoneEnabled ? 'Auto-Done enabled!' : 'Auto-Done disabled!' });
    setIsAutoDoneEnabled(updIsAutoDoneEnabled);

    if (analytics && currentUser) {
      analytics.identify(currentUser.id, {
        autoDoneAfterRead: updIsAutoDoneEnabled,
      });
    }
    close();
  }, [analytics, close, currentUser, isAutoDoneEnabled, setIsAutoDoneEnabled]);

  const commandDoneAll = useCallback(() => {
    showNotification({ message: 'All read chats are marked as done!' });
    doneAllReadChats();
    close();
    track?.(JUNE_TRACK_EVENTS.USE_MARK_ALL_READ_CHATS_DONE_COMMAND);
  }, [close, doneAllReadChats, track]);

  const commandArchiveAll = useCallback(() => {
    showNotification({ message: 'All older than 24 hours will be archived!' });
    archiveChats();
    close();
    track?.(JUNE_TRACK_EVENTS.USE_ARCHIVE_ALL_READ_CHATS_COMMAND);
  }, [close, archiveChats, track]);

  // What's new group
  const commandToggleFoldersTree = useCallback(() => {
    const updIsFoldersTreeEnabled = !isFoldersTreeEnabled;
    showNotification({
      message: updIsFoldersTreeEnabled
        ? 'Folders Tree (Beta) enabled!'
        : 'Telegram Default Folders enabled!',
    });
    setIsFoldersTreeEnabled(updIsFoldersTreeEnabled);
    close();
    window.location.reload();
    track?.(
      updIsFoldersTreeEnabled
        ? JUNE_TRACK_EVENTS.SWITCH_TO_FOLDERS_TREE_UI
        : JUNE_TRACK_EVENTS.SWITCH_TO_TELEGRAM_FOLDERS_UI,
    );
  }, [close, isFoldersTreeEnabled, setIsFoldersTreeEnabled, track]);

  const handleChangelog = useCallback(() => {
    openChatByUsername({ username: 'uludotso' });
    close();
  }, [openChatByUsername, close]);

  // ChatRelatedGroup's functions (local starage and mark as done broks if we move it there)
  const { doneChat, isChatDone } = useDone();
  const isChatUnread = currentChat && ((currentChat.unreadCount ?? 0) > 0 || currentChat.hasUnreadMark);
  const isCurrentChatDone = currentChat && isChatDone(currentChat);

  // Функция для отметки чата как выполненного
  const handleDoneChat = useCallback(() => {
    if (currentChatId) {
      doneChat({ id: currentChatId });
      if (!isCurrentChatDone) {
        close();
        track?.(JUNE_TRACK_EVENTS.MARK_CHAT_DONE, { source: 'Command Menu' });
      }
    }
  }, [currentChatId, doneChat, close, track, isCurrentChatDone]);

  // Функция для отметки чата как непрочитанного/прочитанного
  const handleToggleChatUnread = useCallback(() => {
    if (currentChatId && currentChat) {
      toggleChatUnread({ id: currentChatId });
      const action = isChatUnread ? 'MarkedAsRead' : 'MarkedAsUnread';
      showNotification({ message: lang(action) });
      close();
      track?.(
        isChatUnread
          ? JUNE_TRACK_EVENTS.MARK_CHAT_READ
          : JUNE_TRACK_EVENTS.MARK_CHAT_UNREAD,
        { source: 'Сommand Menu' },
      );
    }
  }, [currentChatId, currentChat, isChatUnread, lang, close, track]);

  // Global search

  const handleSearchFocus = useCallback(() => {
    runCommand('OPEN_SEARCH');
    close();
  }, [runCommand, close]);

  const CommandMenuInner = (
    <div>
      <Command.Dialog
        label="Command Menu"
        open={isOpen}
        onOpenChange={setOpen}
        loop
        shouldFilter
        filter={customFilter}
        className={`command-menu-container ${isBouncing ? 'bounce-animation' : ''}`}
      >
        {pages.map((page) => {
          if (page !== 'home' && page !== 'Change Theme') {
            return (
              <div key={page} cmdk-vercel-badge="">
                {page.startsWith('folderPage') ? `Folder: ${getFolderName(Number(folderId))}` : page}
              </div>
            );
          }
          // Отображение бейджа с названием текущего чата на главной странице
          return currentChatId && (
            <div key="chat-badge" cmdk-vercel-badge="">
              {`Chat: ${currentChatName}`}
            </div>
          );
        })}
        <Command.Input
          placeholder="Type a command or search..."
          autoFocus
          onValueChange={handleInputChange}
          value={inputValue}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && inputValue === '') {
              handleBack();
            }
          }}
        />
        <Command.List ref={commandListRef}>
          <>
            {activePage === 'home' && (
              <>
                <HomePage
                  commandDoneAll={commandDoneAll}
                  commandArchiveAll={commandArchiveAll}
                  commandToggleAutoDone={commandToggleAutoDone}
                  commandToggleArchiveWhenDone={commandToggleArchiveWhenDone}
                  commandToggleFoldersTree={commandToggleFoldersTree}
                  isAutoDoneEnabled={isAutoDoneEnabled}
                  isArchiveWhenDoneEnabled={isArchiveWhenDoneEnabled}
                  isFoldersTreeEnabled={isFoldersTreeEnabled}
                  isFocusModeEnabled={isFocusModeEnabled}
                  topUserIds={topUserIds}
                  usersById={usersById}
                  saveAPIKey={saveAPIKey}
                  menuItems={menuItems}
                  handleChangelog={handleChangelog}
                  close={close}
                  recentlyFoundChatIds={recentlyFoundChatIds}
                  handleOpenAutomationSettings={handleOpenAutomationSettings}
                  handleOpenWorkspaceSettings={handleOpenWorkspaceSettings}
                  handleSelectWorkspace={handleSelectWorkspace}
                  currentWorkspace={currentWorkspace}
                  currentChatId={currentChatId}
                  allWorkspaces={allWorkspaces}
                  openChangeThemePage={openChangeThemePage}
                  openFocusModePage={openFocusModePage}
                  inputValue={inputValue}
                  isCurrentChatDone={isCurrentChatDone}
                  handleDoneChat={handleDoneChat}
                  handleToggleChatUnread={handleToggleChatUnread}
                  isChatUnread={isChatUnread}
                  handleDisableFocusMode={handleDisableFocusMode}
                  selectedRange={selectedRange}
                  resetSelectedRange={resetSelectedRange}
                />
                <CommanMenuChatSearch
                  close={close}
                  searchQuery={inputValue}
                  folders={folders}
                  openFolderPage={openFolderPage}
                  setInputValue={setInputValue}
                  recentlyFoundChatIds={recentlyFoundChatIds}
                  topUserIds={topUserIds}
                  pinnedIds={pinnedIds}
                />
              </>
            )}
            {activePage.includes('folderPage') && folderId && (
              <FolderPage
                folderId={Number(folderId)}
                close={close}
              />
            )}
            {activePage === 'Change Theme' && (
              <ChangeThemePage
                close={close}
                setInputValue={setInputValue}
              />
            )}
            {activePage === 'Focus Mode' && (
              <FocusModePage
                close={close}
                setInputValue={setInputValue}
              />
            )}
          </>
        </Command.List>
        <Command.Empty />
        <button className="global-search" onClick={handleSearchFocus}>
          <i className="icon icon-search" />
          <span>
            <span>No results found</span>
            <span className="user-handle">Go to advanced search</span>
          </span>
          <span className="shortcuts">
            <span className="kbd">{cmdKey}</span>
            <span className="kbd">/</span>
          </span>
        </button>
      </Command.Dialog>
      <AutomationSettings
        isOpen={isAutomationSettingsOpen}
        onClose={closeAutomationSettings}
      />
    </div>

  );

  cmdkRoot.render(CommandMenuInner);
  return <div />;
};

export default memo(withGlobal(
  (global): StateProps => {
    const { userIds: topUserIds } = global.topPeers;
    const currentUser = global.currentUserId ? selectUser(global, global.currentUserId) : undefined;
    const { userIds: localContactIds } = global.contactList || {};
    const currentChat = selectCurrentChat(global);
    const currentChatId = selectCurrentChat(global)?.id;
    const usersById = global.users.byId;
    const chatsById = global.chats.byId;
    const pinnedIds = global.chats.orderedPinnedIds.active;
    const chatFoldersById = global.chatFolders.byId;
    const orderedFolderIds = global.chatFolders.orderedIds;
    const recentlyFoundChatIds = global.recentlyFoundChatIds;
    const folders = orderedFolderIds
      ? orderedFolderIds.map((folderId) => chatFoldersById[folderId]).filter(Boolean)
      : [];
    const {
      fetchingStatus, globalResults, localResults,
    } = selectTabState(global).globalSearch;
    const { chatIds: globalChatIds, userIds: globalUserIds } = globalResults || {};
    const { chatIds: localChatIds, userIds: localUserIds } = localResults || {};

    return {
      topUserIds,
      currentUser,
      currentChat,
      currentChatId,
      localContactIds,
      localChatIds,
      localUserIds,
      globalChatIds,
      globalUserIds,
      chatsById,
      pinnedIds,
      fetchingStatus,
      usersById,
      folders,
      recentlyFoundChatIds,
      isWorkspaceSettingsOpen: selectIsWorkspaceSettingsOpen(global),
    };
  },
)(CommandMenu));
