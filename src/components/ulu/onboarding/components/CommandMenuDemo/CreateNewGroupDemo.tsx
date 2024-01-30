/* eslint-disable no-console */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-no-bind */
import React from 'react';
// eslint-disable-next-line react/no-deprecated
import { Command } from 'cmdk';
import type { FC } from '../../../../../lib/teact/teact';

import { cmdKey } from '../../../../../config';

import CommandMenuListItem from '../../../../common/commandmenu/CommandMenuListItem';

import '../../../../common/commandmenu/CommandMenu.scss';

interface CreateNewGroupProps {
  onSelect: () => void;
}

const CreateNewGroupDemo: FC<CreateNewGroupProps> = ({
  onSelect,
}) => {
  const menuItems = [
    {
      onSelect,
      icon: 'group',
      label: 'Create new group',
      shortcut: [cmdKey, 'G'],
    },
    {
      onSelect,
      icon: 'channel',
      label: 'Create new channel',
    },
    {
      onSelect,
      icon: 'folder',
      label: 'Create new folder',
    },
    {
      onSelect,
      icon: 'forums',
      label: 'Create workspace',
    },
    {
      onSelect,
      icon: 'bots',
      label: 'Create folder rule',
    },
    {
      onSelect,
      icon: 'video-outlined',
      label: 'Create new Google Meet',
      shortcut: [cmdKey, '⇧', 'M'],
    },
    {
      onSelect,
      icon: 'linear',
      label: 'Create new Linear task',
      shortcut: [cmdKey, '⇧', 'L'],
    },
  ];

  return (
    <Command.Group heading="Create new...">
      {menuItems.map((item, index) => (
        <CommandMenuListItem
          key={index}
          onSelect={item.onSelect}
          icon={item.icon}
          label={item.label}
          shortcut={item.shortcut}
        />
      ))}
    </Command.Group>
  );
};

export default CreateNewGroupDemo;
