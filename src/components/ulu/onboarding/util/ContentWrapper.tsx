import type { FC, TeactNode } from '../../../../lib/teact/teact';
import React from '../../../../lib/teact/teact';

import styles from './ContentWrapper.module.scss';

type OwnProps = {
  children: TeactNode;
  subtitle?: string;
};

const ContentWrapper: FC<OwnProps> = ({ children, subtitle }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <div className={styles.children}>{children}</div>
        <div className={styles.info}>
          {subtitle && (<div className={styles.subtitle}>{subtitle}</div>)}
        </div>
      </div>
    </div>
  );
};

export default ContentWrapper;
