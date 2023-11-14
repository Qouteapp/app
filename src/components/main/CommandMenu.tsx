/* eslint-disable no-console */
/* eslint-disable react-hooks-static-deps/exhaustive-deps */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/jsx-no-undef */
import React from 'react';
// eslint-disable-next-line react/no-deprecated
import { render } from 'react-dom';
// eslint-disable-next-line react/no-deprecated
import { Command, CommandSeparator, useCommandState } from 'cmdk';
import type { FC } from '../../lib/teact/teact';
import {
  memo, useCallback, useEffect, useState,
} from '../../lib/teact/teact';
import { getActions, getGlobal, withGlobal } from '../../global';

import type { ApiUser } from '../../api/types';

import { getMainUsername, getUserFirstOrLastName } from '../../global/helpers';
import { selectTabState } from '../../global/selectors';
import captureKeyboardListeners from '../../util/captureKeyboardListeners';
import { throttle } from '../../util/schedulers';
import renderText from '../common/helpers/renderText';

import useArchiver from '../../hooks/useArchiver';
import useCommands from '../../hooks/useCommands';
import { useJune } from '../../hooks/useJune';

import './CommandMenu.scss';

const cmdkRoot = document.getElementById('cmdk-root');
const SEARCH_CLOSE_TIMEOUT_MS = 250;
const NBSP = '\u00A0';

interface SubItemProps {
  children: React.ReactNode;
  onSelect: () => void;
}

const SubItem: React.FC<SubItemProps> = ({ children, onSelect }) => {
  const search = useCommandState((state) => state.search);
  // eslint-disable-next-line no-null/no-null
  if (!search) return null;
  return <Command.Item onSelect={onSelect}>{children}</Command.Item>;
};

interface CommandMenuProps {
  topUserIds: string[];
  usersById: Record<string, ApiUser>;
}

function convertLayout(input: string): string {
  const engToRus: { [key: string]: string } = {
    q: 'й',
    w: 'ц',
    e: 'у',
    r: 'к',
    t: 'е',
    y: 'н',
    u: 'г',
    i: 'ш',
    o: 'щ',
    p: 'з',
    '[': 'х',
    ']': 'ъ',
    a: 'ф',
    s: 'ы',
    d: 'в',
    f: 'а',
    g: 'п',
    h: 'р',
    j: 'о',
    k: 'л',
    l: 'д',
    ';': 'ж',
    '\'': 'э',
    z: 'я',
    x: 'ч',
    c: 'с',
    v: 'м',
    b: 'и',
    n: 'т',
    m: 'ь',
    ',': 'б',
    '.': 'ю',
    '/': '.',
  };

  const rusToEng: { [key: string]: string } = Object.fromEntries(
    Object.entries(engToRus).map(([eng, rus]) => [rus, eng]),
  );

  return input.split('').map((char) => {
    const lowerChar = char.toLowerCase();
    const isUpperCase = char !== lowerChar;
    const convertedChar = engToRus[lowerChar] || rusToEng[lowerChar] || char;

    return isUpperCase ? convertedChar.toUpperCase() : convertedChar;
  }).join('');
}

function customFilter(value: string, search: string): number {
  const convertedSearch = convertLayout(search);
  if (value.toLowerCase().includes(search.toLowerCase())
  || value.toLowerCase().includes(convertedSearch.toLowerCase())) {
    return 1; // полное соответствие
  }
  return 0; // нет соответствия
}

const CommandMenu: FC<CommandMenuProps> = ({ topUserIds, usersById }) => {
  const { track } = useJune();
  const { showNotification } = getActions();
  const [isOpen, setOpen] = useState(false);
  /* const [isArchiverEnabled, setIsArchiverEnabled] = useState(
    !!JSON.parse(String(localStorage.getItem('ulu_is_autoarchiver_enabled'))),
  ); */
  const { archiveMessages } = useArchiver({ isManual: true });
  const { runCommand } = useCommands();
  const [pages, setPages] = useState(['home']);
  const activePage = pages[pages.length - 1];
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSearchResults = async () => {
    if (searchQuery.length < 4) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    const { setGlobalSearchQuery } = getActions();
    await setGlobalSearchQuery({ query: searchQuery });

    const globalState = getGlobal();
    const { globalSearch } = selectTabState(globalState /* tabId */);
    const localChatIds = globalSearch?.localResults?.chatIds ?? [];
    const globalChatIds = globalSearch?.globalResults?.chatIds ?? [];

    setSearchResults([...localChatIds, ...globalChatIds]);
    setLoading(false);
  };

  useEffect(() => {
    fetchSearchResults();
  }, [searchQuery]);

  interface SuggestedContactsProps {
    topUserIds: string[];
    usersById: Record<string, ApiUser>;
  }

  const close = useCallback(() => {
    setOpen(false);
    setPages(['home']);
  }, []);

  const { loadTopUsers, openChat, addRecentlyFoundChatId } = getActions();
  const runThrottled = throttle(() => loadTopUsers(), 60000, true);

  useEffect(() => {
    runThrottled();
  }, [loadTopUsers]);

  const handleClick = useCallback((id: string) => {
    openChat({ id, shouldReplaceHistory: true });
    setTimeout(() => addRecentlyFoundChatId({ id }), SEARCH_CLOSE_TIMEOUT_MS);
    close();
  }, [openChat, addRecentlyFoundChatId]);

  const renderName = (userId: string) => {
    const name = getUserFirstOrLastName(usersById[userId]) || NBSP;
    const handle = getMainUsername(usersById[userId]) || NBSP;
    const renderedText = renderText(name);
    if (React.isValidElement(renderedText)) {
      return renderedText;
    }
    return (
      <span>
        <span className="user-name">{name}</span>
        <span className="user-handle">{handle}</span>
      </span>
    );
  };

  const SuggestedContacts: FC<SuggestedContactsProps> = ({ topUserIds }) => {
    const isFirstFive = (userId: string) => topUserIds.indexOf(userId) < 5;

    const renderItem = (userId: string) => {
      const Component = isFirstFive(userId) ? Command.Item : SubItem;
      return (
        <Component key={userId} onSelect={() => handleClick(userId)}>
          <span>{renderName(userId)}</span>
        </Component>
      );
    };

    return (
      <Command.Group heading="Suggested contacts">
        {topUserIds.map(renderItem)}
      </Command.Group>
    );
  };

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.code === 'KeyK') {
        setOpen(!isOpen);
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [isOpen]);

  const handleBack = useCallback(() => {
    if (pages.length > 1) {
      const newPages = pages.slice(0, -1);
      setPages(newPages);
    }
  }, [pages]);

  useEffect(() => (
    isOpen ? captureKeyboardListeners({ onEsc: close }) : undefined
  ), [isOpen, close]);

  const handleSelectNewChannel = useCallback(() => {
    runCommand('NEW_CHANNEL');
    close();
  }, [runCommand, close]);

  const handleSelectNewGroup = useCallback(() => {
    runCommand('NEW_GROUP');
    close();
  }, [runCommand, close]);

  const handleCreateFolder = useCallback(() => {
    runCommand('NEW_FOLDER');
    close();
  }, [runCommand, close]);

  /* const commandToggleArchiver = useCallback(() => {
    const updIsArchiverEnabled = !isArchiverEnabled;
    showNotification({ message: updIsArchiverEnabled ? 'Archiver enabled!' : 'Archiver disabled!' });
    localStorage.setItem('ulu_is_autoarchiver_enabled', JSON.stringify(updIsArchiverEnabled));
    setIsArchiverEnabled(updIsArchiverEnabled);
    close();
  }, [close, isArchiverEnabled]); */

  const commandArchiveAll = useCallback(() => {
    showNotification({ message: 'All older than 24 hours will be archived!' });
    archiveMessages();
    close();
    if (track) {
      track('commandArchiveAll');
    }
  }, [close, archiveMessages, track]);

  interface HomePageProps {
    setPages: (pages: string[]) => void;
    commandArchiveAll: () => void;
    topUserIds: string[];
    usersById: Record<string, ApiUser>;
  }

  const HomePage: React.FC<HomePageProps> = ({
    setPages, commandArchiveAll, topUserIds, usersById,
  }) => {
    return (
      <>
        {topUserIds && usersById && <SuggestedContacts topUserIds={topUserIds} usersById={usersById} />}
        <Command.Group heading="Create new...">
          <Command.Item onSelect={() => setPages(['home', 'createNew'])}>
            <i className="icon icon-add" /><span>Create new...</span>
          </Command.Item>
        </Command.Group>
        <CommandSeparator />
        <Command.Group heading="Settings">
          <Command.Item onSelect={commandArchiveAll}>
            <i className="icon icon-archive" /><span>Mark read chats as &quot;Done&quot; (May take ~1-3 min)</span>
          </Command.Item>
        </Command.Group>
        {loading && <Command.Loading>Fetching chats…</Command.Loading>}
        {!loading && searchResults.map((chatId) => (
          <Command.Item key={chatId} onSelect={() => handleClick(chatId)}>
            {/* Отобразите здесь имя чата, используя chatId */}
          </Command.Item>
        ))}
        {!loading && searchResults.length === 0 && (
          <Command.Empty>No results found.</Command.Empty>
        )}
      </>
    );
  };

  interface CreateNewPageProps {
    handleSelectNewGroup: () => void;
    handleSelectNewChannel: () => void;
    handleCreateFolder: () => void;
  }

  const CreateNewPage: React.FC<CreateNewPageProps> = (
    { handleSelectNewGroup, handleSelectNewChannel, handleCreateFolder },
  ) => {
    return (
      <>
        <Command.Item onSelect={handleSelectNewGroup}>
          <i className="icon icon-group" /><span>Create new group</span>
        </Command.Item>
        <Command.Item onSelect={handleSelectNewChannel}>
          <i className="icon icon-channel" /><span>Create new channel</span>
        </Command.Item>
        <Command.Item onSelect={handleCreateFolder}>
          <i className="icon icon-folder" /><span>Create new folder</span>
        </Command.Item>
      </>
    );
  };

  const renderPageContent = () => {
    switch (activePage) {
      case 'home':
        return (
          <HomePage
            setPages={setPages}
            commandArchiveAll={commandArchiveAll}
            topUserIds={topUserIds}
            usersById={usersById}
          />
        );
      case 'createNew':
        return (
          <CreateNewPage
            handleSelectNewGroup={handleSelectNewGroup}
            handleSelectNewChannel={handleSelectNewChannel}
            handleCreateFolder={handleCreateFolder}
          />
        );
      default:
        return undefined;
    }
  };

  const CommandMenuInner = (
    <Command.Dialog
      label="Command Menu"
      open={isOpen}
      onOpenChange={setOpen}
      loop
      shouldFilter
      filter={customFilter}
    >
      <Command.Input
        placeholder="Search for command..."
        autoFocus
        onValueChange={setSearchQuery}
        onKeyDown={(e) => {
          if (e.key === 'Backspace') {
            handleBack();
          }
        }}
      />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>
        {!loading && renderPageContent()}
      </Command.List>
    </Command.Dialog>
  );

  render(CommandMenuInner, cmdkRoot);
  return <div />;
};

export default memo(withGlobal(
  (global): { topUserIds?: string[]; usersById: Record<string, ApiUser> } => {
    const { userIds: topUserIds } = global.topPeers;
    const usersById = global.users.byId;

    return { topUserIds, usersById };
  },
)(CommandMenu));
