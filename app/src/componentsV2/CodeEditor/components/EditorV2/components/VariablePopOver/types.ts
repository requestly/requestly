import React from "react";
import { EnvironmentVariableType, VariableScope, VariableValueType } from "backend/environment/types";

export enum PopoverView {
  IDLE = "idle",
  VARIABLE_INFO = "variable_info",
  NOT_FOUND = "not_found",
  CREATE_FORM = "create_form",
  EDIT_FORM = "edit_form",
}

export type FormMode = "create" | "edit";

export interface CreateVariableFormData {
  variableName: string;
  scope: VariableScope;
  type: EnvironmentVariableType;
  initialValue: VariableValueType;
  currentValue: VariableValueType;
}

export interface ScopeOption {
  value: VariableScope;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface UpsertVariableResult {
  success: boolean;
  scope: VariableScope;
  scopeName?: string;
}
