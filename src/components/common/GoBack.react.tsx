import React, { memo } from 'react';
import type { FC } from '../../lib/teact/teact';

import buildClassName from '../../util/buildClassName';

import styles from './GoBack.module.scss';

type OwnProps = {
  className?: string;
  onClick: () => void;
};

const GoBack: FC<OwnProps> = ({ className, onClick }) => {
  return (
    <span className={buildClassName(styles.wrapper, className)}>
      <div className={styles.iconWrapper}>
        <i className={`${styles.icon} icon icon-arrow-left`} onClick={onClick} />
      </div>
    </span>
  );
};

export default memo(GoBack);
