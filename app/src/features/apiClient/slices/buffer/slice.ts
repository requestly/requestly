import { createSlice, createEntityAdapter, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { set, unset, cloneDeep } from "lodash";
import { objectToSetOperations, objectToDeletePaths } from "../utils/pathConverter";
import { BufferEntry, BufferState } from "./types";
import { ApiClientEntityType } from "../entities/types";
import { BUFFER_SLICE_NAME } from "../common/constants";

const bufferAdapter = createEntityAdapter<BufferEntry>();

const initialState: BufferState = bufferAdapter.getInitialState();

export function findBufferByReferenceId(
  entities: BufferState["entities"],
  referenceId: string
): BufferEntry | undefined {
  const allEntries = Object.values(entities) as (BufferEntry | undefined)[];
  return allEntries.find((e) => e?.referenceId === referenceId);
}

export const bufferSlice = createSlice({
  name: BUFFER_SLICE_NAME,
  initialState,
  reducers: {
    open(
      state,
      action: PayloadAction<{
        entityType: ApiClientEntityType;
        isNew: boolean;
        referenceId?: string;
        data: unknown;
      }>
    ) {
      const { entityType, isNew, referenceId, data } = action.payload;

      if (referenceId) {
        const existing = findBufferByReferenceId(state.entities, referenceId);
        if (existing) return;
      }

      const id = uuidv4();

      const entry: BufferEntry = {
        id,
        entityType,
        isNew,
        referenceId,
        current: cloneDeep(data),
        diff: {},
        isDirty: false,
      };

      bufferAdapter.addOne(state, entry);
    },

    applyPatch(
      state,
      action: PayloadAction<{
        id: string;
        command: { type: "SET" | "DELETE"; value: unknown };
      }>
    ) {
      const { id, command } = action.payload;
      const entry = state.entities[id] as BufferEntry | undefined;
      if (!entry) return;

      if (command.type === "SET") {
        const operations = objectToSetOperations(command.value);
        for (const { path, value } of operations) {
          set(entry.current as object, path, value);
          set(entry.diff as object, path, value);
        }
      } else if (command.type === "DELETE") {
        const paths = objectToDeletePaths(command.value);
        for (const path of paths) {
          unset(entry.current as object, path);
          set(entry.diff as object, path, null);
        }
      }

      entry.isNew = false;
      entry.isDirty = true;
    },

    unsafePatch(
      state,
      action: PayloadAction<{
        id: string;
        patcher: (entry: BufferEntry) => void;
      }>
    ) {
      const entry = state.entities[action.payload.id];
      if (!entry) return;
      action.payload.patcher(entry);
      entry.isDirty = true;
    },

    syncFromSource(
      state,
      action: PayloadAction<{
        referenceId: string;
        sourceData: unknown;
      }>
    ) {
      const { referenceId, sourceData } = action.payload;

      const entry = findBufferByReferenceId(state.entities, referenceId);
      if (!entry) return;

      entry.current = cloneDeep(sourceData);

      const operations = objectToSetOperations(entry.diff);
      for (const { path, value } of operations) {
        if (value === null) {
          unset(entry.current as object, path);
        } else {
          set(entry.current as object, path, value);
        }
      }
    },

    markSaved(
      state,
      action: PayloadAction<{
        id: string;
        savedData: unknown;
        referenceId: string;
      }>
    ) {
      const { id, savedData, referenceId } = action.payload;
      const entry = state.entities[id];
      if (!entry) return;

      entry.referenceId = referenceId;
      entry.current = cloneDeep(savedData);
      entry.diff = {};
      entry.isDirty = false;
    },

    close(state, action: PayloadAction<string>) {
      bufferAdapter.removeOne(state, action.payload);
    },

    clearAll(state) {
      bufferAdapter.removeAll(state);
    },
  },
});

export const bufferActions = bufferSlice.actions;
export const bufferReducer = bufferSlice.reducer;
export const bufferAdapterSelectors = bufferAdapter.getSelectors();
