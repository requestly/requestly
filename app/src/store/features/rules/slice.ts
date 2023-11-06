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
type ModalName =
  | "authModal"
  | "deleteRuleModal"
  | "deleteGroupModal"
  | "duplicateRuleModal"
  | "importRulesModal"
  | "shareRulesModal"
  | "renameGroupModal"
  | "ungroupRuleModal";

type RuleModalPayload = {
  isActive?: boolean;
  modalName: ModalName;
  props?: Record<string, unknown>;
};

type RuleModal = Partial<Record<ModalName, RuleModalPayload>>;

export interface RulesState {
  ruleObjs: EntityState<any>;
  ruleActiveModals: RuleModal;
}

export const rulesAdapter = createEntityAdapter<RuleObj>({
  selectId: (ruleObj) => ruleObj.id,
  sortComparer: (a, b) => (a?.creationDate > b?.creationDate ? 1 : -1),
});

const initialState: RulesState = {
  ruleObjs: rulesAdapter.getInitialState(),
  ruleActiveModals: {},
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
    toggleRuleModal: (state: RulesState, action: PayloadAction<RuleModalPayload>) => {
      const modalName = action.payload.modalName;

      if (!state.ruleActiveModals[modalName]) {
        state.ruleActiveModals[modalName] = { isActive: false, modalName };
      }

      state.ruleActiveModals[modalName].isActive =
        action.payload.isActive ?? !state.ruleActiveModals[modalName].isActive;
      state.ruleActiveModals[modalName].props = action.payload.props ?? state.ruleActiveModals[modalName].props;
    },
  },
});

export const { actions: rulesActions, reducer: rulesReducer } = slice;
