import { RQAPI } from "features/apiClient/types";
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

      const existingVariablesMap = new Map(currentVariables.map((variable) => [variable.key, variable]));

      const newVariables: RQAPI.PathVariable[] = variableKeys.map((key, index) => {
        const existingVariable = existingVariablesMap.get(key);
        return (
          existingVariable || {
            id: index,
            key,
            value: "",
            description: "",
          }
        );
      });

      set({ pathVariables: newVariables });
    },
    getPathVariables: () => {
      return get().pathVariables;
    },
  }));
};
