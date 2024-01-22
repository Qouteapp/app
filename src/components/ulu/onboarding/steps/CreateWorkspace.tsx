import type { FC } from '../../../../lib/teact/teact';
import React, { useCallback } from '../../../../lib/teact/teact';
import { getActions } from '../../../../global';

import Layout from '../util/Layout';

import useLang from '../../../../hooks/useLang';

import WorkspaceCreator from '../../../main/UluWorkspaceSettingsModal/WorkspaceCreator';

import styles from './CreateWorkspace.module.scss';

const FirstWorkspace: FC = () => {
  const lang = useLang();

  const { goToOnboardingNextStep } = getActions();

  const next = useCallback(() => {
    goToOnboardingNextStep();
  }, [goToOnboardingNextStep]);

  return (
    <Layout
      title={lang('OnboardingCreateWorkspaceTitle')}
      subtitle={lang('OnboardingCreateWorkspaceSubtitle')}
      actionText={lang('OnboardingActionLater')}
      actionHandler={next}
    >
      <WorkspaceCreator
        classNameFolders={styles.folders}
        classNameFolder={styles.folder}
        onCreate={next}
      />
    </Layout>
  );
};

export default FirstWorkspace;
