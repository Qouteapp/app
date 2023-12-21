import {
  app, BrowserWindow, Menu, nativeImage, Tray,
} from 'electron';
import path from 'path';

import {
  focusLastWindow, forceQuit, getAppTitle, store,
} from './utils';

const TRAY_ICON_SETTINGS_KEY = 'trayIcon';
const WINDOW_BLUR_TIMEOUT = 800;

interface TrayHelper {
  instance?: Tray;
  lastFocusedWindow?: BrowserWindow;
  lastFocusedWindowTimer?: ReturnType<typeof setTimeout>;
  setupListeners: (window: BrowserWindow) => void;
  create: () => void;
  enable: () => void;
  disable: () => void;
  isEnabled: boolean;
  updateTrayTitle: (unreadCount: number) => void;
}

const tray: TrayHelper = {
  setupListeners(window: BrowserWindow) {
    window.on('focus', () => {
      clearTimeout(this.lastFocusedWindowTimer);
      this.lastFocusedWindow = window;
    });

    window.on('blur', () => {
      this.lastFocusedWindowTimer = setTimeout(() => {
        if (this.lastFocusedWindow === window) {
          this.lastFocusedWindow = undefined;
        }
      }, WINDOW_BLUR_TIMEOUT);
    });

    window.on('close', () => {
      this.lastFocusedWindow = undefined;
    });
  },

  updateTrayTitle(unreadCount: number) {
    if (!this.instance) {
      return;
    }

    const title = unreadCount > 0 ? ` ${unreadCount}` : '';
    this.instance.setTitle(title);
  },

  create() {
    if (this.instance) {
      return;
    }

    let iconPath;
    if (process.platform === 'darwin') {
    // Путь к иконке для MacOS
      iconPath = path.resolve(__dirname, '../public/icon-electron-macos-tray.png');
    } else {
    // Путь к иконке для Windows
      iconPath = path.resolve(__dirname, '../public/icon-electron-windows.ico');
    }

    const icon = nativeImage.createFromPath(iconPath);
    const title = getAppTitle();

    this.instance = new Tray(icon);

    const handleOpenFromTray = () => {
      focusLastWindow();
    };

    const handleCloseFromTray = () => {
      forceQuit.enable();
      app.quit();
    };

    const handleTrayClick = () => {
      if (this.lastFocusedWindow) {
        BrowserWindow.getAllWindows().forEach((window) => window.hide());
        this.lastFocusedWindow = undefined;
      } else {
        handleOpenFromTray();
      }
    };

    const contextMenu = Menu.buildFromTemplate([
      { label: `Open ${title}`, click: handleOpenFromTray },
      { label: `Quit ${title}`, click: handleCloseFromTray },
    ]);

    this.instance.on('click', handleTrayClick);
    this.instance.setContextMenu(contextMenu);
    this.instance.setToolTip(title);
    if (process.platform !== 'darwin') {
      this.instance.setTitle(title);
    }
  },

  enable() {
    store.set(TRAY_ICON_SETTINGS_KEY, true);
    this.create();
  },

  disable() {
    store.set(TRAY_ICON_SETTINGS_KEY, false);
    this.instance?.destroy();
    this.instance = undefined;
  },

  get isEnabled(): boolean {
    return store.get(TRAY_ICON_SETTINGS_KEY, true) as boolean;
  },
};

export default tray;
