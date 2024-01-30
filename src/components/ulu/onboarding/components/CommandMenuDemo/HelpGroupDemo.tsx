/* eslint-disable no-console */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-no-bind */
import React from 'react';
import { Command } from 'cmdk';
import type { FC } from '../../../../../lib/teact/teact';

import CommandMenuListItem from '../../../../common/commandmenu/CommandMenuListItem';

import '../../../../common/commandmenu/CommandMenu.scss';

interface HelpGroupProps {
  onSelect: () => void;
}

const HelpGroupDemo: FC<HelpGroupProps> = ({
  onSelect,
}) => {
  const menuItems = [
    {
      onSelect,
      icon: 'document',
      label: 'Help center',
    },
    {
      onSelect,
      label: 'Keyboard shortcuts',
      icon: 'keyboard',
    },
    {
      onSelect,
      label: 'Send feedback',
      icon: 'ask-support',
    },
    {
      onSelect,
      label: 'Request feature',
      icon: 'animations',

    },
    {
      onSelect,
      label: 'Report bug',
      icon: 'bug',
    },
    {
      onSelect,
      label: 'Contact support',
      icon: 'help',
    },
  ];

  return (
    <Command.Group heading="Help">
      {menuItems.map((item, index) => (
        <CommandMenuListItem
          key={index}
          onSelect={item.onSelect}
          label={item.label}
          icon={item.icon}
        />
      ))}
    </Command.Group>
  );
};

export default HelpGroupDemo;
