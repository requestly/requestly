import type { EntityState } from "@reduxjs/toolkit";
import type { ApiClientEntityType } from "../entities/types";

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
