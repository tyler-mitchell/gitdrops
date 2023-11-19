import { defineQualifierPreset } from "@/modules/github/search-query.helpers";
import { timeQualifierOptions } from "./date.options";

export const dateQualifierPreset = defineQualifierPreset(() => ({
  Icon: () => <span>🗓️</span>,
  width: "200px",
  defaultValue: timeQualifierOptions.defaultOption.qualifierValue,
  options: timeQualifierOptions.options,
  inputProps: {
    placeholder: "Select Time Period...",
  },
  listProps: {
    emptyLabel: "No Time Period found.",
  },
  listItemProps: {
    showIcon: false,
  },
}));
