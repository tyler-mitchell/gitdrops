import { CodegenConfig } from "@graphql-codegen/cli";
import { fetchGithubGraphqlSchema } from "./fetch-github-graphql-schema";

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    {
      "https://api.github.com/graphql": {
        customFetch: fetchGithubGraphqlSchema as never,
      },
    },
  ],
  generates: {
    "./github-api.graphql": {
      plugins: ["schema-ast"],
    },
  },
};

export default config;
