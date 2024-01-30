import type { FC } from '../../../../lib/teact/teact';
import React, { memo } from '../../../../lib/teact/teact';

import styles from './SuperSearchButton.module.scss';

type OwnProps = {
  text: string;
};

const SuperSearchButton: FC<OwnProps> = ({ text }) => {
  return (
    <div className={styles.outer}>
      <div className={styles.inner}>
        <span className={styles.text}>{ text }</span>
      </div>
    </div>
  );
};

export default memo(SuperSearchButton);
