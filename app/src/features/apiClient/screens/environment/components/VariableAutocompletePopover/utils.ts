import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";

export const parseVariables = (variables: ScopedVariables) => {
  if (!variables) return [];
  const flattened = Object.entries(variables).map(([label, arr]) => ({
    label,
    ...Object.assign({}, ...arr),
  }));
  return flattened;
};
