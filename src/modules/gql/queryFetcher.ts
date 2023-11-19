import { GQtyError, type QueryFetcher } from "gqty";

import { store } from "@/store";
import { ofetch } from "ofetch";

export const queryFetcher: QueryFetcher = async function (
  { query, variables, operationName },
  fetchOptions
) {
  const response = await ofetch("https://api.github.com/graphql", {
    query: {
      // It seems that this is needed to ensure that results are sorted when no query string text is sent as a variable to the search query
      sort: "stars",
    },

    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${store.githubAccessToken.value}`,
    },

    body: JSON.stringify({
      query,
      variables,
      operationName,
    }),

    mode: "cors",

    parseResponse: (text) => {
      try {
        return JSON.parse(text);
      } catch {
        throw new GQtyError(
          `Malformed JSON response: ${
            text.length > 50 ? text.slice(0, 50) + "..." : text
          }`
        );
      }
    },

    onRequestError: ({ response }) => {
      if (!response?.status) return;

      if (response?.status === 401) {
        store.githubAccessToken.value = undefined;
      }

      if (response?.status >= 400) {
        store.githubApiError.value = new GQtyError(
          `GraphQL endpoint responded with HTTP status ${response.status}.`
        );
      }
    },

    ...fetchOptions,
  });

  return response;
};
