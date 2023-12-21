import { useCallback, useEffect } from '../lib/teact/teact';

import { useStorage } from './useStorage';

export const useFocusMode = () => {
  const {
    isFocusModeEnabled, setIsFocusModeEnabled, focusModeEndTime, setFocusModeEndTime,
  } = useStorage();

  const checkFocusModeStatus = useCallback(() => {
    const now = Date.now();
    if (focusModeEndTime > 0 && focusModeEndTime <= now) {
      setIsFocusModeEnabled(false);
      setFocusModeEndTime(0);
    }
  }, [focusModeEndTime, setIsFocusModeEnabled, setFocusModeEndTime]);

  // Проверяем и обновляем статус фокус-режима каждую секунду
  useEffect(() => {
    const interval = setInterval(checkFocusModeStatus, 1000);
    return () => clearInterval(interval);
  }, [checkFocusModeStatus]);

  useEffect(() => {
    const htmlElement = document.documentElement;

    if (isFocusModeEnabled) {
      htmlElement.classList.add('is-focus-mode');
    } else {
      htmlElement.classList.remove('is-focus-mode');
    }
    return () => {
      htmlElement.classList.remove('is-focus-mode');
    };
  }, [isFocusModeEnabled]);

  const enableFocusMode = useCallback((duration: number) => {
    const endTime = Date.now() + duration;
    setIsFocusModeEnabled(true);
    setFocusModeEndTime(endTime);
  }, [setIsFocusModeEnabled, setFocusModeEndTime]);

  const disableFocusMode = useCallback(() => {
    setIsFocusModeEnabled(false);
    setFocusModeEndTime(0);
  }, [setIsFocusModeEnabled, setFocusModeEndTime]);

  return {
    isFocusModeEnabled,
    focusModeEndTime,
    enableFocusMode,
    disableFocusMode,
  };
};
