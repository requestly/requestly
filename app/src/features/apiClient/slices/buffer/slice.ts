import { createSlice, createEntityAdapter, PayloadAction } from "@reduxjs/toolkit";
import { produceWithPatches, enablePatches, current } from "immer";
import { v4 as uuidv4 } from "uuid";
import { set, unset, cloneDeep } from "lodash";
import { objectToSetOperations, objectToDeletePaths } from "../utils/pathConverter";
import { BufferEntry, BufferState } from "./types";
import { ApiClientEntityType } from "../entities/types";
import { BUFFER_SLICE_NAME } from "../common/constants";
import { emitBufferUpdated } from "componentsV2/Tabs/slice";

enablePatches();

const bufferAdapter = createEntityAdapter<BufferEntry>();

const initialState: BufferState = bufferAdapter.getInitialState();

export function findBufferByReferenceId(
  entities: BufferState["entities"],
  referenceId: string
): BufferEntry | undefined {
  return Object.values(entities).find((e) => e?.referenceId === referenceId);
}

export const bufferSlice = createSlice({
  name: BUFFER_SLICE_NAME,
  initialState,
  reducers: {
    open: {
      reducer(
        state,
        action: PayloadAction<
          {
            entityType: ApiClientEntityType;
            isNew: boolean;
            referenceId?: string;
            data: unknown;
          },
          string,
          { id: string }
        >
      ) {
        const { entityType, isNew, referenceId, data } = action.payload;

        if (referenceId) {
          const existing = findBufferByReferenceId(state.entities, referenceId);
          if (existing) {
            existing.current = cloneDeep(data);
            existing.diff = {};
            return;
          }
        }

        const entry: BufferEntry = {
          id: action.meta.id,
          entityType,
          isNew,
          referenceId,
          current: cloneDeep(data),
          diff: {},
          isDirty: false,
        };

        bufferAdapter.addOne(state, entry);
      },
      prepare(
        payload: {
          entityType: ApiClientEntityType;
          isNew: boolean;
          referenceId?: string;
          data: unknown;
        },
        meta?: { id: string | undefined }
      ) {
        return { payload, meta: { id: meta?.id || uuidv4() } };
      },
    },

    applyPatch(
      state,
      action: PayloadAction<{
        id: string;
        command: { type: "SET" | "DELETE"; value: unknown };
      }>
    ) {
      const entry = state.entities[action.payload.id];
      if (!entry) return;

      const { command } = action.payload;

      if (command.type === "SET") {
        const operations = objectToSetOperations(command.value);
        for (const { path, value } of operations) {
          set(entry.current as object, path, value);
          set(entry.diff as object, path, value);
        }
      }

      if (command.type === "DELETE") {
        const paths = objectToDeletePaths(command.value);
        for (const path of paths) {
          unset(entry.current, path);
          unset(entry.diff, path);
        }
      }

      entry.isNew = false;
      entry.isDirty = true;

      if (entry.referenceId) {
        emitBufferUpdated({
          entityId: entry.referenceId,
          entityType: entry.entityType,
        });
      }
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

      const plain = current(entry.current);

      const [nextCurrent, patches] = produceWithPatches(plain, (draft) => {
        action.payload.patcher({ current: draft } as BufferEntry);
      });

      entry.current = nextCurrent;
      for (const patch of patches) {
        const path = patch.path;
        switch (patch.op) {
          case "add":
          case "replace":
            set(entry.diff, path, patch.value);
            break;
          case "remove":
            unset(entry.diff, path);
            break;
        }
      }

      entry.isDirty = true;

      if (entry.referenceId) {
        emitBufferUpdated({
          entityId: entry.referenceId,
          entityType: entry.entityType,
        });
      }
    },

    syncFromSource(
      state,
      action: PayloadAction<{
        referenceId: string;
        sourceData: unknown;
      }>
    ) {
      const entry = findBufferByReferenceId(state.entities, action.payload.referenceId);
      if (!entry) return;

      entry.current = cloneDeep(action.payload.sourceData);

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
      const entry = state.entities[action.payload.id];
      if (!entry) return;

      entry.referenceId = action.payload.referenceId;
      entry.current = cloneDeep(action.payload.savedData);
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
