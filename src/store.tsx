import { computed, signal } from "@preact/signals";
import { SearchType } from "./modules/gql";
import { localSignal } from "./lib/local-signal";

import { buildGithubSearchQueryString } from "@/modules/github/search-query.helpers";

import { map } from "lodash-es";
import { GQtyError } from "gqty";
import { notEmpty } from "./lib/utils";
import { presets } from "@/modules/github/qualifier-presets";

// Auth

const isSignedInToFirebase = signal<boolean | undefined>(undefined);

const isSignedIn = computed(() => {
  return isSignedInToFirebase.value && githubAccessToken.value;
});

const githubAccessToken = localSignal<string | undefined>(
  "githubAccessToken",
  undefined
);

const githubApiError = signal<GQtyError | undefined>(undefined);

// Github - Qualifiers

export const searchType = signal<SearchType>("REPOSITORY");

const defaultQualifiers: { qualifier: string; value: string }[] = [
  {
    qualifier: "sort",
    value: "stars",
  },
];

const qualifiers = {
  programLanguage: signal(presets.language({ qualifier: "language" })),
  created: signal(presets.date({ qualifier: "created" })),
  minStars: signal(presets.stars({ qualifier: "stars" })),
};

// Github API - Search

const searchInput = signal("");

const isLoadingGithubSearchResults = signal<boolean>(false);

// Github API - Search Variables

const cursor = signal<string | undefined>(undefined);

const first = signal<number>(20);

const query = computed(() => {
  const qualifierList = map(qualifiers, (e) => {
    const v = e.value;

    if (!v.required && !v.value) return undefined;

    const { value, qualifier } = parseQualifierValue({
      value: v.value ?? v.defaultValue,
      defaultQualifier: v.qualifier,
    });

    return { qualifier, value };
  }).filter(notEmpty);

  return buildGithubSearchQueryString(
    [...defaultQualifiers, ...qualifierList],
    searchInput.value
  );
});

function parseQualifierValue({
  value,
  defaultQualifier,
}: {
  value: string;
  defaultQualifier: string;
}) {
  const parts = value.split(":");

  if (parts.length === 1) {
    return { qualifier: defaultQualifier, value };
  }

  const [q, v] = parts;

  return { qualifier: q, value: v };
}

const githubSearch = {
  isLoadingGithubSearchResults,
  searchInput,
  qualifiers,
  searchVariables: {
    query,
    searchType,
    cursor,
    first,
  },
};

// Export

export const store = {
  isSignedInToFirebase,
  isSignedIn,
  githubSearch,
  githubAccessToken,
  githubApiError,
};
