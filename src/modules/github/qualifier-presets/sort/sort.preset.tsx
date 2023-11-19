import { defineQualifierPreset } from "@/modules/github/search-query.helpers";

export const sortQualifierPreset = defineQualifierPreset(() => ({
  required: false,

  Icon: () => <span className="i-lucide-arrow-up-down" />,
  defaultValue: "",
  width: "200px",
  inputProps: {
    placeholder: "Sort",
    showIcon: true,
  },
  listItemProps: {
    showIcon: true,
  },
  listProps: {
    emptyLabel: "No Time Period found.",
  },
  options: [],
}));
