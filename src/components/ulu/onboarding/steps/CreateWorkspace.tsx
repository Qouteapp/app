import type { FC } from '../../../../lib/teact/teact';
import React, { useCallback, useRef, useState } from '../../../../lib/teact/teact';
import { getActions } from '../../../../global';

import Layout from '../util/Layout';

import useLang from '../../../../hooks/useLang';

import WorkspaceCreator from '../../../main/UluWorkspaceSettingsModal/WorkspaceCreator';

import styles from './CreateWorkspace.module.scss';

const FirstWorkspace: FC = () => {
  const lang = useLang();

  const { goToOnboardingNextStep } = getActions();

  const [workspaceName, setWorkspaceName] = useState<string>('');
  const [selectedFolderIds, setSelectedFolderIds] = useState<number[]>([]);
  const isWorkspaceValid = Boolean(workspaceName && selectedFolderIds.length);
  const actionText = isWorkspaceValid ? lang('OnboardingCreateWorkspaceAction') : lang('OnboardingActionLater');

  // eslint-disable-next-line no-null/no-null
  const createWorkspaceButtonRef = useRef<HTMLButtonElement>(null);

  const next = useCallback(() => {
    if (isWorkspaceValid) {
      createWorkspaceButtonRef.current?.click();
    }

    goToOnboardingNextStep();
  }, [goToOnboardingNextStep, isWorkspaceValid]);

  return (
    <Layout
      className={styles.layout}
      title={lang('OnboardingCreateWorkspaceTitle')}
      subtitle={lang('OnboardingCreateWorkspaceSubtitle')}
      actionText={actionText}
      actionHandler={next}
    >
      <WorkspaceCreator
        classNameFolders={styles.folders}
        classNameFolder={styles.folder}
        classNameCreateWorkspaceButton={styles.createWorkspaceActionButton}
        createWorkspaceButtonRef={createWorkspaceButtonRef}
        onChangeName={setWorkspaceName}
        onChangeFolders={setSelectedFolderIds}
      />
    </Layout>
  );
};

export default FirstWorkspace;
