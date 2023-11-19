import { useEffect } from "preact/hooks";
import {
  resolve,
  SearchType,
  SearchResultItemConnection,
  PageInfo,
} from "@/modules/gql";
import { githubRepoCardListSelector } from "@/modules/github/selectors";
import { GithubRepoCardProps } from "@/modules/github/GithubRepoCard";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { GithubCard } from "./GithubCard";
import { cn } from "@/lib/utils";
import { store } from "@/store";
import { signal } from "@preact/signals";
import { classed } from "@tw-classed/react";
import { Button } from "@/components/ui/button";

type GithubSearchVariables = {
  type?: keyof typeof SearchType;
  query: string;
  first?: number;
  cursor?: string;
};

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
  { query, type = "REPOSITORY", first = 20, cursor }: GithubSearchVariables,
  prevResult?: SearchResults
) {
  return resolve(({ query: gqlQuery }) => {
    const result = gqlQuery.search({
      type: SearchType[type],
      first,
      query,
      after: cursor,
    });

    const allItems = [
      ...(prevResult?.items ?? []),
      ...githubRepoCardListSelector(result),
    ];

    const { pageInfo } = result;

    const count = result[searchTypeCountVariables[type]];

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

interface ReposProps {
  githubSearchVariables: GithubSearchVariables;
  pagination: UseListPaginationParams;
}

const searchResults = signal<SearchResults | undefined>(undefined);

const prevQueryString = signal<string | undefined>(undefined);

// const prevSearchResults = signal<SearchResults | undefined>(undefined);

const Repos = ({ pagination, githubSearchVariables }: ReposProps) => {
  useEffect(() => {
    const { query, type } = githubSearchVariables;
    const queryString = JSON.stringify({ query, type });

    const didQueryStringChange = prevQueryString.value !== queryString;

    const prevResults = didQueryStringChange ? undefined : searchResults.value;

    store.githubSearch.isLoadingGithubSearchResults.value = true;

    fetchSearchResults(githubSearchVariables, prevResults).then((result) => {
      searchResults.value = result;
      store.githubSearch.isLoadingGithubSearchResults.value = false;
      prevQueryString.value = queryString;
    });
  }, [githubSearchVariables]);

  const { items: allRows = [], pageInfo } = searchResults.value ?? {};

  const { hasNextPage } = pageInfo ?? {};

  const { fetchNextPage, isFetchingNextPage } = pagination;
  const rowVirtualizer = useWindowVirtualizer({
    count: hasNextPage ? allRows.length + 1 : allRows.length,
    estimateSize: () => 160,
    overscan: 5,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    const [lastItem] = [...virtualItems].reverse();
    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= allRows.length - 1 &&
      hasNextPage &&
      !store.githubSearch.isLoadingGithubSearchResults.value
    ) {
      // fetchNextPage()

      fetchNextPage?.(pageInfo!);
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allRows.length,
    isFetchingNextPage,
    virtualItems,
    pageInfo,
  ]);

  const showEmptyState = allRows.length === 0;

  return (
    <div className="h-full">
      {showEmptyState && (
        <EmptyState className="h-full pb-[10%]">
          <EmptyState.Container>
            <EmptyState.Title>No results found</EmptyState.Title>
            <EmptyState.Description>
              No repositores matching the criteria could be found
              <br />
              Try different search terms or filters
            </EmptyState.Description>
            <Button variant="outline" size="sm">
              Clear search
            </Button>
          </EmptyState.Container>
        </EmptyState>
      )}
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
        className="group"
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const { index: virtualIndex, start } = virtualRow;
          const data = allRows[virtualIndex];

          const isLoaderRow = virtualIndex > allRows.length - 1;

          return (
            <div
              key={virtualIndex}
              data-index={virtualIndex}
              ref={rowVirtualizer.measureElement}
              className={cn("flex items-center", "py-1")}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                // height: `${size}px`,
                width: "100%",
                transform: `translateY(${start}px)`,
              }}
            >
              {isLoaderRow ? (
                <div
                  className="flex items-center justify-center w-full select-none relative rouned-md bg-card rounded-md border h-36"
                  style={{ height: "100%" }}
                >
                  <div className="animate-pulse ">
                    <span className=" opacity-30">Loading...</span>
                  </div>
                </div>
              ) : (
                <GithubCard {...data} index={virtualIndex} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const EmptyStateTitle = classed("div", {
  base: "text-lg font-medium leading-4",
});

const EmptyStateDescription = classed("div", {
  base: "text-sm font-medium text-secondary text-center",
});

const EmptyStateContainer = classed("div", {
  base: "flex flex-col items-center justify-center gap-2 ",
});

const EmptyStateRoot = classed("div", {
  base: "flex flex-col items-center justify-center",
});
const EmptyState = Object.assign(EmptyStateRoot, {
  Container: EmptyStateContainer,
  Title: EmptyStateTitle,
  Description: EmptyStateDescription,
});

function RepoList() {
  const { cursor, first, query, searchType } =
    store.githubSearch.searchVariables;

  return (
    // <Suspense fallback={<div>Loading...</div>}>
    <Repos
      githubSearchVariables={{
        query: query.value,
        cursor: cursor.value,
        first: first.value,
        type: searchType.value,
      }}
      pagination={{
        fetchNextPage: (pageInfo) => {
          if (pageInfo.endCursor) {
            cursor.value = pageInfo.endCursor;
          }
        },
      }}
    />
    // </Suspense>
  );
}

export default RepoList;
