import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PaginationInfo,
  useQualifierContext,
} from "@/modules/github/QualifierContext";
import {
  Query,
  resolve,
  SearchType,
  useLazyQuery,
  usePaginatedQuery,
  useQuery,
} from "@/modules/gql";
import { githubRepoCardListSelector } from "@/modules/github/selectors";
import { GithubRepoCardProps } from "@/modules/github/GithubRepoCard";
import { cn } from "@/lib/utils";
// const ListItem = (props: GithubRepoCardProps) => <div>{props.avatarUrl}</div>;
import { type Virtualizer } from "@tanstack/react-virtual";
import type { O } from "ts-toolbelt";
import { Virtuoso } from "react-virtuoso";
import React from "react";
import { useDeepCompareEffect } from "use-deep-compare";

type SearchVariables = O.Optional<Parameters<Query["search"]>[0], "type">;

type SearchResult = {
  items: GithubRepoCardProps[];
  paginationInfo?: PaginationInfo;
};

const defaultSearchArgs = { type: SearchType.REPOSITORY, first: 20 };

function parseSearchResults(
  query: Query,
  variables: SearchVariables
): SearchResult {
  console.log("VARIABLES", variables);
  // return resolve(({ query }) => {
  const searchResult = query.search({
    ...defaultSearchArgs,
    ...variables,
  });

  const items = githubRepoCardListSelector(searchResult);

  const { repositoryCount: totalCount, pageInfo } = searchResult;

  return {
    items,
    paginationInfo: { totalCount, ...pageInfo },
  };
  // });
}

const MillionJsTest = () => {
  // const { search } = useQuery();

  const [{ githubQueryString }] = useQualifierContext();

  const [cursor, setCursor] = useState<string>();

  const [items, setItems] = useState<GithubRepoCardProps[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setCursor(() => undefined);
    setItems(() => []);
  }, [githubQueryString]);

  useEffect(() => {
    setLoading(true);
    resolve(({ query }) => {
      const result = query.search({
        ...defaultSearchArgs,
        query: githubQueryString,
        after: cursor,
      });

      setTotalCount(result.repositoryCount ?? 0);

      const newItems = githubRepoCardListSelector(result);

      setItems((prev) => {
        const items = [...prev, ...newItems];

        return items;
      });
    }).finally(() => {
      setLoading(false);
    });
  }, [cursor, githubQueryString]);

  console.log("CURSOR", cursor);

  // useEffect(() => {
  //   fetchMore({ query: githubQueryString });
  // }, [fetchMore, githubQueryString]);
  // useEffect(() => {
  //   fetchSearchResults();
  // }, [fetchSearchResults]);

  // console.log("DATA", data);

  console.log("QUERY STIRNG", githubQueryString);

  return (
    <div className="h-full w-full">
      <Virtuoso
        data={items}
        className="h-full w-full "
        style={{ height: "100%" }}
        endReached={(index) => {
          // fetchMore({ index, query: githubQueryString });
          const { cursor: newCursor } = items[index];

          if (totalCount !== items.length) {
            setCursor(() => newCursor || undefined);
          }
        }}
        itemContent={(index, props) => {
          return <GithubCard {...props} index={index} />;
        }}
        context={{ empty: items.length === 0, loading: loading }}
        components={{
          Footer,
        }}
      />
    </div>
  );
};

const Footer = React.memo(
  ({ context }: { context?: { loading: boolean; empty: boolean } }) => {
    const { empty, loading } = context ?? {};
    return (
      <>
        {loading && (
          <div className="w-full py-4 select-none">
            <div className="w-full bg-muted-foreground/10 p-2 flex items-center justify-center rounded animate-pulse text-muted-foreground">
              Loading...
            </div>
          </div>
        )}
        {empty && (
          <div className="text-muted select-none text-lg">No Results</div>
        )}
      </>
    );
  }
);
type GithubCardProps = GithubRepoCardProps & {
  measureElement?: Virtualizer<Element, Element>["measureElement"];
  index?: number;
};
const GithubCard = React.memo(
  ({
    // starCount,

    avatarUrl,
    ownerUrl,
    repoUrl,
    ownerUsername,
    repoName,
    viewerHasStarred,
    starCountFormatted,
    languages = [],
    description = "No Description",
    createdAt,

    index,
  }: GithubCardProps) => (
    <div className={cn("group", { "pt-3": index !== 0 })}>
      <div
        // style={{ order: -(starCount ?? 0) }}
        className={cn(
          "w-full rounded-lg border bg-card text-card-foreground shadow-sm relative h-40",
          { "ring-1 ring-yellow-300/50 ring-inset": viewerHasStarred }
        )}>
        <div className="pb-2 flex flex-col space-y-1.5 p-6">
          <div className="flex items-center justify-between gap-2 text-2xl font-semibold leading-none tracking-tight">
            <span className="flex items-end gap-2 ">
              <RepoOwner
                ownerUrl={ownerUrl}
                ownerUsername={ownerUsername}
                avatarUrl={avatarUrl}
              />

              <ForwardSlash />
              <RepoName repoName={repoName} repoUrl={repoUrl} />
            </span>

            <StarBadge
              starCountFormatted={starCountFormatted}
              viewerHasStarred={viewerHasStarred}
            />
          </div>
          <RepoDescription description={description} />
        </div>
        <div className="justify-between flex items-center p-6 pt-0">
          <LanguageBadges languages={languages} />
          <CreatedAtBadge createdAt={createdAt} />
        </div>
      </div>
    </div>
  )
);

const RepoName = React.memo(
  ({ repoName, repoUrl }: Pick<GithubCardProps, "repoName" | "repoUrl">) => {
    return (
      <a href={repoUrl ?? ""} className="hover:underline leading-4">
        {repoName}
      </a>
    );
  }
);
const ForwardSlash = React.memo(() => {
  return <span className="text-primary/50 text-lg leading-3">/</span>;
});

const RepoOwner = React.memo(
  ({
    ownerUsername,
    ownerUrl,
    avatarUrl,
  }: Pick<GithubCardProps, "ownerUsername" | "ownerUrl" | "avatarUrl">) => {
    return (
      <span className="flex items-center gap-2">
        <div className={cn("h-4", !avatarUrl && "hidden")}>
          <div className="relative flex h-4 w-4 shrink-0 overflow-hidden rounded-full">
            <img src={avatarUrl} className="aspect-square h-full w-full" />
          </div>
        </div>
        <a
          className="text-primary/50 font-normal text-lg leading-3 hover:underline"
          href={ownerUrl ?? ""}>
          {ownerUsername}
        </a>
      </span>
    );
  }
);

const CreatedAtBadge = React.memo(
  ({ createdAt }: Pick<GithubCardProps, "createdAt">) => {
    return (
      <div className="text-primary/30 text-sm flex items-center gap-2">
        <span className="text-primary/50">{createdAt}</span>
        <span className="i-lucide-git-branch-plus h-4 w-4 text-emerald-500" />
      </div>
    );
  }
);
const RepoDescription = React.memo(
  ({ description }: { description: string }) => {
    return (
      <div
        className={cn(
          "py-2 text-secondary-foreground  pt-2 group-empty:block",
          {
            "text-muted-foreground/50": Boolean(description),
          }
        )}>
        {description}
      </div>
    );
  }
);

const StarBadge = React.memo(
  ({
    viewerHasStarred,
    starCountFormatted,
  }: Pick<GithubRepoCardProps, "viewerHasStarred" | "starCountFormatted">) => {
    return (
      <span
        className={cn(
          "text-sm flex items-center gap-1  rounded-full px-2 border border-transparent",
          {
            "shadow-sm bg-gradient-to-r from-yellow-300/10 to-yellow-500/5 border-yellow-300/90":
              viewerHasStarred,
          }
        )}>
        <span className={cn("text-xs")}>⭐️</span>{" "}
        <span
          className={cn("text-primary", {
            "underline-offset-2 decoration-2 decoration-yellow-200 dark:text-white  text-black":
              viewerHasStarred,
          })}>
          {starCountFormatted}
        </span>
      </span>
    );
  }
);

const LanguageBadges = React.memo(
  ({ languages }: Pick<GithubCardProps, "languages">) => {
    return (
      <div className="flex items-center gap-6 opacity-30 transition-opacity">
        {languages?.map(({ label, color, iconClassName }, i) => (
          <div key={`${label}-${i}`} className="flex items-center gap-1">
            <span
              className={cn(
                iconClassName
                  ? [iconClassName, "h-4 w-4"]
                  : "h-2.5 w-2.5 mr-1 rounded-full"
              )}
              style={{
                background: iconClassName ? undefined : (color as never),
              }}
            />

            <span className="text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    );
  }
);

export default MillionJsTest;
