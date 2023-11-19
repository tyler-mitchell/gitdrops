import { Variables } from "gqty";
import { Mutation, Query } from "./schema.generated";

export type QueryKey = Exclude<keyof Query, "__typename">;

export type QueryVariables<TQueryKey extends QueryKey> = Variables<
  Query[TQueryKey]
>;

export type MutationKey = Exclude<keyof Mutation, "__typename">;

export type MutationVariables<TMutationKey extends MutationKey> = Variables<
  Mutation[TMutationKey]
>;
