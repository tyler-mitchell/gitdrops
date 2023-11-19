/* eslint-disable no-undef */
/**
 * @type {import("@gqty/cli").GQtyConfig}
 */
const config = {
  react: true,
  scalarTypes: { DateTime: "string" },
  introspection: {
    endpoint: "SPECIFY_ENDPOINT_OR_SCHEMA_FILE_PATH_HERE",
    headers: {},
  },
  endpoint: "/api/graphql",
  destination: "./src/modules/gql/index.ts",
  subscriptions: false,
  javascriptOutput: false,
  enumsAsConst: false,
};

module.exports = config;
