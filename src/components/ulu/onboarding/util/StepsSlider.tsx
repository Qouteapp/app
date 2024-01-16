import type { FC } from '../../../../lib/teact/teact';
import React from '../../../../lib/teact/teact';

import buildClassName from '../../../../util/buildClassName';

import styles from './StepsSlider.module.scss';

type OwnProps = {
  className?: string;
  activeStep: number;
  stepsCount: number;
};

const StepsSlider: FC<OwnProps> = ({ className, activeStep, stepsCount }) => {
  return (
    <div className={buildClassName(styles.wrapper, className)}>
      <div className={styles.container}>
        {Array.from({ length: stepsCount }, (_, i) => (
          <div
            className={buildClassName(styles.item, activeStep === i && styles.active)}
          />
        ))}
      </div>
    </div>
  );
};

export default StepsSlider;
