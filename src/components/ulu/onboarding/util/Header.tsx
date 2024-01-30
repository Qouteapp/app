import type { FC } from '../../../../lib/teact/teact';
import React, { memo } from '../../../../lib/teact/teact';
import { getActions } from '../../../../global';

import { getOnboardingFirstStep, getOnboardingLastStep } from '../../../../global/ulu/onboarding';
import buildClassName from '../../../../util/buildClassName';

import GoBack from '../../../common/GoBack';
import UluHeaderProfile from '../../../left/main/UluHeaderProfile';

import styles from './Header.module.scss';

type OwnProps = {
  className?: string;
  onboardingStep: number;
};

const Header: FC<OwnProps> = ({ className, onboardingStep }) => {
  const { goToOnboardingPreviousStep } = getActions();

  const shouldRenderGoBack = (
    onboardingStep !== getOnboardingFirstStep()
    && onboardingStep !== getOnboardingLastStep()
  );

  return (
    <div className={buildClassName(styles.wrapper, className)}>
      { shouldRenderGoBack ? <GoBack onClick={goToOnboardingPreviousStep} /> : <div /> }
      <UluHeaderProfile classNameUserName={styles.username} isPersonalWorkspace />
    </div>
  );
};

export default memo(Header);
