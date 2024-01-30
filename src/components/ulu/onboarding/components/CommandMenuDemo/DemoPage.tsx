/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-no-bind */
import React from 'react';
import { Command } from 'cmdk';

import type { ApiUser } from '../../../../../api/types';

import BillingGroupDemo from './BillingGroupDemo';
import CreateNewGroupDemo from './CreateNewGroupDemo';
import HelpGroupDemo from './HelpGroupDemo';
import SuggestedContactsDemo from './SuggestedContactsDemo';

import '../../../../common/commandmenu/CommandMenu.scss';

type OwnProps = {
  topUserIds?: string[];
  usersById: Record<string, ApiUser>;
  recentlyFoundChatIds?: string[];
  menuItems: Array<{ label: string; value: string }>;
  inputValue: string;
  onSelect: () => void;
};

const DemoPage: React.FC<OwnProps> = ({
  onSelect,
  topUserIds,
  usersById,
  recentlyFoundChatIds,
  menuItems,
  inputValue,
}) => {
  return (
    <>
      {inputValue === '' && topUserIds && usersById && (
        <SuggestedContactsDemo
          topUserIds={topUserIds}
          usersById={usersById}
          recentlyFoundChatIds={recentlyFoundChatIds}
          onSelect={onSelect}
        />
      )}
      <CreateNewGroupDemo
        onSelect={onSelect}
      />
      <Command.Group heading="What's new">
        <Command.Item onSelect={onSelect}>
          <i className="icon icon-calendar" />
          <span>Changelog</span>
        </Command.Item>
        <Command.Item onSelect={onSelect}>
          <i className="icon icon-folder" />
          <span>
            Enable the new folders UI (Beta)
          </span>
        </Command.Item>
      </Command.Group>
      <HelpGroupDemo onSelect={onSelect} />
      <Command.Group heading="Settings">
        <Command.Item
          onSelect={onSelect}
          value="'Change interface theme', 'Dark', 'Light'"
        >
          <i className="icon icon-darkmode" />
          <span>Change interface theme</span>
        </Command.Item>
        <Command.Item
          onSelect={onSelect}
        >
          <i className="icon icon-unmute" />
          <span>Notifications settings</span>
        </Command.Item>
        <Command.Item onSelect={onSelect}>
          <i className="icon icon-readchats" />
          <span>Mark All Read Chats as Done</span>
        </Command.Item>
        <Command.Item onSelect={onSelect}>
          <i className="icon icon-archive-from-main" />
          <span>Archive All Read Chats (May take ~1-3 min)</span>
        </Command.Item>
        <Command.Item onSelect={onSelect}>
          <i className="icon icon-select" />
          <span>
            Enable Auto-Done for Read Chats
          </span>
        </Command.Item>
        <Command.Item onSelect={onSelect}>
          <i className="icon icon-archive" />
          <span>
            Enable `&ldquo;`Аrchive chats when mark as done`&rdquo;`
          </span>
        </Command.Item>
        {menuItems.map((item, index) => (
          <Command.Item
            key={index}
            onSelect={onSelect}
          >
            {item.label}
          </Command.Item>
        ))}
        <Command.Item
          onSelect={onSelect}
        >
          <i className="icon icon-mute" />
          <span>
            Enable Focus Mode
          </span>
        </Command.Item>
      </Command.Group>
      <BillingGroupDemo onSelect={onSelect} />
    </>
  );
};

export default DemoPage;
