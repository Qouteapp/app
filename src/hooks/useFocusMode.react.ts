import { useCallback, useEffect } from 'react';

import { useStorage } from './useStorage.react';

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
