/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-no-bind */
import React from 'react';
// eslint-disable-next-line react/no-deprecated
import { Command } from 'cmdk';
import type { FC } from '../../../../../lib/teact/teact';

import CommandMenuListItem from '../../../../common/commandmenu/CommandMenuListItem';

import '../../../../common/commandmenu/CommandMenu.scss';

interface BillingGroupProps {
  onSelect: () => void;
}

const BillingGroupDemo: FC<BillingGroupProps> = ({
  onSelect,
}) => {
  const menuItems = [
    {
      onSelect,
      icon: 'favorite',
      label: 'Upgrade to `ulu` Premium for $4.99',
    },
    {
      onSelect,
      icon: 'settings',
      label: 'Manage billing',
    },
  ];

  return (
    <Command.Group heading="Billing">
      {menuItems.map((item, index) => (
        <CommandMenuListItem
          key={index}
          onSelect={item.onSelect}
          icon={item.icon}
          label={item.label}
        />
      ))}
    </Command.Group>
  );
};

export default BillingGroupDemo;
