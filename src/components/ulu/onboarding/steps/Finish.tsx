import type { FC } from '../../../../lib/teact/teact';
import React, { useEffect, useState } from '../../../../lib/teact/teact';
import { getActions } from '../../../../global';

import buildClassName from '../../../../util/buildClassName';

import useLang from '../../../../hooks/useLang';

import SvgFinish from './SvgFinish';

import styles from './Finish.module.scss';

const CONFETTI_SINGLE_SHOT_TIMEOUT = 3000; // empirically determined, may need to be adjusted
const CLOSE_ONBOARDING_TIMEOUT = CONFETTI_SINGLE_SHOT_TIMEOUT + 500;
const INVISIBLE_CONFETTI = {
  top: -10000, left: -10000, width: -10000, height: -10000,
};

const Finish: FC = () => {
  const lang = useLang();

  const { completeOnboarding, requestConfetti } = getActions();
  const [shouldFade, setShouldFade] = useState(false);

  useEffect(() => {
    requestConfetti({});
    setTimeout(() => setShouldFade(true), CONFETTI_SINGLE_SHOT_TIMEOUT);
    setTimeout(() => {
      requestConfetti(INVISIBLE_CONFETTI);
      completeOnboarding();
    }, CLOSE_ONBOARDING_TIMEOUT);
  }, []);

  return (
    <div className={buildClassName(styles.wrapper, shouldFade && styles.fade)}>
      <SvgFinish />
      <div className={styles.title}>{lang('OnboardingFinishTitle')}</div>
    </div>
  );
};

export default Finish;
