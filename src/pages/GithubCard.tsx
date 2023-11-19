/* eslint-disable @typescript-eslint/no-explicit-any */
import { GithubRepoCardProps } from "@/modules/github/GithubRepoCard";
import { cn } from "@/lib/utils";
// const ListItem = (props: GithubRepoCardProps) => <div>{props.avatarUrl}</div>;
import { type Virtualizer } from "@tanstack/react-virtual";
import React from "react";
import { classed } from "@tw-classed/react";
import { LanguageMetadata } from "@/modules/github/qualifier-presets/language";

export type GithubCardProps = GithubRepoCardProps & {
  measureElement?: Virtualizer<Element, Element>["measureElement"];
  index?: number;
};

export const GithubCard = React.memo(
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
  }: GithubCardProps) => {
    const repoOwnerProps = {
      ownerUrl,
      ownerUsername,
      avatarUrl,
    };

    const repoNameProps = {
      repoName,
      repoUrl,
    };

    const starBadgeProps = {
      starCountFormatted,
      viewerHasStarred,
    };

    return (
      <div className={cn("group w-full h-full @container")}>
        <div
          className={cn(
            "w-full rounded-lg border bg-card text-card-foreground shadow-sm relative h-full",
            { "ring-1 ring-yellow-300/50 ring-inset": viewerHasStarred }
          )}
        >
          <div className="pb-2 flex flex-col p-6 leading-none">
            <div className="@xs:flex @sm:flex @md:hidden flex-wrap flex-col">
              <div className="flex gap-x-1 gap-y-2 justify-between flex-wrap">
                <RepoOwner {...repoOwnerProps} />
                <StarBadge {...starBadgeProps} />
              </div>
              <RepoName {...repoNameProps} />
            </div>
            <div className="@md:flex hidden gap-x-2 items-center">
              <RepoOwner {...repoOwnerProps} />
              <RepoName {...repoNameProps} />
              <StarBadge
                {...starBadgeProps}
                className="flex items-center justify-end flex-grow"
              />
            </div>

            <RepoDescription description={description} />
          </div>
          <div className="justify-between flex flex-wrap items-center p-6 pt-0 gap-2 ">
            <LanguageBadges languages={languages} />
            <div className="flex flex-grow justify-start @sm:justify-end">
              <CreatedAtBadge createdAt={createdAt} />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

const RepoName = React.memo(
  ({
    repoName,
    repoUrl,
    className,
  }: Pick<GithubCardProps, "repoName" | "repoUrl"> & {
    className?: string;
  }) => {
    return (
      <a
        href={repoUrl ?? ""}
        className={cn(
          "hover:underline leading-5 text-2xl font-medium tracking-tight",
          className
        )}
      >
        {repoName}
      </a>
    );
  }
);

const ForwardSlash = React.memo(({ className }: { className?: string }) => {
  return (
    <span
      className={cn(
        "text-primary/50 text-lg leading-3  tracking-tight",
        className
      )}
    >
      /
    </span>
  );
});

const RepoOwner = React.memo(
  ({
    ownerUsername,
    ownerUrl,
    avatarUrl,
    className,
  }: Pick<GithubCardProps, "ownerUsername" | "ownerUrl" | "avatarUrl"> & {
    className?: string;
  }) => {
    return (
      <div
        className={cn(
          "flex flex-nowrap gap-2 items-center  tracking-tight",
          className
        )}
      >
        <span className="flex items-center gap-2">
          <div className={cn("h-4", !avatarUrl && "hidden")}>
            <div className="relative flex h-4 w-4 shrink-0 overflow-hidden rounded-full">
              <img src={avatarUrl} className="aspect-square h-full w-full" />
            </div>
          </div>
          <a
            className="text-primary/50 font-normal text-lg leading-3 hover:underline"
            href={ownerUrl ?? ""}
          >
            {ownerUsername}
          </a>
        </span>
        <ForwardSlash />
      </div>
    );
  }
);

const CreatedAtBadge = React.memo(
  ({
    createdAt,
    className,
  }: Pick<GithubCardProps, "createdAt"> & { className?: string }) => {
    return (
      <div
        className={cn(
          "text-primary/30 text-sm flex items-center gap-2",
          className
        )}
      >
        <span className="text-accent">created {createdAt}</span>
        {/* <span className="i-lucide-git-branch-plus h-4 w-4 text-emerald-500" /> */}
      </div>
    );
  }
);

const RepoDescription = React.memo(
  ({ description, className }: { description: string; className?: string }) => {
    return (
      <div
        className={cn(
          "py-2 text-secondary-foreground text-sm pt-2 group-empty:block",
          {
            "text-muted-foreground/50": Boolean(description),
          },
          className
        )}
      >
        {description}
      </div>
    );
  }
);

const StarBadgeElement = classed("span", {
  base: " text-primary text-sm inline-flex items-center gap-1 rounded-full border border-transparent font-semibold",
  variants: {
    starred: {
      true: "shadow-sm bg-gradient-to-r from-yellow-300/10 to-yellow-500/5 border-yellow-300/90 px-2",
    },
  },
});

const StarBadge = React.memo(
  ({
    viewerHasStarred,
    starCountFormatted,
    className,
  }: Pick<GithubRepoCardProps, "viewerHasStarred" | "starCountFormatted"> & {
    className?: string;
  }) => {
    // if(!starCountFormatted) return null
    return (
      <div className={className}>
        <StarBadgeElement starred={viewerHasStarred}>
          <span className={cn("text-xs")}>⭐️</span>{" "}
          <span>{starCountFormatted}</span>
        </StarBadgeElement>
      </div>
    );
  }
);

const LanguageIconElement = classed("span", {
  base: "h-3.5 w-3.5",
  variants: {
    isDot: {
      true: "h-2.5 w-2.5 rounded-full",
    },
  },
});

const LanguageBadge = React.memo(
  ({
    label,
    iconClassName,
    className,
    color,
  }: LanguageMetadata & { className?: string }) => {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <LanguageIconElement
          className={cn("", iconClassName)}
          isDot={!iconClassName}
          style={{
            backgroundColor: iconClassName ? undefined : color,
          }}
        />

        <span className="text-muted-foreground text-sm">{label}</span>
      </div>
    );
  }
);

const LanguageBadges = React.memo(
  ({
    languages,
    className,
  }: Pick<GithubCardProps, "languages"> & { className?: string }) => {
    return (
      <div
        className={cn(
          "flex items-center flex-wrap gap-x-6 gap-y-1.5 transition-opacity opacity-50",
          className
        )}
      >
        {languages?.map((props, i) => (
          <LanguageBadge key={`${props.label}-${i}`} {...props} />
        ))}
      </div>
    );
  }
);
