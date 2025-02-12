import { Select } from "antd";
import { RQSingleLineEditor } from "features/apiClient/screens/environment/components/SingleLineEditor/SingleLineEditor";
// import { AuthFormField, SingleLineEditorField, SelectField, AuthForm.FIELD_TYPE, AuthFormData } from "./formStructure/types";
import React, { useCallback } from "react";
import { EnvironmentVariables } from "backend/environment/types";
import { AuthForm } from "./formStructure/types";
import {
  ApiKeyAuthorizationConfig,
  AuthConfig,
  Authorization,
  BasicAuthAuthorizationConfig,
  BearerTokenAuthorizationConfig,
} from "../types/AuthConfig";

interface AuthorizationFormProps {
  formData: AuthForm.FormField[];
  formType: Authorization.Type;
  onChangeHandler: (newFormConfig: AuthConfig | null) => void;
  variables: EnvironmentVariables;
}

const AuthorizationForm: React.FC<AuthorizationFormProps> = ({ formData, formType, onChangeHandler, variables }) => {
  const [formState, setFormState] = React.useState<Record<string, any>>({});
  // const [formConfig, setFormConfig] = React.useState<Authorization | null>(null);
  // const formConfig = useMemo(() => {
  //   let config;
  //   switch (formType) {
  //     case Authorization.Type.BASIC_AUTH:
  //       const { username, password } = formState;
  //       config = new BasicAuthAuthorizationConfig(username, password);
  //       break;
  //     case Authorization.Type.BEARER_TOKEN:
  //       config = new BearerTokenAuthorizationConfig(formState.bearer);
  //       break;
  //     case Authorization.Type.API_KEY:
  //       const { key, value, addTo } = formState;
  //       config = new ApiKeyAuthorizationConfig(key, value, addTo);
  //       break;
  //     default:
  //       config = null;
  //   }
  //   if(config) {
  //     if(!config.validate()) return null;
  //     onChangeHandler(config);
  //   }
  //   return config
  // }, [formType, formState])
  const onFormChange = useCallback(
    (value: string, id: string): void => {
      if (formState[id] === value) return;
      const newFormState = { ...formState, [id]: value };
      // setFormState((prev) => ({ ...prev, [id]: value }));
      let config;
      switch (formType) {
        case Authorization.Type.BASIC_AUTH: {
          const { username, password } = formState;
          config = new BasicAuthAuthorizationConfig(username, password);
          break;
        }
        case Authorization.Type.BEARER_TOKEN: {
          config = new BearerTokenAuthorizationConfig(formState.bearer);
          break;
        }
        case Authorization.Type.API_KEY: {
          const { key, value, addTo } = formState;
          config = new ApiKeyAuthorizationConfig(key, value, addTo);
          break;
        }
        default: {
          config = null;
        }
      }
      if (config) {
        if (!config.validate()) {
          onChangeHandler(null);
        } else {
          onChangeHandler(config);
        }
      }
      setFormState(newFormState);
    },
    [formState, formType, onChangeHandler]
  );

  return (
    <div className="form">
      {formData.map((formField, index) => (
        <div className="field-group" key={formField.id || index}>
          <label>{formField.label}</label>
          <div className="field">
            {generateFields(formField, index, variables, formType, onFormChange, formState[formField.id])}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuthorizationForm;

function generateFields(
  field: AuthForm.FormField,
  index: number,
  currentEnvironmentVariables: EnvironmentVariables,
  formType: string,
  onChangeHandler: (value: string, id: string) => void,
  value: any
) {
  switch (field.type) {
    case AuthForm.FIELD_TYPE.INPUT:
      return (
        <RQSingleLineEditor
          key={`${formType}-${index}`}
          className={field.className ?? ""}
          placeholder={field.placeholder}
          defaultValue={value}
          onChange={(value: any) => onChangeHandler(value, field.id)}
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
