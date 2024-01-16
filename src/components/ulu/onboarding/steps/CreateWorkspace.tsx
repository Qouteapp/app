import type { FC } from '../../../../lib/teact/teact';
import React, { useCallback } from '../../../../lib/teact/teact';
import { getActions } from '../../../../global';

import ContentWrapper from '../util/ContentWrapper';
import Layout from '../util/Layout';

import useLang from '../../../../hooks/useLang';

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
      <ContentWrapper>
        <div className={styles.createWorkspace}>
          <i
            className="icon icon-add"
            data-char="add"
          />
          <div>{lang('OnboardingCreateWorkspaceAction')}</div>
        </div>
      </ContentWrapper>
    </Layout>
  );
};

export default FirstWorkspace;
