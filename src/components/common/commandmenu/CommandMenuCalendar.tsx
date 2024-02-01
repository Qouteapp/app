/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { createRoot } from 'react-dom/client';

import type { OwnProps } from './CommandMenuCalendarContent';

import CommandMenuCalendarContent from './CommandMenuCalendarContent';

import './CommandMenu.scss';

const calendarElement = document.getElementById('calendar-root');
const calendarRoot = createRoot(calendarElement!);

const CommandMenuCalendar = (props : OwnProps) => {
  calendarRoot.render(<CommandMenuCalendarContent {...props} />);

  return undefined;
};

export default CommandMenuCalendar;
