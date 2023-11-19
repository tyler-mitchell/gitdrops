import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  formatDistanceToNow,
  isValid,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  sub,
} from "date-fns";

export type TimeDurationType = "days" | "weeks" | "months" | "years";

export function now() {
  return new Date();
}

export function timeAgo(dateString?: string | null) {
  const date = new Date(dateString ?? "");
  if (!isValid(date)) return undefined;

  return formatDistanceToNow(date, { addSuffix: true });
}

export function getTimeRange(ago: number, type: TimeDurationType) {
  const { startFn, endFn } = timeDurationFns[type];
  const startDate = startFn(sub(now(), { [type]: ago }));
  const endDate = endFn(sub(now(), { [type]: ago }));

  return { startDate, endDate };
}

const timeDurationFns = {
  days: {
    startFn: startOfDay,
    endFn: endOfDay,
  },
  weeks: {
    startFn: startOfWeek,
    endFn: endOfWeek,
  },
  months: {
    startFn: startOfMonth,
    endFn: endOfMonth,
  },
  years: {
    startFn: startOfYear,
    endFn: endOfYear,
  },
};
