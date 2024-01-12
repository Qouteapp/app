import type { FC } from '../../../lib/teact/teact';
import { memo, useCallback, useRef } from '../../../lib/teact/teact';
import React from '../../../lib/teact/teactn';
import { getActions, withGlobal } from '../../../global';

import { UluOnboardingStep } from '../../../global/types';

import { selectOnboardingStep } from '../../../global/selectors/ulu/onboarding';

import useCurrentOrPrev from '../../../hooks/useCurrentOrPrev';
import useElectronDrag from '../../../hooks/useElectronDrag';
import useHistoryBack from '../../../hooks/useHistoryBack';

import Button from '../../ui/Button';
import Transition from '../../ui/Transition';
import Finish from './steps/Finish';
import FirstWorkspace from './steps/FirstWorkspace';
import FoldersRules from './steps/FoldersRules';
import FoldersStyle from './steps/FoldersStyle';
import Inbox from './steps/Inbox';
import SuperSearch from './steps/SuperSearch';

type StateProps = {
  onboardingStep: UluOnboardingStep;
};

const Onboarding: FC<StateProps> = ({
  onboardingStep,
}) => {
  const {
    goToOnboardingPreviousStep,
    goToOnboardingNextStep,
  } = getActions();

  const handleGoBack = useCallback(() => {
    goToOnboardingPreviousStep();
  }, [goToOnboardingPreviousStep]);

  const handleGoForth = useCallback(() => {
    goToOnboardingNextStep();
  }, [goToOnboardingNextStep]);

  useHistoryBack({
    isActive: true, // TODO,
    onBack: handleGoBack,
  });

  // eslint-disable-next-line no-null/no-null
  const containerRef = useRef<HTMLDivElement>(null);
  useElectronDrag(containerRef);

  // For animation purposes
  const renderingOnboardingState = useCurrentOrPrev(
    onboardingStep !== UluOnboardingStep.inbox ? onboardingStep : UluOnboardingStep.inbox,
    true,
  );

  const screen = (() => {
    switch (renderingOnboardingState) {
      case UluOnboardingStep.inbox:
        return <Inbox />;
      case UluOnboardingStep.foldersStyle:
        return <FoldersStyle />;
      case UluOnboardingStep.firstWorkspace:
        return <FirstWorkspace />;
      case UluOnboardingStep.foldersRules:
        return <FoldersRules />;
      case UluOnboardingStep.superSearch:
        return <SuperSearch />;
      case UluOnboardingStep.finish:
        return <Finish />;
      default:
        return undefined;
    }
  })();

  if (!screen) return undefined;

  return (
    <Transition activeKey={onboardingStep} name="fade" className="Auth" ref={containerRef}>
      <Button onClick={handleGoBack}>TODO GO BACK</Button>
      <Button onClick={handleGoForth}>TODO GO FORTH</Button>
      {screen}
    </Transition>
  );
};

export default memo(withGlobal(
  (global): StateProps => {
    return {
      onboardingStep: selectOnboardingStep(global),
    };
  },
)(Onboarding));
