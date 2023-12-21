import type { ActionReturnType, GlobalState } from '../../../types';

import { addActionHandler, setGlobal } from '../../..';

type UpdateIsWorkspaceSettingsPayload = Partial<GlobalState['ulu']['workspaceSettings']>;

function updateIsWorkspaceSettings<T extends GlobalState>(
  global: T, { isOpen, workspaceId }: UpdateIsWorkspaceSettingsPayload,
) {
  global = {
    ...global,
    ulu: {
      ...global.ulu,
      workspaceSettings: {
        ...global.ulu.workspaceSettings,
        isOpen,
        workspaceId,
      },
    },
  };
  setGlobal(global);
  return global;
}

addActionHandler('openWorkspaceSettings', (global, _, payload): ActionReturnType => {
  updateIsWorkspaceSettings(global, { isOpen: true, workspaceId: payload?.workspaceId });
});

addActionHandler('closeWorkspaceSettings', (global): ActionReturnType => {
  updateIsWorkspaceSettings(global, { isOpen: false });
});
