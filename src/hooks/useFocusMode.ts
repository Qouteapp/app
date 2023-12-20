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

  const enableFocusMode = useCallback((duration: number) => {
    const endTime = Date.now() + duration;
    setIsFocusModeEnabled(true);
    setFocusModeEndTime(endTime);
    localStorage.setItem('ulu_is_focus_mode_enabled', JSON.stringify(true));
    localStorage.setItem('ulu_focus_mode_end_time', JSON.stringify(endTime));
  }, [setIsFocusModeEnabled, setFocusModeEndTime]);

  const disableFocusMode = useCallback(() => {
    setIsFocusModeEnabled(false);
    setFocusModeEndTime(0);
    localStorage.setItem('ulu_is_focus_mode_enabled', JSON.stringify(false));
    localStorage.setItem('ulu_focus_mode_end_time', JSON.stringify(0));
  }, [setIsFocusModeEnabled, setFocusModeEndTime]);

  return {
    isFocusMode: isFocusModeEnabled,
    enableFocusMode,
    disableFocusMode,
  };
};
