import { VariableScope } from "@requestly/shared/types/entities/apiClient";

export interface SecretVariable {
  name: string;
  value: string;
  id: string;
  scope: VariableScope.SECRETS;
}
