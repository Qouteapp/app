/* eslint-disable no-null/no-null */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-no-bind */
import React from 'react';
import { createRoot } from 'react-dom/client';
// eslint-disable-next-line react/no-deprecated
import { Command } from 'cmdk';
import type { FC } from '../../../../../lib/teact/teact';
import {
  memo, useCallback, useEffect, useRef,
  useState,
} from '../../../../../lib/teact/teact';
import { getGlobal } from '../../../../../lib/teact/teactn';
import { withGlobal } from '../../../../../global';

import type { ApiChat, ApiChatFolder, ApiUser } from '../../../../../api/types';
import type { GlobalState } from '../../../../../global/types';

import { cmdKey } from '../../../../../config';
import {
  getChatTitle, getUserFullName,
} from '../../../../../global/helpers';
import { selectCurrentChat, selectTabState, selectUser } from '../../../../../global/selectors';
import { selectIsWorkspaceSettingsOpen } from '../../../../../global/selectors/ulu/workspaces';
import captureKeyboardListeners from '../../../../../util/captureKeyboardListeners';
import { convertLayout } from '../../../../../util/convertLayout';
import { transliterate } from '../../../../../util/transliterate';

import useLang from '../../../../../hooks/useLang';

import DemoPage from './DemoPage';

import '../../../../common/commandmenu/CommandMenu.scss';

const cmdkElement = document.getElementById('cmdk-demo-root');
const cmdkRoot = createRoot(cmdkElement!);

type OwnProps = {
  onSelect: () => void;
};

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

const CommandMenuDemo: FC<OwnProps & StateProps> = ({
  topUserIds,
  currentChatId,
  usersById,
  chatsById,
  recentlyFoundChatIds,
  onSelect,
}) => {
  const lang = useLang();
  const [isOpen, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [menuItems] = useState<Array<{ label: string; value: string }>>([]);
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

  useEffect(() => {
    // Проверяем, уменьшилась ли длина строки
    if (inputValue.length < prevInputValue.length && commandListRef.current) {
      commandListRef.current.scrollTop = 0; // Прокрутка наверх
    }
  }, [inputValue, prevInputValue]);

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
    isOpen ? captureKeyboardListeners({ onEsc: onSelect }) : undefined
  ), [isOpen, onSelect]);

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

  const handleSelectAndClose = useCallback(() => {
    onSelect();
    close();
  }, [onSelect, close]);

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
          {activePage === 'home' && (
            <DemoPage
              topUserIds={topUserIds}
              usersById={usersById}
              menuItems={menuItems}
              recentlyFoundChatIds={recentlyFoundChatIds}
              inputValue={inputValue}
              onSelect={handleSelectAndClose}
            />
          )}
        </Command.List>
        <Command.Empty />
        <button className="global-search" onClick={onSelect}>
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
)(CommandMenuDemo));
