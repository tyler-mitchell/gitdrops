import { generate } from "@graphql-codegen/cli";
import { consola } from "consola";
import { $ } from "zx";
import { defineCommand, runMain } from "citty";
import { invariant } from "outvariant";
import { fetch } from "ofetch";
import { until } from "@open-draft/until";

const program = defineCommand({
  meta: {
    name: "introspect",

    description:
      "Introspect the github graphql api schema and generate code from it",
  },

  args: {
    gqtyConfigPath: {
      type: "string",
      default:
        process.env.GQTY_CONFIG_FILE_PATH ??
        "./introspection/generators/gqty.config.cjs",
    },
  },
  run: async ({ args }) => {
    const { gqtyConfigPath } = args;

    consola.start("Starting intropection...\n");

    const { data: accessToken, error } = await until(getGithubAccessToken);

    if (error) {
      consola.error(error.message);
      process.exit(1);
    }

    consola.start("Introspecting graphql schema...\n");

    await generate({
      overwrite: true,
      schema: [
        {
          "https://api.github.com/graphql": {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            customFetch: fetch as never,
          },
        },
      ],
      generates: {
        "./introspection/graphql/github-api.graphql": {
          plugins: ["schema-ast"],
        },
      },
    });

    consola.success(`Successfully introspected graphql schema\n`);

    consola.start("Generating gqty interface...\n");

    process.env.GQTY_CONFIG_FILE_PATH = gqtyConfigPath;

    await $`./node_modules/.bin/gqty generate`;

    consola.log("\n");

    consola.success("Generation complete 🎉\n");
  },
});

async function getGithubAccessToken() {
  const envKey = "GITHUB_ACCESS_TOKEN";

  let githubAccessToken = process.env[envKey];

  if (!githubAccessToken) {
    consola.info(`${envKey} environment variable not found\n`);

    consola.start("Getting access token using the Github CLI...\n");

    try {
      githubAccessToken = `${await $`gh auth token`.quiet()}`;
    } catch {
      consola.error("Could not get access token from gh cli");
    }
  }

  invariant(
    !!githubAccessToken,
    `Could find the github access token.\n\nSet the %s environment variable or run 'gh auth login' using the Github CLI.`,
    envKey
  );

  consola.success("Github access token found\n");

  return githubAccessToken.trim();
}

runMain(program);
