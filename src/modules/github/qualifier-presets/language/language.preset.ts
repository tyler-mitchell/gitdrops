import { defineQualifierPreset } from "@/modules/github/search-query.helpers";
import { languageQualifierOptions } from "./language.options";

export const languageQualifierPreset = defineQualifierPreset(() => ({
  qualifier: "language",
  defaultValue: "typescript",
  required: true,
  inputProps: {
    showIcon: true,
    placeholder: "Select language...",
  },
  listItemProps: {
    showIcon: true,
  },
  listProps: {
    emptyLabel: "No language found.",
  },
  searchProps: {
    searchable: true,
    placeholder: "Search language...",
  },
  ...languageQualifierOptions,
}));
