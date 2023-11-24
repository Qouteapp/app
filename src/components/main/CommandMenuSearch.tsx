/* eslint-disable no-console */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-no-bind */
import React from 'react';
import { createRoot } from 'react-dom/client';
// eslint-disable-next-line react/no-deprecated
import { Command } from 'cmdk';
import type { FC } from '../../lib/teact/teact';
import {
  memo, useCallback, useEffect, useState,
} from '../../lib/teact/teact';
import { getGlobal } from '../../lib/teact/teactn';
import { withGlobal } from '../../global';

import type { ApiChat, ApiChatFolder, ApiUser } from '../../api/types';
import type { GlobalState } from '../../global/types';

import captureKeyboardListeners from '../../util/captureKeyboardListeners';
import { convertLayout } from '../../util/convertLayout';

import useCommands from '../../hooks/useCommands';

import AllUsersAndChats from '../common/AllUsersAndChats';

import './CommandMenu.scss';

const cmdkElement = document.getElementById('cmdk-search-root');
const cmdkRoot = createRoot(cmdkElement!);

interface CommandMenuSearchProps {
  topUserIds?: string[];
  usersById: Record<string, ApiUser>;
  folders: ApiChatFolder[];
  chatsById?: Record<string, ApiChat>;
  recentlyFoundChatIds?: string[];
}

const customFilter = (value: string, search: string) => {
  const convertedSearch = convertLayout(search);
  if (value.toLowerCase().includes(search.toLowerCase())
      || value.toLowerCase().includes(convertedSearch.toLowerCase())) {
    return 1; // полное соответствие
  }
  return 0; // нет соответствия
};

const CommandMenuSearch: FC<CommandMenuSearchProps> = ({
  topUserIds, folders,
}) => {
  const [isOpen, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { runCommand } = useCommands();
  const [pages, setPages] = useState(['home']);
  const activePage = pages[pages.length - 1];
  // eslint-disable-next-line no-null/no-null
  const folderId = activePage.includes('folderPage:') ? activePage.split(':')[1] : null;

  const close = useCallback(() => {
    setOpen(false);
    setPages(['home']);
    setInputValue('');
  }, []);

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.code === 'KeyK') {
        setOpen(!isOpen);
        console.log('Menu open', isOpen);
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [isOpen]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
  };

  const handleBack = useCallback(() => {
    if (pages.length > 1) {
      const newPages = pages.slice(0, -1);
      setPages(newPages);
    }
  }, [pages]);

  useEffect(() => (
    isOpen ? captureKeyboardListeners({ onEsc: close }) : undefined
  ), [isOpen, close]);

  const openFolderPage = useCallback((id) => { // Замена folderId на id
    setPages([...pages, `folderPage:${id}`]);
  }, [pages]);

  const handleSearchFocus = useCallback(() => {
    runCommand('OPEN_SEARCH');
    close();
  }, [runCommand, close]);

  const getFolderName = (id: number | null) => {
    // eslint-disable-next-line no-null/no-null
    if (id === null) return 'Unknown Folder';

    const global = getGlobal() as GlobalState;
    const folder = global.chatFolders.byId[id];
    return folder ? folder.title : `Folder ${id}`;
  };

  const CommandMenuInner = (
    <div>
      <Command.Dialog
        label="Command Menu"
        open={isOpen}
        onOpenChange={setOpen}
        loop
        shouldFilter
        filter={customFilter}
      >
        {pages.map((page) => {
        // Показываем бейдж только если страница не 'home'
          if (page !== 'home') {
            return (
              <div key={page} cmdk-vercel-badge="">
                {page.startsWith('folderPage') ? `Folder: ${getFolderName(Number(folderId))}` : page}
              </div>
            );
          }
          // eslint-disable-next-line no-null/no-null
          return null; // Ничего не рендерим для 'home'
        })}
        <Command.Input
          placeholder="Search chats, contacts or groups..."
          autoFocus
          onValueChange={handleInputChange}
          value={inputValue}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && inputValue === '') {
              handleBack();
            }
          }}
        />
        <Command.List>
          <AllUsersAndChats
            close={close}
            searchQuery={inputValue}
            topUserIds={topUserIds}
            folders={folders}
            openFolderPage={openFolderPage}
            setInputValue={setInputValue}
          />
        </Command.List>
        <Command.Empty />
        <button className="global-search" onClick={handleSearchFocus}>
          <i className="icon icon-search" />
          <span>
            <span>No results found</span>
            <span className="user-handle">Go to advanced search</span>
          </span>
          <span className="shortcuts">
            <span className="kbd">⌘</span>
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
  (global): CommandMenuSearchProps => {
    const { userIds: topUserIds } = global.topPeers;
    const usersById = global.users.byId;
    const chatsById = global.chats.byId;
    const chatFoldersById = global.chatFolders.byId;
    const orderedFolderIds = global.chatFolders.orderedIds;
    const recentlyFoundChatIds = global.recentlyFoundChatIds;
    const folders = orderedFolderIds
      ? orderedFolderIds.map((folderId) => chatFoldersById[folderId]).filter(Boolean)
      : [];

    return {
      topUserIds, usersById, chatsById, folders, recentlyFoundChatIds,
    };
  },
)(CommandMenuSearch));
