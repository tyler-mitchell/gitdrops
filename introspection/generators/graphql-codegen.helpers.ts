import { fetch } from "ofetch";
import "zx/globals";
import { defu } from "defu";

type FetchOptions = Parameters<typeof fetch>[1];

export async function fetchGithubGraphqlSchema(
  url: string = "https://api.github.com/graphql",
  options: FetchOptions
) {
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

export async function generateGqty() {
  const gqtyConfigPath = "./introspection/generators/gqty.config.cjs";
  process.env.GQTY_CONFIG_FILE_PATH = gqtyConfigPath;
  await $`./node_modules/.bin/gqty generate`;
}
