import { getLastWindow } from './utils';

let localStorage: Record<string, any> | undefined;

export async function captureLocalStorage(): Promise<void> {
  localStorage = await (getLastWindow())?.webContents.executeJavaScript('({ ...localStorage });');
}

export async function clearLocalStorage(): Promise<void> {
  // Очистка локального хранилища
  await getLastWindow()?.webContents.executeJavaScript('localStorage.clear();');
}

export async function restoreLocalStorage(): Promise<void> {
  if (!localStorage) {
    return;
  }

  await getLastWindow()?.webContents.executeJavaScript(
    Object.keys(localStorage).map(
      (key: string) => `localStorage.setItem('${key}', JSON.stringify(${localStorage![key]}))`,
    ).join(';'),
  );

  localStorage = undefined;
}
