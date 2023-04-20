import { RecordsState, RecordsActionType, RecordsAction } from "./types";

export const recordsInitialState: RecordsState = { rules: {}, groups: {} };

export const recordsReducer = (prevState: RecordsState, { type, payload }: RecordsAction): RecordsState => {
  switch (type) {
    case RecordsActionType.INITIALIZE_RULES_AND_GROUPS: {
      return {
        ...prevState,
        rules: payload.rules.reduce((rules, rule) => ({ ...rules, [rule.id]: rule }), {}),
        groups: payload.groups.reduce((groups, group) => ({ ...groups, [group.id]: group }), {}),
      };
    }

    case RecordsActionType.UPDATE_RULE: {
      const rule = prevState.rules[payload.rule.id];

      return {
        ...prevState,
        rules: {
          ...prevState.rules,
          [payload.rule.id]:
            rule.isFavourite && rule.isFavourite !== payload.rule.isFavourite && payload.isUpdateFromPinnedRecords
              ? { ...payload.rule, isRemoved: rule.isFavourite }
              : { ...payload.rule },
        },
      };
    }

    case RecordsActionType.UPDATE_GROUP: {
      const group = prevState.groups[payload.id];

      return {
        ...prevState,
        groups: {
          ...prevState.groups,
          [payload.id]:
            group.isFavourite && group.isFavourite !== payload.isFavourite
              ? { ...payload, isRemoved: group.isFavourite }
              : { ...payload },
        },
      };
    }

    default:
      throw Error(`${type} action type not found!`);
  }
};
