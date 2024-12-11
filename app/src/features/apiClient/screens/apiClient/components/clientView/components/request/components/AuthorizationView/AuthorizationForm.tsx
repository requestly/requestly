import { Select } from "antd";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { RQSingleLineEditor } from "features/apiClient/screens/environment/components/SingleLineEditor/SingleLineEditor";
import { AuthFormField, SingleLineEditorField, SelectField, AUTH_FORM_FIELD_TYPES } from "./types";
import React from "react";

interface AuthorizationFormProps {
  formData: AuthFormField[];
  formType: string;
  onChangeHandler: (value: string, id: string) => void;
  formvalues: Record<string, any>;
}

const getFields = (
  field: AuthFormField,
  index: number,
  currentEnvironmentVariables: any,
  formType: string,
  onChangeHandler: (value: string, id: string) => void,
  value: any
) => {
  const { id, type, className } = field;

  switch (type) {
    case AUTH_FORM_FIELD_TYPES.INPUT:
      return (
        <RQSingleLineEditor
          key={`${formType}-${index}`}
          className={className}
          placeholder={(field as SingleLineEditorField).placeholder}
          defaultValue={value}
          onChange={(value) => onChangeHandler(value, id)}
          variables={currentEnvironmentVariables}
        />
      );
    case AUTH_FORM_FIELD_TYPES.SELECT:
      return (
        <Select
          value={value}
          options={(field as SelectField).options}
          defaultValue={(field as SelectField).defaultValue}
          className={className}
          onChange={(value) => onChangeHandler(value, id)}
        />
      );
    default:
      break;
  }
};

const AuthorizationForm: React.FC<AuthorizationFormProps> = ({
  formData = [],
  formType = "",
  onChangeHandler,
  formvalues = {},
}) => {
  const { getCurrentEnvironmentVariables } = useEnvironmentManager();
  const currentEnvironmentVariables = getCurrentEnvironmentVariables();

  return (
    <div className="form">
      {formData.map((formField, index) => (
        <div className="field-group">
          <label>{formField.label}</label>
          <div className="field">
            {getFields(
              formField,
              index,
              currentEnvironmentVariables,
              formType,
              onChangeHandler,
              formvalues[formField.id]
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuthorizationForm;
