/* eslint-disable @typescript-eslint/no-explicit-any */
import { TimeDurationType, getTimeRange } from "@/lib/date-utils";
import type {
  Qualifier,
  QualifierConfig,
  QualifierOption,
  QualifierOptionGroup,
} from "./search-query.types";
import { format, sub } from "date-fns";
import {
  QualifierOptionMapEntry,
  QualifierOptions,
  QualifierOptionMap,
  ResolvedQualifierConfig,
} from "@/modules/github/search-query.types";
import { notEmpty } from "@/lib/utils";
import { scope } from "arktype";
import { O } from "ts-toolbelt";
import { defu } from "defu";

export function numberFormat(num?: number | null) {
  if (!num) return undefined;
  return new Intl.NumberFormat().format(num);
}

const timeDefinitionSechema = scope({
  _duration: "'days' | 'weeks' | 'months' | 'years'",
  _operator: "'>' | '>=' | '<' | '<=' | '='",
  relativeTimeDefinition: ["_operator", "number", "_duration"],
}).compile();

export type TimeDefinition =
  typeof timeDefinitionSechema.relativeTimeDefinition.infer;

export function parseTimeDefinition(option: TimeDefinition) {
  const { relativeTimeDefinition } = timeDefinitionSechema;

  const { data, problems } = relativeTimeDefinition(option);

  if (problems) {
    throw problems.throw();
  }

  const [operator, count, duration] = data;

  const op = operator === "=" ? "" : operator;

  return { qualifierValue: `${op}${formatTimeAgo(count, duration)}` };
}

function formatTimeAgo(count: number, duration: TimeDurationType) {
  const now = new Date();
  const ago = sub(now, { [duration]: count });
  return githubDateFormat(ago);
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
  return `${githubDateFormat(startDate)}..${githubDateFormat(endDate)}`;
}

export function githubDateFormat(date: Date) {
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

export function defineQualifierPreset<
  R extends Omit<QualifierConfig, "qualifier">,
  T extends (opts?: any) => R,
  P extends T extends (opts: infer P) => R ? P : never
>(config: T) {
  return <TOverride extends O.Required<Partial<QualifierConfig>, "qualifier">>(
    overrides: TOverride & P
  ) =>
    defineQualifier(
      defu(overrides, config(overrides)) as never as O.Merge<R, TOverride>
    );
}

export function defineQualifier<T extends QualifierConfig>(config: T) {
  const { options, optionGroups, listItemProps, defaultValue } = config;

  const optionData = getOptionMap({
    options,
    optionGroups,
  });

  return {
    ...config,
    value: defaultValue,
    listItemProps: {
      showIcon: optionData.defaultShowOptionIcons,
      ...listItemProps,
    },
    ...optionData,
  } as ResolvedQualifierConfig;
}

function getOptionMap({
  options,
  optionGroups,
}: Omit<QualifierOptions, "optionMap">): {
  defaultShowOptionIcons: boolean;
  optionMap: QualifierOptionMap;
  allOptions: QualifierOption[];
  allOptionGroups: QualifierOptionGroup[];
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

  const optionMap = new Map([...optionEntries, ...optionGroupEntries]);

  const allOptions = Array.from(optionMap.values());

  const allOptionGroups: QualifierOptionGroup[] = [
    {
      isPrimary: true,
      groupId: "options",
      groupLabel: "",
      options,
      showIcons: defaultShowOptionIcons,
    },
    ...(optionGroups ?? []),
  ];

  return {
    defaultShowOptionIcons,
    optionMap,
    allOptions,
    allOptionGroups,
  };
}
