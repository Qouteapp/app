/* eslint-disable no-console */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-no-bind */
import React from 'react';
// eslint-disable-next-line react/no-deprecated
import { Command } from 'cmdk';
import type { FC } from '../../../../lib/teact/teact';
import { getActions } from '../../../../lib/teact/teactn';

import CommandMenuListItem from '../CommanMenuListItem';

import '../../../main/CommandMenu.scss';

interface BillingGroupProps {
  close: () => void;
}

const BillingGroup: FC<BillingGroupProps> = ({
  close,
}) => {
  const {
    openUrl,
  } = getActions();

  const handleSubscribePremuim = () => {
    close();
    openUrl({
      url: 'https://ulu.lemonsqueezy.com/checkout/buy/8c9e6aeb-b550-4ea9-9b9d-44ca0bb5069e',
      shouldSkipModal: true,
    });
  };

  const handleManageBilling = () => {
    close();
    openUrl({
      url: 'https://ulu.lemonsqueezy.com/billing',
      shouldSkipModal: true,
    });
  };

  const menuItems = [
    {
      onSelect: handleSubscribePremuim,
      icon: 'favorite',
      label: 'Upgrade to `ulu` Premium for $4.99',
    },
    {
      onSelect: handleManageBilling,
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

export default BillingGroup;
