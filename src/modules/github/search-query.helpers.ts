import { TimeDurationType, getTimeRange } from "@/lib/date-utils";
import type {
  Qualifier,
  ResolvedQualifierConfigMap,
} from "./search-query.types";
import { format } from "date-fns";
import {
  QualifierOptionMapEntry,
  QualifierOptions,
  QualifierOptionMap,
  QualifierConfigMap,
  ResolvedQualifierConfig,
} from "@/modules/github/search-query.types";
import { map as mapRecord } from "@effect/data/ReadonlyRecord";
import { notEmpty } from "@/lib/utils";

export function numberFormat(num?: number | null) {
  if (!num) return undefined;
  return new Intl.NumberFormat().format(num);
}

export function timeRangeQualifierValue(ago: number, type: TimeDurationType) {
  const { startDate, endDate } = getTimeRange(ago, type);
  return githubTimeRangeFormat({ startDate, endDate });
}

function githubTimeRangeFormat({
  startDate,
  endDate,
}: {
  startDate: Date;
  endDate: Date;
}) {
  return `${githubSearchDateFormat(startDate)}..${githubSearchDateFormat(
    endDate
  )}`;
}

export function githubSearchDateFormat(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function qualifierString({ qualifier, value }: Qualifier) {
  return `${qualifier}:${value}`;
}

export function buildGithubSearchQueryString(
  qualifiers: Qualifier[],
  search?: string
) {
  return [search, ...qualifiers.map((e) => qualifierString(e))]
    .filter(notEmpty)
    .join(" ");
}

export function defineQualifierConfig<T extends QualifierConfigMap>(config: T) {
  const resolvedQualifiers = mapRecord(config, (v) => {
    const { options, optionGroups, listItemProps, defaultValue } = v;

    const { optionMap, defaultShowOptionIcons } = getOptionMap({
      options,
      optionGroups,
    });

    return {
      ...v,
      value: defaultValue,
      listItemProps: { showIcon: defaultShowOptionIcons, ...listItemProps },
      optionMap,
    } as ResolvedQualifierConfig;
  });

  return resolvedQualifiers as ResolvedQualifierConfigMap;
}

function getOptionMap({
  options,
  optionGroups,
}: Omit<QualifierOptions, "optionMap">): {
  defaultShowOptionIcons: boolean;
  optionMap: QualifierOptionMap;
} {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let defaultShowOptionIcons: boolean = false;

  const optionEntries =
    options?.map((e) => {
      if (e.iconClassName) {
        defaultShowOptionIcons = true;
      }

      return [e.qualifierValue, e] as QualifierOptionMapEntry;
    }) ?? [];

  const optionGroupEntries =
    optionGroups?.flatMap((e) =>
      e.options.map((e) => [e.qualifierValue, e] as QualifierOptionMapEntry)
    ) ?? [];

  return {
    defaultShowOptionIcons,
    optionMap: new Map([...optionEntries, ...optionGroupEntries]),
  };
}
