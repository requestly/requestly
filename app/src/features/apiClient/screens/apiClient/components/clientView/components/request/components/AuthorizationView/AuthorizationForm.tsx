import { Select } from "antd";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { RQSingleLineEditor } from "features/apiClient/screens/environment/components/SingleLineEditor/SingleLineEditor";
import { AuthFormField, SingleLineEditorField, SelectField, AUTH_FORM_FIELD_TYPES } from "./types";
import React 
// ,{ useCallback } 
from "react";

interface AuthorizationFormProps {
  formData: AuthFormField[];
  formType: string;
  onChangeHandler: (value: string, id: string) => void;
  formvalues: Record<string, any>;
}

const GenerateField: React.FC<{
  formField: AuthFormField;
  index: number;
  formType: string;
  onChangeHandler: (value: string, id: string) => void;
  value: any;
}> = ({
  formField,
  index,
  formType,
  onChangeHandler,
  value
}) => {
  const { id, type, className } = formField;

  const { getCurrentEnvironmentVariables } = useEnvironmentManager();
  const currentEnvironmentVariables = getCurrentEnvironmentVariables();

  // const handleChange = useCallback((value: any) => onChangeHandler(value, id), [onChangeHandler, id]); // to-check: useCallback can be avoided here

  switch (type) {
    case AUTH_FORM_FIELD_TYPES.INPUT:
      return (
        <RQSingleLineEditor
          key={`${formType}-${index}`}
          className={className}
          placeholder={(formField as SingleLineEditorField).placeholder}
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
          options={(formField as SelectField).options}
          defaultValue={(formField as SelectField).defaultValue}
          className={className}
          onChange={(value: any) => onChangeHandler(value, id)}
        />
      );
    default:
      break;
  }

  return null;
};

const AuthorizationForm: React.FC<AuthorizationFormProps> = ({
  formData,
  formType,
  onChangeHandler,
  formvalues,
}) => {
  console.log("DBG-1: AuthorizationForm", JSON.stringify({formvalues}, null, 2));
  return (
    <div className="form">
      {formData.map((formField, index) => (
        <div className="field-group">
          <label>{formField.label}</label>
          <div className="field">
            <GenerateField
              formField={formField}
              index={index}
              formType={formType}
              onChangeHandler={onChangeHandler}
              value={formvalues[formField.id]}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuthorizationForm;
