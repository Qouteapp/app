/* eslint-disable no-console */
import {
  useCallback, useEffect, useRef, useState,
} from '../lib/teact/teact';

type UseFocusModeReturn = {
  isFocusMode: boolean;
  enableFocusMode: (duration?: number) => void;
  disableFocusMode: () => void;
};

export const useFocusMode = (): UseFocusModeReturn => {
  const [isFocusMode, setFocusMode] = useState<boolean>(false);
  const focusModeTimeout = useRef<NodeJS.Timeout>();

  const enableFocusMode = useCallback((duration: number = 6): void => {
    setFocusMode(true);
    console.log('Focus mode set to true');
    focusModeTimeout.current = setTimeout(() => {
      console.log('Disabling focus mode');
      setFocusMode(false);
    }, duration);
  }, []);

  useEffect(() => {
    console.log('Updated isFocusMode (hook):', isFocusMode);
  }, [isFocusMode]);

  const disableFocusMode = useCallback((): void => {
    setFocusMode(false);
    if (focusModeTimeout.current) {
      clearTimeout(focusModeTimeout.current);
    }
  }, []);

  useEffect(() => {
    // Очищаем таймер при размонтировании компонента
    return () => {
      if (focusModeTimeout.current) {
        clearTimeout(focusModeTimeout.current);
      }
    };
  }, []);

  return { isFocusMode, enableFocusMode, disableFocusMode };
};
