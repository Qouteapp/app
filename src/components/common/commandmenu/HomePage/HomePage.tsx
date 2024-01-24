/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-no-bind */
import React, { useCallback } from 'react';
// eslint-disable-next-line react/no-deprecated
import { Command } from 'cmdk';
import { useEffect } from '../../../../lib/teact/teact';

import type { ApiUser } from '../../../../api/types';
import type { Workspace } from '../../../../types';

import { cmdKey } from '../../../../config';
import { IS_MAC_OS } from '../../../../util/windowEnvironment';

import useCommands from '../../../../hooks/useCommands';
import useLang from '../../../../hooks/useLang';

import AIGroup from './AIGroup';
import BillingGroup from './BillingGroup';
import CreateNewGroup from './CreateNewGroup';
import HelpGroup from './HelpGroup';
import NavigationGroup from './NavigationGroup';
import SuggestedContacts from './SuggestedContactsGroup';

import '../CommandMenu.scss';

type OwnProps = {
  isArchiveWhenDoneEnabled: boolean;
  isAutoDoneEnabled: boolean;
  isFoldersTreeEnabled: boolean;
  isFocusModeEnabled: boolean;
  topUserIds?: string[];
  usersById: Record<string, ApiUser>;
  recentlyFoundChatIds?: string[];
  menuItems: Array<{ label: string; value: string }>;
  currentWorkspace: Workspace;
  allWorkspaces: Workspace[];
  currentChatId?: string;
  inputValue: string;
  isCurrentChatDone?: boolean;
  isChatUnread?: boolean;
  selectedRange?: Range | null;
  resetSelectedRange: () => void;
  saveAPIKey: () => void;
  commandDoneAll: () => void;
  handleDoneChat: () => void;
  commandArchiveAll: () => void;
  commandToggleAutoDone: () => void;
  commandToggleArchiveWhenDone: () => void;
  commandToggleFoldersTree: () => void;
  handleToggleChatUnread: () => void;
  handleOpenAutomationSettings: () => void;
  handleOpenWorkspaceSettings: () => void;
  handleDisableFocusMode: () => void;
  handleSelectWorkspace: (workspaceId: string) => void;
  openChangeThemePage: () => void;
  openFocusModePage: () => void;
  handleChangelog: () => void;
  close: () => void;
};

const HomePage: React.FC<OwnProps> = ({
  commandDoneAll,
  commandToggleAutoDone,
  isAutoDoneEnabled,
  commandToggleFoldersTree,
  commandArchiveAll,
  commandToggleArchiveWhenDone,
  isArchiveWhenDoneEnabled,
  topUserIds,
  usersById,
  recentlyFoundChatIds,
  close,
  isFoldersTreeEnabled,
  openChangeThemePage,
  menuItems,
  inputValue,
  saveAPIKey,
  isFocusModeEnabled,
  selectedRange,
  handleChangelog,
  openFocusModePage,
  handleDisableFocusMode,
  handleOpenAutomationSettings,
  allWorkspaces,
  handleOpenWorkspaceSettings,
  handleSelectWorkspace,
  currentWorkspace,
  currentChatId,
  isCurrentChatDone,
  handleDoneChat,
  handleToggleChatUnread,
  resetSelectedRange,
  isChatUnread,
}) => {
  const lang = useLang();

  const { runCommand } = useCommands();
  const handleOpenNotificationScreen = useCallback(() => {
    runCommand('OPEN_NOTIFICATION_SETTINGS');
    close();
  }, [close, runCommand]);

  const handleSnoozeChat = useCallback(() => {
    close();
    setTimeout(() => {
      runCommand('SNOOZE_CHAT');
    }, 100); // for focus
  }, [close, runCommand]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (IS_MAC_OS ? (event.metaKey && event.shiftKey && event.key === 'a')
        : (event.ctrlKey && event.shiftKey && event.key === 'a')) {
        commandDoneAll();
      }
    };

    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [commandDoneAll]);

  return (
    <>
      <AIGroup
        close={close}
        selectedRange={selectedRange}
        resetSelectedRange={resetSelectedRange}
      />
      {currentChatId && (
        <Command.Group>
          {!isCurrentChatDone && (
            <Command.Item onSelect={handleDoneChat}>
              <i className="icon icon-select" />
              <span>Mark as Done</span>
              <span className="shortcuts">
                <span className="kbd">{cmdKey}</span>
                <span className="kbd">E</span>
              </span>
            </Command.Item>
          )}
          {/* // disable snooze */}
          {false && (
            <Command.Item onSelect={handleSnoozeChat}>
              <i className="icon icon-schedule" />
              <span>Set a reminder for this chat</span>
              <span className="shortcuts">
                <span className="kbd">{cmdKey}</span>
                <span className="kbd">H</span>
              </span>
            </Command.Item>
          )}
          <Command.Item onSelect={handleToggleChatUnread}>
            <i
              className={`icon ${
                isChatUnread ? 'icon-unread' : 'icon-readchats'
              }`}
            />
            <span>{lang(isChatUnread ? 'MarkAsRead' : 'MarkAsUnread')}</span>
            <span className="shortcuts">
              <span className="kbd">{cmdKey}</span>
              <span className="kbd">U</span>
            </span>
          </Command.Item>
        </Command.Group>
      )}
      {inputValue === '' && topUserIds && usersById && (
        <SuggestedContacts
          topUserIds={topUserIds}
          usersById={usersById}
          recentlyFoundChatIds={recentlyFoundChatIds}
          close={close}
        />
      )}
      <CreateNewGroup
        close={close}
        handleOpenWorkspaceSettings={handleOpenWorkspaceSettings}
      />
      <NavigationGroup
        allWorkspaces={allWorkspaces}
        handleSelectWorkspace={handleSelectWorkspace}
        currentWorkspace={currentWorkspace}
        openAutomationSettings={handleOpenAutomationSettings}
        close={close}
      />
      <Command.Group heading="What's new">
        <Command.Item onSelect={handleChangelog}>
          <i className="icon icon-calendar" />
          <span>Changelog</span>
        </Command.Item>
        <Command.Item onSelect={commandToggleFoldersTree}>
          <i className="icon icon-folder" />
          <span>
            {isFoldersTreeEnabled
              ? 'Switch back to the Telegram folders UI'
              : 'Enable the new folders UI (Beta)'}
          </span>
        </Command.Item>
      </Command.Group>
      <HelpGroup close={close} />
      <Command.Group heading="Settings">
        <Command.Item
          onSelect={openChangeThemePage}
          value="'Change interface theme', 'Dark', 'Light'"
        >
          <i className="icon icon-darkmode" />
          <span>Change interface theme</span>
        </Command.Item>
        <Command.Item
          onSelect={handleOpenNotificationScreen}
        >
          <i className="icon icon-unmute" />
          <span>Notifications settings</span>
        </Command.Item>
        <Command.Item onSelect={commandDoneAll}>
          <i className="icon icon-readchats" />
          <span>Mark All Read Chats as Done</span>
          <span className="shortcuts">
            <span className="kbd">{cmdKey}</span>
            <span className="kbd">⇧</span>
            <span className="kbd">A</span>
          </span>
        </Command.Item>
        <Command.Item onSelect={commandArchiveAll}>
          <i className="icon icon-archive-from-main" />
          <span>Archive All Read Chats (May take ~1-3 min)</span>
        </Command.Item>
        <Command.Item onSelect={commandToggleAutoDone}>
          <i className="icon icon-select" />
          <span>
            {isAutoDoneEnabled
              ? 'Disable Auto-Done for Read Chats'
              : 'Enable Auto-Done for Read Chats'}
          </span>
        </Command.Item>
        <Command.Item onSelect={commandToggleArchiveWhenDone}>
          <i className="icon icon-archive" />
          <span>
            {isArchiveWhenDoneEnabled
              ? 'Disable "Аrchive chats when mark as done"'
              : 'Enable "Аrchive chats when mark as done"'}
          </span>
        </Command.Item>
        {menuItems.map((item, index) => (
          <Command.Item
            key={index}
            onSelect={item.value === 'save_api_key' ? saveAPIKey : undefined}
          >
            {item.label}
          </Command.Item>
        ))}
        <Command.Item
          onSelect={
            isFocusModeEnabled ? handleDisableFocusMode : openFocusModePage
          }
        >
          {isFocusModeEnabled ? (
            <i className="icon icon-unmute" />
          ) : (
            <i className="icon icon-mute" />
          )}
          <span>
            {isFocusModeEnabled ? 'Disable Focus Mode' : 'Enable Focus Mode'}
          </span>
        </Command.Item>
      </Command.Group>
      <BillingGroup close={close} />
    </>
  );
};

export default HomePage;
