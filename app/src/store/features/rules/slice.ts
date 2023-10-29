import { createSlice, createEntityAdapter, EntityState, PayloadAction } from "@reduxjs/toolkit";
import { RuleObj } from "features/rules/types/rules";
import { ReducerKeys } from "store/constants";

interface RulesState {
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
