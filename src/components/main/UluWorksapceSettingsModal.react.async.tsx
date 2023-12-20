import type { FC } from '../../lib/teact/teact';
import React from '../../lib/teact/teact';

import type { OwnProps } from './UluWorkspaceSettingsModalContent.react';

import { Bundles } from '../../util/moduleLoader';

import useModuleLoader from '../../hooks/useModuleLoader';

const UluWorkspaceSettingsModalAsync: FC<OwnProps> = (props) => {
  const UluWorkspaceSettingsModal = useModuleLoader(Bundles.Extra, 'UluWorkspaceSettingsModal', false);

  // eslint-disable-next-line react/jsx-props-no-spreading
  return UluWorkspaceSettingsModal ? <UluWorkspaceSettingsModal {...props} /> : undefined;
};

export default UluWorkspaceSettingsModalAsync;
