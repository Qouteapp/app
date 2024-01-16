import type { FC } from '../../../../lib/teact/teact';
import React, { memo } from '../../../../lib/teact/teact';

type OwnProps = {
  color: string;
};

const SvgFoldersStyleTelegram: FC<OwnProps> = ({ color }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="134" height="24" viewBox="0 0 134 24" fill="none">
      <rect x="0.5" width="48" height="24" rx="12" fill={color} fill-opacity="0.24" />
      <rect x="8.5" y="8" width="32" height="8" rx="4" fill={color} />
      <rect x="60.5" y="8" width="24" height="8" rx="4" fill={color} fill-opacity="0.24" />
      <rect x="104.5" y="8" width="21" height="8" rx="4" fill={color} fill-opacity="0.24" />
    </svg>
  );
};

export default memo(SvgFoldersStyleTelegram);
