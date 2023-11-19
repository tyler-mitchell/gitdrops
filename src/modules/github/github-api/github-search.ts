/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  resolve,
  SearchType,
  SearchResultItemConnection,
  PageInfo,
  MakeOptional,
  Maybe,
} from "@/modules/gql";
import { githubRepoCardListSelector } from "@/modules/github/selectors";
import { GithubRepoCardProps } from "@/modules/github/GithubRepoCard";
import { signal } from "@preact/signals";
import { useInfiniteQuery } from "@tanstack/react-query";
import { store } from "@/store";
import { QueryVariables } from "@/modules/gql/gql-types";
import { O, A } from "ts-toolbelt";
import { IsEnum } from "@/types/is-enum";
import { OmitNever } from "@/types/type-utils";
import type * as GqlTypes from "@/modules/gql";

type GqlTypeModules = typeof import("@/modules/gql");

type GithubEnumsMap<T = typeof GqlTypes> = OmitNever<{
  readonly [K in keyof T]: T[K];
}>;

type G = GithubEnumsMap;

type SearchQueryVaribles = QueryVariables<"search">;

type SearchQueryVaribles = {
  after?: Maybe<string> | undefined;
  before?: Maybe<string> | undefined;
  first?: Maybe<number> | undefined;
  last?: Maybe<number> | undefined;
  query: string;
  type: SearchType; // is an enum
};

type StringifyEnums<T> = OmitNever<{
  [K in keyof T]: IsEnum<T[K]> extends true ? keyof T[K] : never;
}>;

type G = StringifyEnums<QueryVariables<"search">>;

type ValueOf<T> = T[keyof T];

type A = SearchQueryVaribles["type"];

type GithubSearchVariables = O.Overwrite<
  SearchQueryVaribles,
  {
    type: keyof typeof SearchType;
  }
>;

function getGithubSearchVariables({
  type,
  first = 20,
  ...variables
}: GithubSearchVariables): QueryVariables<"search"> {
  return {
    ...variables,
    first,
    type: SearchType[type],
  };
}

const searchTypeCountVariables: Record<
  keyof typeof SearchType,
  SearchCountVariableName
> = {
  REPOSITORY: "repositoryCount",
  DISCUSSION: "discussionCount",
  ISSUE: "issueCount",
  USER: "userCount",
};

function fetchSearchResults(
  variables: GithubSearchVariables,
  prevResult?: SearchResults
) {
  return resolve(({ query: gqlQuery }) => {
    const result = gqlQuery.search(getGithubSearchVariables(variables));

    const allItems = [
      ...(prevResult?.items ?? []),
      ...githubRepoCardListSelector(result),
    ];

    const { pageInfo } = result;

    const count = result[searchTypeCountVariables[variables.type]];

    return {
      items: allItems,
      count: count,
      pageInfo: {
        hasNextPage: pageInfo?.hasNextPage,
        endCursor: pageInfo?.endCursor,
        hasPreviousPage: pageInfo?.hasPreviousPage,
        startCursor: pageInfo?.startCursor,
      },
    };
  });
}

type SearchCountVariableName<
  K extends keyof SearchResultItemConnection = keyof SearchResultItemConnection
> = K extends `${string}Count` ? K : never;

type SearchResults = {
  items: GithubRepoCardProps[];
  pageInfo?: PageInfo;
  count?: number;
};

type UseListPaginationParams = {
  fetchNextPage?: (pageInfo: PageInfo) => void;
  isFetchingNextPage?: boolean;
};

export function useSearchResults({
  variables,
}: {
  variables: MakeOptional<GithubSearchVariables, "">;
}) {
  const { data } = useInfiniteQuery({
    queryKey: ["github-search", variables],
    queryFn: ({ pageParam }) =>
      fetchSearchResults({ ...variables, cursor: pageParam }),
    initialPageParam: undefined as Maybe<string | undefined>,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pageInfo.hasNextPage) {
        return undefined;
      }
      return lastPage.pageInfo.endCursor;
    },

    getPreviousPageParam: (firstPage) => {
      if (!firstPage.pageInfo.hasPreviousPage) {
        return undefined;
      }
      return firstPage.pageInfo.startCursor;
    },
  });
}

const searchResults = signal<SearchResults | undefined>(undefined);

const prevQueryString = signal<string | undefined>(undefined);

const searching = signal<boolean>(false);

// const prevSearchResults = signal<SearchResults | undefined>(undefined);
