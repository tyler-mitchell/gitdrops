import {
  LanguageConnection,
  LanguageOrderField,
  Maybe,
  OrderDirection,
  SearchResultItemConnection,
} from "@/modules/gql";
import { GithubRepoCardProps } from "@/modules/github/GithubRepoCard";
import { timeAgo } from "@/lib/date-utils";
import {
  LanguageMetadata,
  languageMap,
} from "@/modules/github/search-query.constant";
import { get } from "@effect/data/ReadonlyRecord";
import { notEmpty } from "@/lib/utils";
import { getOrUndefined } from "@effect/data/Option";
import { numberFormat } from "@/modules/github/search-query.helpers";

export function githubRepoCardListSelector(
  searchResults: SearchResultItemConnection
) {
  return (
    searchResults.edges
      ?.map((e, index) => {
        const { node, cursor } = e ?? {};
        const {
          id,
          createdAt,
          name,
          description,
          owner,
          url,
          viewerHasStarred,
          languages: languagesQuery,
          stargazerCount,
        } = node?.$on.Repository ?? {};

        const {
          login: ownerUsername = undefined,
          url: ownerUrl = undefined,
          avatarUrl: avatarUrlQuery,
        } = owner ?? {};

        const avatarUrl = avatarUrlQuery?.();

        const languageConnection = languagesQuery?.({
          first: 3,
          orderBy: {
            field: LanguageOrderField.SIZE,
            direction: OrderDirection.DESC,
          },
        });

        const languages = transformLanguageConnection(languageConnection);

        if (id === undefined) return undefined;

        return {
          id,
          key: index,
          repoName: name ?? undefined,
          description: description ?? undefined,
          repoUrl: url ?? undefined,
          ownerUrl,
          viewerHasStarred: viewerHasStarred ?? undefined,
          starCount: stargazerCount ?? undefined,
          ownerUsername,
          languages: languages ?? undefined,
          avatarUrl,
          createdAt: timeAgo(createdAt) ?? undefined,
          starCountFormatted: numberFormat(stargazerCount),
          cursor,
        } as GithubRepoCardProps;
      })
      .filter(notEmpty) ?? []
  );
}

function transformLanguageConnection(
  languageConnection?: Maybe<LanguageConnection>
) {
  return languageConnection?.nodes
    ?.map((language) => {
      if (!language) return undefined;

      const { name: languageName, color: languageColor } = language ?? {};

      const languageData = getOrUndefined(
        get(languageMap, languageName?.toLocaleLowerCase() ?? "")
      );

      return {
        label: languageName,
        color: languageColor ?? undefined,
        ...languageData,
      } as LanguageMetadata;
    })
    .filter(notEmpty);
}
