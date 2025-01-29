import { Select } from "antd";
import { RQSingleLineEditor } from "features/apiClient/screens/environment/components/SingleLineEditor/SingleLineEditor";
import { AuthFormField, SingleLineEditorField, SelectField, AUTH_FORM_FIELD_TYPES, AuthFormData } from "./types";
import React from "react";
import { EnvironmentVariables } from "backend/environment/types";

interface AuthorizationFormProps {
  formData: AuthFormData;
  formType: string;
  onChangeHandler: (value: string, id: string) => void;
  formvalues: Record<string, any>;
  variables: EnvironmentVariables;
}

const getFields = (
  field: AuthFormField,
  index: number,
  currentEnvironmentVariables: EnvironmentVariables,
  formType: string,
  onChangeHandler: (value: string, id: string) => void,
  value: any
) => {
  const { type = "", id = "", className = "" } = field;

  switch (type) {
    case AUTH_FORM_FIELD_TYPES.INPUT:
      return (
        <RQSingleLineEditor
          key={`${formType}-${index}`}
          className={className}
          placeholder={(field as SingleLineEditorField).placeholder}
          defaultValue={value}
          onChange={(value: any) => onChangeHandler(value, id)}
          variables={currentEnvironmentVariables}
        />
      );
    case AUTH_FORM_FIELD_TYPES.SELECT:
      return (
        <Select
          key={`${formType}-${index}`}
          value={value}
          options={(field as SelectField).options}
          defaultValue={(field as SelectField).defaultValue}
          className={className}
          onChange={(value: any) => onChangeHandler(value, id)}
        />
      );
    default:
      return null;
  }
};

const AuthorizationForm: React.FC<AuthorizationFormProps> = ({
  formData,
  formType,
  onChangeHandler,
  formvalues,
  variables,
}) => {
  return (
    <div className="form">
      {formData.map((formField, index) => (
        <div className="field-group" key={formField.id || index}>
          <label>{formField.label}</label>
          <div className="field">
            {getFields(formField, index, variables, formType, onChangeHandler, formvalues[formField.id])}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuthorizationForm;
