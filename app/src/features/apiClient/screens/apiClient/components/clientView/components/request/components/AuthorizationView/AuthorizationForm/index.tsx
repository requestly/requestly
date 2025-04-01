import { Select } from "antd";
import React from "react";
import { EnvironmentVariables } from "backend/environment/types";
import { AuthForm } from "./formStructure/types";
import { AuthConfig, AuthConfigMeta, Authorization } from "../types/AuthConfig";
import { useAuthFormState } from "./hooks/useAuthFormState";
import { RQAPI } from "features/apiClient/types";
import SingleLineEditor from "features/apiClient/screens/environment/components/SingleLineEditor";

interface AuthorizationFormProps<AuthType extends AuthConfigMeta.AuthWithConfig> {
  defaultAuthValues?: RQAPI.Auth;
  formData: AuthForm.FormField[];
  formType: AuthType;
  onChangeHandler: (config: AuthConfig<AuthType> | null) => void;
  variables: EnvironmentVariables;
}

const AuthorizationForm = <AuthType extends AuthConfigMeta.AuthWithConfig>({
  defaultAuthValues,
  formData,
  formType,
  onChangeHandler,
  variables,
}: AuthorizationFormProps<AuthType>) => {
  const { formState, handleFormChange } = useAuthFormState(formType, onChangeHandler, defaultAuthValues);

  return (
    <div className="form">
      {formData.map((formField, index) => (
        <div className="field-group" key={formField.id || index}>
          <label>{formField.label}</label>
          <div className="field">
            {generateFields(formField, index, variables, formType, handleFormChange, formState[formField.id])}
          </div>
        </div>
      ))}
    </div>
  );
};

function generateFields(
  field: AuthForm.FormField,
  index: number,
  currentEnvironmentVariables: EnvironmentVariables,
  formType: Authorization.Type,
  onChangeHandler: (value: string, id: string) => void,
  value: string
) {
  switch (field.type) {
    case AuthForm.FIELD_TYPE.INPUT:
      return (
        <SingleLineEditor
          key={`${formType}-${index}`}
          className={field.className ?? ""}
          placeholder={field.placeholder}
          defaultValue={value}
          onChange={(value) => onChangeHandler(value, field.id)}
          variables={currentEnvironmentVariables}
        />
      );
    case AuthForm.FIELD_TYPE.SELECT:
      return (
        <Select
          key={`${formType}-${index}`}
          value={value}
          options={field.options}
          defaultValue={field.defaultValue}
          className={field.className ?? ""}
          onChange={(value: any) => onChangeHandler(value, field.id)}
        />
      );
    default:
      return null;
  }
}

export default React.memo(AuthorizationForm);
