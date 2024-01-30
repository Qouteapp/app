/* eslint-disable react/jsx-no-bind */
import React from 'react';
import { createRoot } from 'react-dom/client';

import type { OwnProps } from './UluWorkspaceSettingsModalContent.react';

import UluWorkspaceSettingsModalContent from './UluWorkspaceSettingsModalContent.react';

const workspaceSettingsElement = document.getElementById('workspace-settings-root');
const workspaceSettingsRoot = createRoot(workspaceSettingsElement!);

const UluWorkspaceSettingsModal: React.FC<OwnProps> = ({ isOpen, onClose, workspaceId }) => {
  workspaceSettingsRoot.render(
    isOpen ? (
      <UluWorkspaceSettingsModalContent
        isOpen={isOpen}
        workspaceId={workspaceId}
        onClose={onClose}
      />
    ) : undefined,
  );

  return undefined;
};

export default UluWorkspaceSettingsModal;
