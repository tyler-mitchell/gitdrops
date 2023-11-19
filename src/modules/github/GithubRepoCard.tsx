import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { timeAgo } from "@/lib/date-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LanguageMetadata,
  languageMap,
} from "@/modules/github/qualifier-presets/language";
import { cn } from "@/lib/utils";
import { numberFormat } from "@/modules/github/search-query.helpers";
import { Language, Maybe } from "@/modules/gql";

export type GithubRepoCardProps = {
  description?: string;
  repoName?: string;
  viewerHasStarred?: boolean;
  ownerUsername?: string;
  repoUrl?: string;
  starCount?: number;
  avatarUrl?: string;
  ownerUrl?: string;
  languages?: LanguageMetadata[];
  createdAt?: string;
  starCountFormatted?: string;
  id?: string;
  cursor?: string;
};

type GithubRepoCardPropsOld = {
  description?: Maybe<string>;
  repoName?: Maybe<string>;
  viewerHasStarred?: Maybe<boolean>;
  ownerUsername?: Maybe<string>;
  repoUrl?: Maybe<string>;
  starCount?: Maybe<number>;
  avatarUrl?: Maybe<string>;
  ownerUrl?: Maybe<string>;
  createdAt?: Maybe<string>;
  languages?: Maybe<Language>[];
};

export const GithubCard = ({
  description,
  repoName,
  starCount,
  avatarUrl,
  ownerUrl,
  repoUrl,
  ownerUsername,
  viewerHasStarred,
  languages,
  createdAt,
}: GithubRepoCardPropsOld) => {
  return (
    <Card className="w-full" style={{ order: -(starCount ?? 0) }}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-end gap-2 ">
            <span className="flex items-end gap-2">
              {avatarUrl && (
                <div className="h-4">
                  <Avatar className="h-5 w-5 leading-3">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>{name?.[0]}</AvatarFallback>
                  </Avatar>
                </div>
              )}
              <a
                className="text-primary/50 font-normal text-lg leading-3 hover:underline"
                href={ownerUrl ?? ""}
              >
                {ownerUsername}
              </a>
            </span>
            <span className="text-primary/50 text-lg leading-3">/</span>
            <a href={repoUrl ?? ""} className="hover:underline leading-4">
              {repoName}
            </a>
          </span>

          <span
            className={cn(
              "text-sm flex items-center gap-1  rounded-full px-2 border border-transparent",
              {
                "shadow-sm bg-gradient-to-r from-yellow-300/10 to-yellow-500/5 border-yellow-300/90":
                  viewerHasStarred,
              }
            )}
          >
            <span className={cn("text-xs")}>⭐️</span>{" "}
            <span
              className={cn("text-primary", {
                "underline-offset-2 decoration-2 decoration-yellow-200 dark:text-white  text-black":
                  viewerHasStarred,
              })}
            >
              {numberFormat(starCount)}
            </span>
          </span>
        </CardTitle>
        <CardDescription className="py-2 text-secondary-foreground">
          {description ?? (
            <span className="text-primary/20">No description</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-6">
          {languages?.map((e) => {
            const name = e?.name;
            const lang = name?.toLocaleLowerCase() ?? "";

            const { iconClassName = "" } =
              lang in languageMap
                ? languageMap[lang as keyof typeof languageMap]
                : {};

            return (
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    iconClassName
                      ? [iconClassName, "h-4 w-4"]
                      : "h-2.5 w-2.5 mr-1 rounded-full"
                  )}
                  style={{
                    background: iconClassName ? undefined : (e?.color as never),
                  }}
                />

                <span>{name}</span>
              </div>
            );
          })}
        </div>
        <div className="text-primary/30 text-sm flex items-center gap-2">
          <span className="text-primary/50">{timeAgo(createdAt)}</span>
          <span className="i-lucide-git-branch-plus h-4 w-4 text-emerald-500" />
        </div>
      </CardFooter>
    </Card>
  );
};
