import type { FC } from '../../../../lib/teact/teact';
import React, { memo } from '../../../../lib/teact/teact';

type OwnProps = {
  color: string;
};

const SvgFoldersStyleSlack: FC<OwnProps> = ({ color }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="93" height="72" viewBox="0 0 93 72" fill="none">
      <rect x="15.5" width="50" height="8" rx="4" fill={color} />
      <rect x="33.5" y="12" width="59" height="8" rx="4" fill={color} fill-opacity="0.24" />
      <rect x="23.5" y="12" width="8" height="8" rx="4" fill={color} fill-opacity="0.24" />
      <rect x="33.5" y="24" width="33" height="8" rx="4" fill={color} fill-opacity="0.24" />
      <rect x="23.5" y="24" width="8" height="8" rx="4" fill={color} fill-opacity="0.24" />
      <path d="M6.37416 7.42652C5.99315 8.11233 5.00685 8.11233 4.62584 7.42652L1.32536 1.48564C0.955063 0.819113 1.43703 1.61364e-07 2.19951 2.28023e-07L8.80049 8.05098e-07C9.56297 8.71757e-07 10.0449 0.819113 9.67464 1.48564L6.37416 7.42652Z" fill={color} />
      <rect x="15.5" y="40" width="30" height="8" rx="4" fill={color} />
      <rect x="33.5" y="52" width="27" height="8" rx="4" fill={color} fill-opacity="0.24" />
      <rect x="23.5" y="52" width="8" height="8" rx="4" fill={color} fill-opacity="0.24" />
      <rect x="23.5" y="64" width="8" height="8" rx="4" fill={color} fill-opacity="0.24" />
      <rect x="33.5" y="64" width="18" height="8" rx="4" fill={color} fill-opacity="0.24" />
      <path d="M6.37416 47.4265C5.99315 48.1123 5.00685 48.1123 4.62584 47.4265L1.32536 41.4856C0.955063 40.8191 1.43703 40 2.19951 40L8.80049 40C9.56297 40 10.0449 40.8191 9.67464 41.4856L6.37416 47.4265Z" fill={color} />
    </svg>
  );
};

export default memo(SvgFoldersStyleSlack);
