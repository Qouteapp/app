/* eslint-disable no-async-without-await/no-async-without-await */
/* eslint-disable react/no-array-index-key */
import React, { useCallback, useMemo } from 'react';
import { Command } from 'cmdk';
import type { FC } from '../../../../lib/teact/teact';

import { cmdKey } from '../../../../config';
import { aiPrompts } from '../../../../util/AIPromts';
import EventBus from '../../../../util/EventBus';

import CommandMenuListItem from '../CommandMenuListItem';

import '../CommandMenu.scss';

interface AIGroupProps {
  close: () => void;
  selectedRange?: Range | null;
  resetSelectedRange: () => void;
}

const AIGroup: FC<AIGroupProps> = ({
  close,
  selectedRange,
}) => {
  const apiKey = localStorage.getItem('openai_api_key');
  const isTextSelected = useMemo(() => {
    const selection = window.getSelection();
    return selection && !selection.isCollapsed;
  }, []);

  const executeAICommand = useCallback((commandType: keyof typeof aiPrompts) => {
    if (!selectedRange) {
      return;
    }
    const prompt = aiPrompts[commandType];
    EventBus.emit('setAICommandHandler', selectedRange.toString(), prompt);
    close();
  }, [selectedRange, close]);

  const handleAICommand = async (commandType: keyof typeof aiPrompts) => {
    if (!selectedRange) {
      return;
    }
    if (!apiKey) {
      return;
    }
    executeAICommand(commandType);
  };

  const menuItems = [
    {
      onSelect: () => handleAICommand('improveText'),
      icon: 'select',
      label: 'Improving writing',
      shortcut: [cmdKey, '1'],
    },
    {
      onSelect: () => handleAICommand('correctGrammar'),
      icon: 'check',
      label: 'Fix Spelling and Grammar',
      shortcut: [cmdKey, '2'],
    },
    {
      onSelect: () => handleAICommand('translateToEnglish'),
      icon: 'language',
      label: 'Translate to English',
      shortcut: [cmdKey, '3'],
    },
    {
      onSelect: () => handleAICommand('makeShorter'),
      icon: 'smallscreen',
      label: 'Make Text Shorter',
      shortcut: [cmdKey, '4'],
    },
    {
      onSelect: () => handleAICommand('makeLonger'),
      icon: 'expand',
      label: 'Make Text Longer',
      shortcut: [cmdKey, '5'],
    },
    {
      onSelect: () => handleAICommand('changeToneToFormal'),
      icon: 'admin',
      label: 'Change Tone to Formal',
      shortcut: [cmdKey, '6'],
    },
    {
      onSelect: () => handleAICommand('changeToneToFriendly'),
      icon: 'smile',
      label: 'Change Tone to Friendly',
      shortcut: [cmdKey, '7'],
    },
  ];

  return (
    <Command.Group>
      {isTextSelected && apiKey
        && menuItems.map((item, index) => (
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

export default AIGroup;
