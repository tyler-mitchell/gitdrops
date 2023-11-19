/* eslint-disable no-undef */
/**
 * @type {import("@gqty/cli").GQtyConfig}
 */

const config = {
  introspection: {
    endpoint: "./introspection/graphql/github-api.graphql",
  },
  react: false,
  scalarTypes: { DateTime: "string" },
  preImport: "/** eslint-disable @typescript-eslint/no-explicit-any */",
  endpoint: "https://api.github.com/graphql",
  destination: "./src/modules/gqty/gqty.ts",
  subscriptions: false,
  javascriptOutput: false,
  enumsAsConst: true,
};

module.exports = config;
