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
import { UnFreezedObject } from "structurajs";
import debounce from "lodash.debounce";
import { GithubRepoCardProps } from "@/modules/github/GithubRepoCard";
import { PageInfo } from "@/modules/gql";
const qualifierConfig = defineQualifierConfig({
  language: {
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

export type PaginationInfo = PageInfo & { totalCount?: number };

type Context = {
  githubQueryString: string;
  qualifierConfig: typeof qualifierConfig;
  searchInput: string;
  loading: boolean;
  items: GithubRepoCardProps[];
  totalCount?: number;
  paginationInfo?: PaginationInfo;
  rate: number;
  rateLimitReached: boolean;
};

const RATE_LIMIT = 50;

const initial: Context = {
  githubQueryString: initialGithubQueryString,
  qualifierConfig,
  searchInput: "",
  loading: false,
  items: [],
  rate: 0,
  rateLimitReached: false,
};

export const { useContext: useQualifierContext, Provider: QualifierProvider } =
  createLocalState({
    initial,
    reducers: {
      setLoading(state, { payload }: PayloadAction<boolean>) {
        state.loading = payload;
      },
      incrementRateLimit(state) {
        if (state.rate < RATE_LIMIT) {
          state.rate += 1;
        } else {
          state.rateLimitReached = true;
        }
      },
      updateSearchResult(
        state,
        { payload }: PayloadAction<Pick<Context, "items" | "paginationInfo">>
      ) {
        state.items = [...state.items, ...payload.items];
      },

      setPaginationInfo(
        state,
        { payload }: PayloadAction<PaginationInfo | undefined>
      ) {
        state.paginationInfo = payload;
      },
      setSearchInput(state, { payload }: PayloadAction<string>) {
        state.searchInput = payload;

        updateGithubQueryString(state);
      },
      setQualifierValue(
        state,
        action: PayloadAction<{ qualifier: QualifierFilterId; value: string }>
      ) {
        const { qualifier, value } = action.payload;

        state.qualifierConfig[qualifier].value = value;

        updateGithubQueryString(state);
      },
    },
    // subscribers: {
    //   onQueryStringChange: {
    //     listenTo: "githubQueryString",
    //     onChange: (_, { state }) => {
    //       state.items = [];
    //     },
    //   },
    // },
  });

function updateGithubQueryString(
  state: UnFreezedObject<Context>,
  options?: { wait?: 300 }
) {
  const { wait = 1000 } = options ?? {};

  debounce(
    () => {
      state.githubQueryString = getGithubQueryString(
        state.qualifierConfig as ResolvedQualifierConfigMap,
        state.searchInput
      );
    },
    wait,
    { leading: true }
  )();
}

export function getInitialQualifierSelections(
  config: ResolvedQualifierConfigMap
) {
  return Object.fromEntries(
    collect(config, (_, v) => {
      return [v.qualifier, v.defaultValue] as [QualifierId, string];
    })
  );
}

function getGithubQueryString(
  qualifierConfig: ResolvedQualifierConfigMap,
  search?: string
) {
  const result = collect(
    qualifierConfig,
    (_, { qualifier, defaultValue, value }) => {
      const v = value ?? defaultValue;

      if (!v) return undefined;

      return { qualifier, value: v };
    }
  );

  const qualifiers = result.filter(notEmpty);

  return buildGithubSearchQueryString(qualifiers, search);
}
