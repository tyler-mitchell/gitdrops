import { fetch } from "ofetch";
import "zx/globals";
import { defu } from "defu";

type FetchOptions = Parameters<typeof fetch>[1];

export async function fetchGithubGraphqlSchema(
  url: string = "https://api.github.com/graphql",
  options: FetchOptions
) {
  // return await fetch(url, {
  //   headers: {
  //     ...headers,
  //     Authorization: `Bearer ${await $`gh auth token`}`,
  //   },
  //   ...options,
  // });

  const accessToken = await $`gh auth token`;

  return fetch(
    url,
    defu(options, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  );
}
