import React from "react";
import { VariableScope } from "backend/environment/types";
import { Variable, checkIsSecretsVariable } from "features/apiClient/helpers/variableResolver/variableHelper";
import { SecretsFooter } from "./components/SecretsFooter";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";

export interface VariableModeConfig {
  prefix: string;
  checkFunction: (variable: Variable) => boolean;
  FooterComponent: React.FC<{ onClose?: () => void }>;
  separator: string;
}

const SecretsFooterComponent = () => <SecretsFooter showAddAlias={false} />;

const buildSpecialVariableModes = (): Record<string, VariableModeConfig> => {
  const modes: Record<string, VariableModeConfig> = {};

  // Only add secrets mode if feature is compatible
  if (isFeatureCompatible(FEATURES.SECRETS_MANAGER)) {
    modes[VariableScope.SECRETS] = {
      prefix: "secrets",
      checkFunction: checkIsSecretsVariable,
      FooterComponent: SecretsFooterComponent,
      separator: ":",
    };
  }

  // Add new variable types here:
  // if (isFeatureCompatible(FEATURES.VAULT)) {
  //   modes[VariableScope.VAULT] = {
  //     prefix: "vault",
  //     checkFunction: checkIsVaultVariable,
  //     FooterComponent: VaultFooter,
  //     separator: ":",
  //   };
  // }

  return modes;
};

export const SPECIAL_VARIABLE_MODES: Record<string, VariableModeConfig> = buildSpecialVariableModes();
