import type { GlobalState } from '../../types';

export function selectIsWorkspaceSettingsOpen<T extends GlobalState>(global: T) {
  return global.ulu.workspaceSettings.isOpen;
}

export function selectWorkspaceSettingsId<T extends GlobalState>(global: T) {
  return global.ulu.workspaceSettings.workspaceId;
}
