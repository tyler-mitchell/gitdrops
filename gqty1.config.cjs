/* eslint-disable no-undef */
/**
 * @type {import("@gqty/cli").GQtyConfig}
 */
const config = {
  react: false,
  scalarTypes: { DateTime: "string" },

  introspection: {
    endpoint: "./introspection/graphql/github-api.graphql",
  },

  preImport: "/** eslint-disable @typescript-eslint/no-explicit-any */",
  endpoint: "https://api.github.com/graphql",
  destination: "./src/modules/gqty/gqty.ts",

  subscriptions: false,
  javascriptOutput: false,
  enumsAsConst: true,
};

// eslint-disable-next-line no-undef
module.exports = config;
