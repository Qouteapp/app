import type { FC } from '../../../../lib/teact/teact';
import React from '../../../../lib/teact/teact';

import useLang from '../../../../hooks/useLang';

import SvgFinish from './SvgFinish';

import styles from './Finish.module.scss';

const Finish: FC = () => {
  const lang = useLang();

  return (
    <div className={styles.wrapper}>
      <SvgFinish />
      <div className={styles.title}>{lang('OnboardingFinishTitle')}</div>
    </div>
  );
};

export default Finish;
