import { createLocalState, type PayloadAction } from "@/lib/createLocalState";
import {
  buildGithubSearchQueryString,
  defineQualifierConfig,
  numberFormat,
} from "./search-query.helpers";
import type {
  QualifierFilterId,
  QualifierId,
  ResolvedQualifierConfigMap,
} from "./search-query.types";
import {
  getLanguageOptions,
  timePresetOptions,
} from "@/modules/github/search-query.constant";
import { collect } from "@effect/data/ReadonlyRecord";
import { notEmpty } from "@/lib/utils";

const qualifierConfig = defineQualifierConfig({
  language: {
    qualifier: "language",
    defaultValue: "typescript",
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
    ...getLanguageOptions(),
  },
  created: {
    qualifier: "created",
    // required: true,
    defaultValue: timePresetOptions[2].qualifierValue,
    options: timePresetOptions,
    inputProps: {
      placeholder: "Select Time Period...",
    },
    listProps: {
      emptyLabel: "No Time Period found.",
    },
  },
  minStars: {
    required: true,
    qualifier: "stars",
    defaultValue: ">25",
    width: "200px",
    inputProps: {
      placeholder: "⭐️ Min Stars ...",
    },
    listItemProps: {
      // showIcon: true,
    },
    listProps: {
      emptyLabel: "No Time Period found.",
    },
    options: [10, 25, 50, 100, 200, 500, 1000, 2000].map((stars) => {
      const qualifierValue = `>${stars}`;
      return {
        qualifierValue,
        label: (
          <span className="flex items-center gap-4 font-mono">
            <span>⭐️</span>
            <span className="flex gap-1.5">
              {">"}
              <span className="">{`${numberFormat(stars)}`}</span> stars
            </span>
          </span>
        ),
      };
    }),
  },
});

const initialGithubQueryString = getGithubQueryString(qualifierConfig);

export const { useContext: useQualifierContext, Provider: QualifierProvider } =
  createLocalState({
    initial: {
      githubQueryString: initialGithubQueryString,
      qualifierConfig,
    },
    reducers: {
      setQualifierValue(
        state,
        action: PayloadAction<{ qualifier: QualifierFilterId; value: string }>
      ) {
        const { qualifier, value } = action.payload;

        state.qualifierConfig[qualifier].value = value;

        state.githubQueryString = getGithubQueryString(
          state.qualifierConfig as ResolvedQualifierConfigMap
        );
      },
    },
  });

export function getInitialQualifierSelections(
  config: ResolvedQualifierConfigMap
) {
  return Object.fromEntries(
    collect(config, (_, v) => {
      return [v.qualifier, v.defaultValue] as [QualifierId, string];
    })
  );
}

function getGithubQueryString(qualifierConfig: ResolvedQualifierConfigMap) {
  const result = collect(
    qualifierConfig,
    (_, { qualifier, defaultValue, value }) => {
      const v = value ?? defaultValue;

      if (!v) return undefined;

      return { qualifier, value: v };
    }
  );

  const qualifiers = result.filter(notEmpty);

  return buildGithubSearchQueryString(qualifiers);
}
