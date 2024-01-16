import type { FC } from '../../../../lib/teact/teact';
import React, { useCallback } from '../../../../lib/teact/teact';
import { getActions } from '../../../../global';

import Layout from '../util/Layout';

import useLang from '../../../../hooks/useLang';

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
      <div>Onboarding First Workspace</div>
    </Layout>
  );
};

export default FirstWorkspace;
