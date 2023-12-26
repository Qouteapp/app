/* eslint-disable no-null/no-null */
import { useEffect } from '../lib/teact/teact';

import { aiPrompts } from '../util/AIPromts';
import EventBus from '../util/EventBus';

const useAIHotkeys = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const selection = window.getSelection();
      const selectedText = selection && selection.toString();

      if (selectedText) {
        let commandType: keyof typeof aiPrompts | null = null;

        if ((e.metaKey || e.ctrlKey) && e.code === 'Digit1') {
          commandType = 'improveText';
        } else if ((e.metaKey || e.ctrlKey) && e.code === 'Digit2') {
          commandType = 'correctGrammar';
        } else if ((e.metaKey || e.ctrlKey) && e.code === 'Digit3') {
          commandType = 'translateToEnglish';
        } else if ((e.metaKey || e.ctrlKey) && e.code === 'Digit4') {
          commandType = 'makeShorter';
        } else if ((e.metaKey || e.ctrlKey) && e.code === 'Digit5') {
          commandType = 'makeLonger';
        } else if ((e.metaKey || e.ctrlKey) && e.code === 'Digit6') {
          commandType = 'changeToneToFormal';
        } else if ((e.metaKey || e.ctrlKey) && e.code === 'Digit7') {
          commandType = 'changeToneToFriendly';
        }

        if (commandType) {
          const prompt = aiPrompts[commandType];
          EventBus.emit('setAICommandHandler', selectedText, prompt);
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
};

export default useAIHotkeys;
