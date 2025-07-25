import { RQAPI } from "features/apiClient/types";
import { GraphQLSchema } from "graphql";
import { create } from "zustand";
import { BaseApiRecordStoreState, createBaseApiRecordState } from "../base";

export type GraphQLRecordState = BaseApiRecordStoreState<RQAPI.GraphQLApiRecord> & {
  schema: GraphQLSchema;
};

export function createGraphQLRecordStore(record: RQAPI.GraphQLApiRecord) {
  return create<GraphQLRecordState>()((set) => ({
    schema: null,
    ...createBaseApiRecordState(record, set),
  }));
}
