import { createSlice, createEntityAdapter, EntityState, PayloadAction } from "@reduxjs/toolkit";
import { RuleObj } from "features/rules/types/rules";
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

export interface RulesState {
  ruleObjs: EntityState<any>;
}

export const rulesAdapter = createEntityAdapter<RuleObj>({
  selectId: (ruleObj) => ruleObj.id,
  sortComparer: (a, b) => (a?.creationDate > b?.creationDate ? 1 : -1),
});

const initialState: RulesState = {
  ruleObjs: rulesAdapter.getInitialState(),
};

const slice = createSlice({
  name: ReducerKeys.RULES,
  initialState,
  reducers: {
    ruleObjAdd: (state: RulesState, action: PayloadAction<any>) => {
      rulesAdapter.addOne(state.ruleObjs, action.payload);
    },
    ruleObjUpsert: (state: RulesState, action: PayloadAction<any>) => {
      rulesAdapter.upsertOne(state.ruleObjs, action.payload);
    },
    ruleObjUpsertMany: (state: RulesState, action: PayloadAction<any>) => {
      rulesAdapter.upsertMany(state.ruleObjs, action.payload);
    },
    ruleObjUpdate: (state: RulesState, action: PayloadAction<any>) => {
      rulesAdapter.updateOne(state.ruleObjs, action.payload);
    },
    ruleObjsSetAll: (state: RulesState, action: PayloadAction<any>) => {
      rulesAdapter.setAll(state.ruleObjs, action.payload);
    },
    ruleObjsClearAll: (state: RulesState, action: PayloadAction<any>) => {
      rulesAdapter.removeAll(state.ruleObjs);
    },
  },
});

export const { actions: rulesActions, reducer: rulesReducer } = slice;
