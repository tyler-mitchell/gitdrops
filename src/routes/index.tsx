import { FileRoute } from "@tanstack/react-router";
import { useUser } from "@clerk/clerk-react";
import {
  LanguageOrderField,
  OrderDirection,
  SearchType,
  useQuery,
} from "@/modules/gql";
import { QualifierFields } from "@/modules/github/QualifierFields";
import { useQualifierContext } from "@/modules/github/QualifierContext";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { timeAgo } from "@/lib/date-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { languageMap } from "@/modules/github/search-query.constant";
import { cn } from "@/lib/utils";
import { numberFormat } from "@/modules/github/search-query.helpers";

export const route = new FileRoute('/').createRoute({
  component: function Index() {
    // const clerk = useClerk();

    const { user } = useUser();

    console.log(user);

    const { search } = useQuery();

    const [{ githubQueryString }] = useQualifierContext();
    return (
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 mt-8">
          <QualifierFields />
        </div>
        <div className="flex flex-col gap-3">
          {search({
            query: githubQueryString,
            type: SearchType.REPOSITORY,
            first: 10,
          })?.edges?.map((e) => {
            const {
              createdAt,
              name,
              description,
              owner,
              url,
              id,
              languages,

              stargazerCount,
            } = e?.node?.$on.Repository ?? {};

            const avatarUrl = owner?.avatarUrl?.();

            return (
              <Card
                className="w-full"
                key={id}
                style={{ order: -(stargazerCount ?? 0) }}>
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
                          className="text-muted text-lg leading-3 hover:underline"
                          href={owner?.url}>
                          {owner?.login}
                        </a>
                      </span>
                      <span className="text-muted text-lg leading-3">/</span>
                      <a href={url} className="hover:underline leading-4">
                        {name}
                      </a>
                    </span>

                    <span>⭐️ {numberFormat(stargazerCount)}</span>
                  </CardTitle>
                  <CardDescription className="py-2">
                    {description ?? (
                      <span className="text-muted">No description</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between">
                  <div className="flex items-center gap-6">
                    {languages?.({
                      first: 3,
                      orderBy: {
                        field: LanguageOrderField.SIZE,
                        direction: OrderDirection.DESC,
                      },
                    })?.nodes?.map((e) => {
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
                              background: iconClassName
                                ? undefined
                                : (e?.color as never),
                            }}
                          />

                          <span>{name}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-primary/30 flex items-center gap-2">
                    <span className="text-primary">{timeAgo(createdAt)}</span>
                    <span className="i-lucide-package-plus h-4 w-4 text-emerald-500" />
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        {/* <pre>{JSON.stringify(clerk.user, null, 2)}</pre> */}
      </div>
    );
  },
});
