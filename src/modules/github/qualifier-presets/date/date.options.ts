import { QualifierOption } from "@/modules/github/search-query.types";
import {
  TimeDefinition,
  parseTimeDefinition,
} from "@/modules/github/search-query.helpers";

export const timeQualifierOptions = defineTimeOptions([
  {
    label: "All time",
    timeDefinition: [">", 50, "years"],
  },
  {
    label: "Past day",
    timeDefinition: [">", 1, "days"],
  },
  {
    label: "Past week",
    timeDefinition: [">", 1, "weeks"],
  },
  {
    label: "Past 2 weeks",
    timeDefinition: [">", 2, "weeks"],
  },
  {
    isDefault: true,
    label: "Past month",
    timeDefinition: [">", 1, "months"],
  },
  {
    label: "Past 2 months",
    timeDefinition: [">", 2, "months"],
  },
  {
    label: "Past 4 months",
    timeDefinition: [">", 4, "months"],
  },
  {
    label: "Past 6 months",
    timeDefinition: [">", 6, "months"],
  },
  {
    label: "Past year",
    timeDefinition: [">", 1, "years"],
  },
  {
    label: "Past 2 years",
    timeDefinition: [">", 2, "years"],
  },
  {
    label: "Past 3 years",
    timeDefinition: [">", 3, "years"],
  },
  {
    label: "Past 4 years",
    timeDefinition: [">", 4, "years"],
  },
  {
    label: "Past 5 years",
    timeDefinition: [">", 5, "years"],
  },
]);

type TimeOption = Omit<QualifierOption, "qualifierValue"> & {
  timeDefinition: TimeDefinition;
  isDefault?: boolean;
};

function defineTimeOptions(options: TimeOption[]): {
  defaultOption: QualifierOption;
  options: QualifierOption[];
} {
  const timeQualifierOptions = options.map(({ timeDefinition, ...rest }) => ({
    ...rest,
    qualifierValue: parseTimeDefinition(timeDefinition).qualifierValue,
  }));

  const defaultIndex =
    options.findIndex((option) => option.isDefault) ?? options[0];

  return {
    defaultOption: timeQualifierOptions[defaultIndex]!,
    options: timeQualifierOptions,
  };
}
