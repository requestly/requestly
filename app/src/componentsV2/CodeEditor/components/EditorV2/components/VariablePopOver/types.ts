import React from "react";
import { EnvironmentVariableType, VariableScope } from "backend/environment/types";

export enum PopoverView {
  VARIABLE_INFO = "variable_info",
  NOT_FOUND = "not_found",
  CREATE_FORM = "create_form",
}

export interface CreateVariableFormData {
  variableName: string;
  scope: VariableScope;
  type: EnvironmentVariableType;
  initialValue: string;
  currentValue: string;
}

export interface ScopeOption {
  value: VariableScope;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface VariableNotFoundProps {
  onCreateClick: () => void;
  onSwitchEnvironment: () => void;
}

export interface CreateVariableViewProps {
  variableName: string;
  onCancel: () => void;
  onSave: (data: CreateVariableFormData) => Promise<void>;
  collectionId?: string;
}
