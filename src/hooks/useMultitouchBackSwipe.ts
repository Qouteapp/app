import { useEffect } from 'react';
import { ipcRenderer } from 'electron';

const useMultitouchBackSwipe = (callback: () => void) => {
  useEffect(() => {
    const handleScrollTouchBegin = () => {
      // Логика, которая будет выполняться при начале свайпа
      // Например, начать отслеживать свайп
    };

    const handleScrollTouchEnd = () => {
      // Вызов callback при завершении свайпа
      callback();
    };

    ipcRenderer.on('scroll-touch-begin', handleScrollTouchBegin);
    ipcRenderer.on('scroll-touch-end', handleScrollTouchEnd);

    return () => {
      ipcRenderer.removeListener('scroll-touch-begin', handleScrollTouchBegin);
      ipcRenderer.removeListener('scroll-touch-end', handleScrollTouchEnd);
    };
  }, [callback]);
};

export default useMultitouchBackSwipe;
