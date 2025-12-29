import { RQAPI, KeyValueDataType } from "features/apiClient/types";
import { create } from "zustand";

export type PathVariablesStore = {
  pathVariables: RQAPI.PathVariable[];
  isInitialized: boolean;
  setPathVariables: (pathVariables: RQAPI.PathVariable[]) => void;
  updateVariableKeys: (variableKeys: RQAPI.PathVariable["key"][]) => void;
  getPathVariables: () => RQAPI.PathVariable[];
};

export const createPathVariablesStore = (variables: RQAPI.PathVariable[]) => {
  return create<PathVariablesStore>()((set, get) => ({
    pathVariables: variables || [],
    isInitialized: false,

    setPathVariables: (pathVariables: RQAPI.PathVariable[]) => {
      set({ pathVariables });
    },

    updateVariableKeys: (variableKeys: RQAPI.PathVariable["key"][]) => {
      const currentVariables = get().pathVariables;

      // no changes needed, exit
      if (
        currentVariables.length === variableKeys.length &&
        currentVariables.every((variable, index) => variable.key === variableKeys[index])
      ) {
        return;
      }

      const existingVariablesMap = new Map(currentVariables.map((variable) => [variable.key, variable]));

      const newVariables: RQAPI.PathVariable[] = variableKeys.map((key, index) => {
        const existingVariable = existingVariablesMap.get(key);
        return existingVariable
          ? { ...existingVariable, id: index }
          : {
              id: index,
              key,
              value: "",
              description: "",
              dataType: KeyValueDataType.STRING,
            };
      });

      set({ pathVariables: newVariables });
    },
    getPathVariables: () => {
      return get().pathVariables;
    },
  }));
};
