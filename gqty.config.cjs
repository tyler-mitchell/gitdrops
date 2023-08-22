/**
 * @type {import("@gqty/cli").GQtyConfig}
 */
const config = {
  react: true,
  scalarTypes: { DateTime: "string" },
  introspection: {
    endpoint: "https://api.github.com/graphql",
    headers: {
      authorization: "Bearer ghu_BU3pMUMp54OgHTnIW983o93DqqcHO53evuju",
    },
  },
  preImport: "/** eslint-disable @typescript-eslint/no-explicit-any */",
  endpoint: "https://api.github.com/graphql",
  destination: "./src/modules/gqty/index.ts",
  subscriptions: false,
  javascriptOutput: false,
  enumsAsConst: false,
};

// eslint-disable-next-line no-undef
module.exports = config;
