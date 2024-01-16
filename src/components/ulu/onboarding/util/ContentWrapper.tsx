import type { FC, TeactNode } from '../../../../lib/teact/teact';
import React from '../../../../lib/teact/teact';

import styles from './ContentWrapper.module.scss';

type OwnProps = {
  children: TeactNode;
  subtitle: string;
};

const ContentWrapper: FC<OwnProps> = ({ children, subtitle }) => {
  const wrappedChildren = Array.isArray(children)
    ? <div className={styles.options}>{children}</div>
    : children;

  return (
    <div className={styles.wrapper}>
      {wrappedChildren}
      <div>
        {subtitle && (<div className={styles.subtitle}>{subtitle}</div>)}
      </div>
    </div>
  );
};

export default ContentWrapper;
