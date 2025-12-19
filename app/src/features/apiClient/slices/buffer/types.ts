import { EntityState } from "@reduxjs/toolkit";
import { ApiClientEntityType } from "../entities/types";
import { RQAPI } from "features/apiClient/types";

export type EntityDataMap = {
  [ApiClientEntityType.HTTP_RECORD]: RQAPI.HttpApiRecord;
  [ApiClientEntityType.GRAPHQL_RECORD]: RQAPI.GraphQLApiRecord;
  // Future:
  // [ApiClientEntityType.ENVIRONMENT]: EnvironmentData;
  // [ApiClientEntityType.COLLECTION]: CollectionData;
};

export interface BufferEntry<T = unknown> {
  readonly id: string;
  readonly entityType: ApiClientEntityType;
  current: T;
  diff: Partial<T>;
  isDirty: boolean;
  isNew: boolean;
  referenceId?: string;
}

export type NewBufferEntry<T = unknown> = BufferEntry<T> & { isNew: true };

export type EditBufferEntry<T = unknown> = BufferEntry<T> & { isNew: false; referenceId: string };

export type BufferState = EntityState<BufferEntry>;
