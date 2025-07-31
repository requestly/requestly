import { createSlice, createEntityAdapter, EntityState, PayloadAction } from "@reduxjs/toolkit";
import { StorageRecord } from "@requestly/shared/types/entities/rules";
import { ReducerKeys } from "store/constants";

// type ModalName =
//   | "authModal"
//   | "deleteRulesModal"
//   | "deleteGroupModal"
//   | "duplicateRuleModal"
//   | "importRulesModal"
//   | "shareRulesModal"
//   | "renameGroupModal"
//   | "ungroupRuleModal";

// type RuleModalPayload = {
//   isActive?: boolean;
//   modalName: ModalName;
//   props?: Record<string, unknown>;
// };

// type RuleModal = Partial<Record<ModalName, RuleModalPayload>>;

export interface RulesAndGroupsState {
  records: EntityState<StorageRecord>;
}

export const storageRecordAdapter = createEntityAdapter<StorageRecord>({
  selectId: (record) => record.id,
  sortComparer: (a, b) => (a?.creationDate > b?.creationDate ? 1 : -1),
});

const initialState: RulesAndGroupsState = {
  records: storageRecordAdapter.getInitialState(),
};

const slice = createSlice({
  name: ReducerKeys.RULES,
  initialState,
  reducers: {
    addRecord: (state: RulesAndGroupsState, action: PayloadAction<any>) => {
      storageRecordAdapter.addOne(state.records, action.payload);
    },
    upsertRecord: (state: RulesAndGroupsState, action: PayloadAction<any>) => {
      storageRecordAdapter.upsertOne(state.records, action.payload);
    },
    upsertRecords: (state: RulesAndGroupsState, action: PayloadAction<any>) => {
      storageRecordAdapter.upsertMany(state.records, action.payload);
    },
    updateRecord: (state: RulesAndGroupsState, action: PayloadAction<any>) => {
      storageRecordAdapter.updateOne(state.records, action.payload);
    },
    setAllRecords: (state: RulesAndGroupsState, action: PayloadAction<any>) => {
      storageRecordAdapter.setAll(state.records, action.payload);
    },
    clearAllRecords: (state: RulesAndGroupsState, action: PayloadAction<any>) => {
      storageRecordAdapter.removeAll(state.records);
    },
  },
});

export const { actions: recordsActions, reducer: recordsReducer } = slice;
