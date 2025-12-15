import { Dispatch } from "@reduxjs/toolkit";
import { RQAPI } from "features/apiClient/types";
import { DeepPartial, DeepPartialWithNull } from "../types";

export enum EntityType {
  HTTP_RECORD = "http_record",
  GRAPHQL_RECORD = "graphql_record",
}

export interface EntityMeta {
  readonly id: string;
}

export interface SerializedEntity<T extends EntityType = EntityType> {
  readonly id: string;
  readonly type: T;
}

export const recordTypeToEntityType = {
  [RQAPI.RecordType.API]: {
    [RQAPI.ApiEntryType.HTTP]: EntityType.HTTP_RECORD,
    [RQAPI.ApiEntryType.GRAPHQL]: EntityType.GRAPHQL_RECORD,
  },
} as const;

export type { DeepPartial, DeepPartialWithNull };

export type EntityDispatch = Dispatch;
