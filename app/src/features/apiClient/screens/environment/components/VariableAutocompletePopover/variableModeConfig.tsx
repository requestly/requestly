import React from "react";
import { VariableScope } from "backend/environment/types";
import { Variable, checkIsSecretsVariable } from "features/apiClient/helpers/variableResolver/variableHelper";
import { SecretsFooter } from "./components/SecretsFooter";

export interface VariableModeConfig {
  prefix: string;
  checkFunction: (variable: Variable) => boolean;
  FooterComponent: React.FC<{ onClose?: () => void }>;
  separator: string;
}

export const SPECIAL_VARIABLE_MODES: Record<string, VariableModeConfig> = {
  [VariableScope.SECRETS]: {
    prefix: "secrets",
    checkFunction: checkIsSecretsVariable,
    FooterComponent: SecretsFooter,
    separator: ":",
  },
  // Add new variable types here:
  // [VariableScope.VAULT]: {
  //   prefix: "vault",
  //   checkFunction: checkIsVaultVariable,
  //   FooterComponent: VaultFooter,
  // },
};
