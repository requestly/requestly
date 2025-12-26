import type { EntityState } from "@reduxjs/toolkit";
import type { ApiClientEntityType } from "../entities/types";
import type { RQAPI } from "features/apiClient/types";
import type { EnvironmentEntity } from "../environments/types";

export type EntityDataMap = {
  [ApiClientEntityType.HTTP_RECORD]: RQAPI.HttpApiRecord;
  [ApiClientEntityType.GRAPHQL_RECORD]: RQAPI.GraphQLApiRecord;
  [ApiClientEntityType.ENVIRONMENT]: EnvironmentEntity;
  [ApiClientEntityType.GLOBAL_ENVIRONMENT]: EnvironmentEntity;
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
