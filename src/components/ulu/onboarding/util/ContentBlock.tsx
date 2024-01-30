import type { FC, TeactNode } from '../../../../lib/teact/teact';
import React from '../../../../lib/teact/teact';

import buildClassName from '../../../../util/buildClassName';

import styles from './ContentBlock.module.scss';

type OwnProps = {
  children: TeactNode;
  active: boolean;
  title?: string;
  subtitle?: string;
  onClick?: () => void;
};

const ContentBlock: FC<OwnProps> = ({
  children, active, title, subtitle, onClick,
}) => {
  const classNameWrapper = buildClassName(styles.wrapper, active && styles.active);

  const shouldRenderInfo = Boolean(title || subtitle);

  return (
    <div className={classNameWrapper} onClick={onClick}>
      <div className={styles.children}>
        {children}
      </div>
      {shouldRenderInfo && (
        <div className={styles.info}>
          {title && (<div className={styles.title}>{title}</div>)}
          {subtitle && (<div className={styles.subtitle}>{subtitle}</div>)}
        </div>
      )}
    </div>
  );
};

export default ContentBlock;
