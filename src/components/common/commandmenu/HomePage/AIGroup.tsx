/* eslint-disable no-async-without-await/no-async-without-await */
/* eslint-disable react/no-array-index-key */
import React, { useMemo } from 'react';
import { Command } from 'cmdk';
import type { FC } from '../../../../lib/teact/teact';

import { aiPrompts } from '../../../../util/AIPromts';
import EventBus from '../../../../util/EventBus';

import CommandMenuListItem from '../CommandMenuListItem';

import '../../../main/CommandMenu.scss';

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
  const handleAICommand = async (commandType: keyof typeof aiPrompts) => {
    if (!selectedRange) {
      // eslint-disable-next-line no-alert
      alert('Текст не выбран');
      return;
    }

    try {
      const prompt = aiPrompts[commandType];
      // Используем EventBus для вызова handleSelectAICommand
      EventBus.emit('setAICommandHandler', selectedRange.toString(), prompt);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Ошибка обработки текста:', error);
    }
    close();
    // resetSelectedRange();
  };

  const menuItems = [
    {
      onSelect: () => handleAICommand('improveText'),
      icon: 'select',
      label: 'Improving writing',
    },
    {
      onSelect: () => handleAICommand('correctGrammar'),
      icon: 'check',
      label: 'Fix Spelling and Grammar',
    },
    {
      onSelect: () => handleAICommand('translateToEnglish'),
      icon: 'language',
      label: 'Translate to English',
    },
    {
      onSelect: () => handleAICommand('makeShorter'),
      icon: 'smallscreen',
      label: 'Make Text Shorter',
    },
    {
      onSelect: () => handleAICommand('makeLonger'),
      icon: 'expand',
      label: 'Make Text Longer',
    },
    {
      onSelect: () => handleAICommand('changeToneToFormal'),
      icon: 'admin',
      label: 'Change Tone to Formal',
    },
    {
      onSelect: () => handleAICommand('changeToneToFriendly'),
      icon: 'smile',
      label: 'Change Tone to Friendly',
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
          />
        ))}
    </Command.Group>
  );
};

export default AIGroup;
