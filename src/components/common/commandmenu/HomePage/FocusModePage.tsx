/* eslint-disable react/no-array-index-key */
import React from 'react';
import { Command } from 'cmdk';
import { type FC } from '../../../../lib/teact/teact';
import { getActions } from '../../../../global';

import { JUNE_TRACK_EVENTS } from '../../../../config';

import { useFocusMode } from '../../../../hooks/useFocusMode';
import { useJune } from '../../../../hooks/useJune';

import CommandMenuListItem from '../CommandMenuListItem';

interface FocusModePageProps {
  close: () => void;
  setInputValue: (value: string) => void;
}

const FocusModePage: FC<FocusModePageProps> = ({
  close,
}) => {
  const { track } = useJune();
  const { enableFocusMode } = useFocusMode();
  const { showNotification } = getActions();

  const calculateDurationUntilTomorrowMorning = () => {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 6, 0, 0);
    return tomorrow.getTime() - now.getTime();
  };

  const calculateDurationUntilNextMonday = () => {
    const now = new Date();
    const nextMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (8 - now.getDay()), 6, 0, 0);
    return nextMonday.getTime() - now.getTime();
  };

  const toggleFocusMode = (duration: number) => {
    enableFocusMode(duration);
    showNotification({ message: 'Focus mode is turned on' });
    if (typeof track === 'function') {
      track(JUNE_TRACK_EVENTS.ENABLE_FOCUS_MODE);
    }
    close();
  };

  const menuItems = [
    {
      onSelect: () => toggleFocusMode(600000), // 10 minutes
      icon: 'timer',
      label: '10 minutes',
    },
    {
      onSelect: () => toggleFocusMode(3600000), // 1 hour
      icon: 'timer',
      label: '1 hour',
    },
    {
      onSelect: () => toggleFocusMode(calculateDurationUntilTomorrowMorning()),
      icon: 'timer',
      label: 'Until tomorrow',
    },
    {
      onSelect: () => toggleFocusMode(calculateDurationUntilNextMonday()),
      icon: 'timer',
      label: 'Until next Monday',
    },
  ];

  return (
    <Command.Group>
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

export default FocusModePage;
