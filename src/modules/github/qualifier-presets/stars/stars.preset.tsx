import {
  defineQualifierPreset,
  numberFormat,
} from "@/modules/github/search-query.helpers";
import { map } from "lodash-es";

export const starsQualifierPreset = defineQualifierPreset(() => ({
  required: false,
  defaultValue: ">25",
  width: "200px",
  Icon: () => <span>⭐️</span>,
  inputProps: {
    placeholder: "Min Stars",
    showIcon: true,
  },
  listItemProps: {
    showIcon: true,
  },
  listProps: {
    emptyLabel: "No Time Period found.",
  },
  get options() {
    const filters = {
      ">": [10, 25, 50, 100, 200, 500, 1000, 2000],
    };

    const stars = map(filters, (arr, operator) =>
      arr.map((count) => ({ count, operator }))
    ).flat();

    return stars.map(({ count, operator }) => {
      const qualifierValue = `${operator}${count}`;

      return {
        qualifierValue,

        label: (
          <span className="flex gap-1.5 font-mono">
            {">"}
            <span className="">{`${numberFormat(count)}`}</span> stars
          </span>
        ),
      };
    });
  },
}));
