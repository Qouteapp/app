/* eslint-disable no-async-without-await/no-async-without-await */
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { Chrono } from 'chrono-node';
import { Command } from 'cmdk';
import type { FC } from '../../../lib/teact/teact';

import captureKeyboardListeners from '../../../util/captureKeyboardListeners';

const customFilter = (value: string, search: string) => {
  return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
};

const format12HourTime = (date: Date) => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours %= 12;
  hours = hours || 12; // Если '0', то делаем '12'
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;

  return `${hours}:${minutesStr} ${ampm}`;
};

const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate()
    && date.getMonth() === today.getMonth()
    && date.getFullYear() === today.getFullYear()
  );
};

const isTomorrow = (date: Date) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate()
    && date.getMonth() === tomorrow.getMonth()
    && date.getFullYear() === tomorrow.getFullYear()
  );
};

const formatDate = (date: Date) => {
  if (isToday(date)) {
    return 'Today';
  }

  const months = [
    'January', 'February', 'March', 'April', 'May',
    'June', 'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  return `${day} ${months[monthIndex]} ${year}`;
};

const isTimeOnlyInput = (input: string) => {
  return /^\s*\d{1,2}\s*(am|pm)\s*$/i.test(input);
};

const adjustDateForNextWeekday = (date: Date, inputDay: string) => {
  const now = new Date();

  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDayIndex = now.getDay();
  const inputDayIndex = daysOfWeek.indexOf(inputDay.toLowerCase());

  if (inputDayIndex <= currentDayIndex) {
    // If the input day has already passed this week, set to next week
    const daysToAdd = 7 - currentDayIndex + inputDayIndex;
    date.setDate(now.getDate() + daysToAdd);
  } else {
    // Else, set to the same week
    date.setDate(now.getDate() + inputDayIndex - currentDayIndex);
  }
};

const isDayOfWeekInput = (input: string) => {
  return /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)(\s*\d{1,2}(am|pm))?$/i.test(input);
};

type ProcessInputArgs = {
  chrono: Chrono;
  inputValue: string;
  labelPrefix: string;
  onLabelsReady: (labels: string[], date: Date) => void;
};
const processInput = async ({
  chrono, inputValue, labelPrefix, onLabelsReady,
}: ProcessInputArgs) => {
  try {
    const now = new Date();

    const parsedResults = chrono.parse(inputValue, new Date());
    if (parsedResults.length > 0) {
      const date = parsedResults[0].start.date();

      if (isDayOfWeekInput(inputValue)) {
        const inputDay = inputValue.split(' ')[0];
        adjustDateForNextWeekday(date, inputDay);
      } else if (date < now) {
        if (isTimeOnlyInput(inputValue)) {
          // Установить на завтра, если введено только время и оно уже прошло
          date.setDate(now.getDate() + 1);
          date.setHours(date.getHours(), date.getMinutes(), 0, 0);
        } else {
          // Установить на следующий год, если дата (с годом) в прошлом
          date.setFullYear(now.getFullYear() + 1);
        }
      }

      const timeString = format12HourTime(date);
      const labels: string[] = [];
      if (isToday(date)) {
        labels.push(`${labelPrefix} ${timeString} Today`);
      } else if (isTomorrow(date)) {
        labels.push(`${labelPrefix} ${timeString} Tomorrow`);
      } else {
        const dateString = formatDate(date);
        labels.push(`${labelPrefix} ${timeString} on ${dateString}`);
      }

      onLabelsReady(labels, date);
    }
  } catch (error) {
    //
  }
};

export type OwnProps = {
  isOpen: boolean;
  setOpen: (value: boolean) => void;
  onClose: () => void;
  onSubmit: (date: Date) => void;
  onSendWhenOnline?: () => void;
  isReminder?: boolean;
};

type MenuItem = { label: string; value: string; date: Date | undefined };

const chrono = new Chrono();

const CommandMenuCalendarContent: FC<OwnProps> = ({
  isOpen, isReminder, onClose, onSubmit, onSendWhenOnline, setOpen,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const placeholderText = isReminder
    ? 'Remind me at... [Try: 8 am, 3 days, aug 7]' : 'Schedule at... [Try: 8 am, 3 days, aug 7]';
  const labelPrefix = isReminder ? 'Remind me at' : 'Schedule at';

  useEffect(() => {
    return isOpen ? captureKeyboardListeners({ onEsc: onClose }) : undefined;
  }, [isOpen, onClose]);

  const in10Minutes = useMemo(() => {
    const parsedResults = chrono.parse('In 10 minutes', new Date());
    if (parsedResults.length > 0) {
      return parsedResults[0].start.date();
    }
    return undefined;
  }, []);

  const in1Hour = useMemo(() => {
    const parsedResults = chrono.parse('In 1 hour', new Date());
    if (parsedResults.length > 0) {
      return parsedResults[0].start.date();
    }
    return undefined;
  }, []);

  const tomorrowAt9am = useMemo(() => {
    const parsedResults = chrono.parse('Tomorrow at 9am', new Date());
    if (parsedResults.length > 0) {
      return parsedResults[0].start.date();
    }
    return undefined;
  }, []);

  const mondayAt9am = useMemo(() => {
    const parsedResults = chrono.parse('Next monday at 9am', new Date());
    if (parsedResults.length > 0) {
      return parsedResults[0].start.date();
    }
    return undefined;
  }, []);

  const onLabelsReady = useCallback((labels: string[], date: Date) => {
    labels.forEach((label) => {
      if (!menuItems?.some((item) => item.label === label)) {
        const newItem = { label, date, value: inputValue };
        setMenuItems((prevItems) => [...(prevItems ?? []), newItem]);
      }
    });
  }, [inputValue, menuItems]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      processInput({
        chrono, inputValue, labelPrefix, onLabelsReady,
      });
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [inputValue, menuItems, labelPrefix, onLabelsReady]);

  const onValueChange = useCallback((value: string) => {
    setInputValue(value);
    setMenuItems([]);
  }, []);

  const handleSubmission = useCallback((date: Date) => {
    onSubmit(date); // Передаем date напрямую
    onClose(); // Вызов для закрытия меню
  }, [onSubmit, onClose]);

  const handleIn10Minutes = useCallback(() => {
    if (in10Minutes) {
      handleSubmission(in10Minutes);
    } else {
      // Обработка ошибки или альтернативное действие
    }
  }, [in10Minutes, handleSubmission]);

  const handleIn1Hour = useCallback(() => {
    if (in1Hour) {
      handleSubmission(in1Hour);
    } else {
      // Обработка ошибки или альтернативное действие
    }
  }, [in1Hour, handleSubmission]);

  const handleTomorrowAt9amSelect = useCallback(() => {
    if (tomorrowAt9am) {
      handleSubmission(tomorrowAt9am);
    } else {
      // Обработка ошибки или альтернативное действие
    }
  }, [tomorrowAt9am, handleSubmission]);

  const handleMondayAt9amSelect = useCallback(() => {
    if (mondayAt9am) {
      handleSubmission(mondayAt9am);
    } else {
      // Обработка ошибки или альтернативное действие
    }
  }, [mondayAt9am, handleSubmission]);

  return (
    <Command.Dialog
      label="Calendar Command Menu"
      open={isOpen}
      onOpenChange={setOpen}
      shouldFilter
      filter={customFilter}
      loop
    >
      <Command.Input placeholder={placeholderText} autoFocus onValueChange={onValueChange} />
      <Command.List>
        <Command.Empty>Can not parse data</Command.Empty>
        {menuItems?.map((item) => (
          <Command.Item
            key={`${inputValue} ${item.label}`}
            value={`${inputValue} ${item.label}`}
            // eslint-disable-next-line react/jsx-no-bind
            onSelect={() => item.date && handleSubmission(item.date)}
          >
            {item.label}
          </Command.Item>
        ))}
        <Command.Item onSelect={handleIn10Minutes}>
          In 10 minutes
        </Command.Item>
        <Command.Item onSelect={handleIn1Hour}>
          In 1 hour
        </Command.Item>
        <Command.Item onSelect={handleTomorrowAt9amSelect}>
          Tomorrow at 9 AM
        </Command.Item>
        <Command.Item onSelect={handleMondayAt9amSelect}>
          On Monday at 9 AM
        </Command.Item>
        {onSendWhenOnline && (
          <Command.Item onSelect={onSendWhenOnline}>
            Send when online
          </Command.Item>
        )}
      </Command.List>
    </Command.Dialog>
  );
};

export default CommandMenuCalendarContent;
