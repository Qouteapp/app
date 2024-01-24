import type { FC } from '../../../lib/teact/teact';
import { memo, useCallback, useRef } from '../../../lib/teact/teact';
import React from '../../../lib/teact/teactn';
import { getActions, withGlobal } from '../../../global';

import { UluOnboardingStep } from '../../../global/types';

import { selectIsWorkspaceSettingsOpen, selectWorkspaceSettingsId } from '../../../global/selectors';
import { selectOnboardingStep } from '../../../global/selectors/ulu/onboarding';
import { getOnboardingStepsCount } from '../../../global/ulu/onboarding';
import buildClassName from '../../../util/buildClassName';
import Header from './util/Header';
import StepsSlider from './util/StepsSlider';

import useCurrentOrPrev from '../../../hooks/useCurrentOrPrev';
import useElectronDrag from '../../../hooks/useElectronDrag';
import useHistoryBack from '../../../hooks/useHistoryBack';

import ConfettiContainer from '../../main/ConfettiContainer';
import Transition from '../../ui/Transition';
import CommandMenuDemo from './components/CommandMenuDemo/CommandMenuDemo';
import CreateWorkspace from './steps/CreateWorkspace';
import Finish from './steps/Finish';
// import FoldersRules from './steps/FoldersRules';
import FoldersStyle from './steps/FoldersStyle';
import Inbox from './steps/Inbox';
import SuperSearch from './steps/SuperSearch';

import styles from './Onboarding.module.scss';

type StateProps = {
  onboardingStep: UluOnboardingStep;
  workspaceSettingsId: string | undefined;
  isWorkspaceSettingsOpen: boolean;
};

const Onboarding: FC<StateProps> = ({ onboardingStep }) => {
  const {
    goToOnboardingPreviousStep, goToOnboardingNextStep,
  } = getActions();

  const handleGoBack = useCallback(() => {
    goToOnboardingPreviousStep();
  }, [goToOnboardingPreviousStep]);

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
        return <CreateWorkspace />;
      // case UluOnboardingStep.foldersRules:
      //   return <FoldersRules />;
      case UluOnboardingStep.superSearch:
        return <SuperSearch />;
      case UluOnboardingStep.finish:
        return <Finish />;
      default:
        return undefined;
    }
  })();

  const classNameWrapper = buildClassName(styles.wrapper, styles.grid);
  const classNameScreen = buildClassName(styles.screenWrapper, styles.gridScreen, 'custom-scroll');
  const classNameSlider = buildClassName(styles.slider, styles.gridSlider);

  if (!screen) return undefined;

  return (
    <Transition activeKey={onboardingStep} name="fade" className="Onboarding" ref={containerRef}>
      <div className={classNameWrapper}>
        <Header onboardingStep={onboardingStep} className={styles.header} />
        <div className={classNameScreen}>
          {screen}
        </div>
        <StepsSlider
          className={classNameSlider}
          activeStep={onboardingStep - 1}
          stepsCount={getOnboardingStepsCount()}
        />
      </div>
      <CommandMenuDemo onSelect={goToOnboardingNextStep} />
      <ConfettiContainer />
    </Transition>
  );
};

export default memo(withGlobal(
  (global): StateProps => {
    return {
      onboardingStep: selectOnboardingStep(global),
      workspaceSettingsId: selectWorkspaceSettingsId(global),
      isWorkspaceSettingsOpen: selectIsWorkspaceSettingsOpen(global),
    };
  },
)(Onboarding));
