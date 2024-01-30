import type { FC } from '../../../../lib/teact/teact';
import React, { useCallback } from '../../../../lib/teact/teact';
import { getActions } from '../../../../global';

import Layout from '../util/Layout';

import useLang from '../../../../hooks/useLang';

const FoldersRules: FC = () => {
  const lang = useLang();

  const { goToOnboardingNextStep } = getActions();

  const next = useCallback(() => {
    goToOnboardingNextStep();
  }, [goToOnboardingNextStep]);

  return (
    <Layout
      title={lang('OnboardingFolderRulesTitle')}
      subtitle={lang('OnboardingFolderRulesSubtitle')}
      actionText={lang('OnboardingActionSkip')}
      actionHandler={next}
    >
      <div>Onboarding Folders Style</div>
    </Layout>
  );
};

export default FoldersRules;
