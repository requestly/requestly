import { Select } from "antd";
import React from "react";
import { AuthForm } from "./formStructure/types";
import { AuthConfig, AuthConfigMeta, Authorization } from "../types/AuthConfig";
import { useAuthFormState } from "./hooks/useAuthFormState";
import { RQAPI } from "features/apiClient/types";
import SingleLineEditor from "features/apiClient/screens/environment/components/SingleLineEditor";
import InfoIcon from "components/misc/InfoIcon";
import { Conditional } from "components/common/Conditional";
import { INVALID_KEY_CHARACTERS } from "features/apiClient/constants";
import { ScopedVariables, useScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";

interface AuthorizationFormProps<AuthType extends AuthConfigMeta.AuthWithConfig> {
  recordId: string;
  defaultAuthValues?: RQAPI.Auth;
  formData: AuthForm.FormField[];
  formType: AuthType;
  onChangeHandler: (config: AuthConfig<AuthType> | null) => void;
}

const addToOptions = {
  HEADER: "HEADER",
  QUERY: "QUERY",
};

const AuthorizationForm = <AuthType extends AuthConfigMeta.AuthWithConfig>({
  recordId,
  defaultAuthValues,
  formData,
  formType,
  onChangeHandler,
}: AuthorizationFormProps<AuthType>) => {
  const { formState, handleFormChange } = useAuthFormState(formType, onChangeHandler, defaultAuthValues);

  const scopedVariables = useScopedVariables(recordId);

  return (
    <div className="form">
      {formData.map((formField, index) => (
        <div className="field-group" key={formField.id || index}>
          <label>{formField.label}</label>
          <div className="field">
            {generateFields(formField, index, scopedVariables, formType, handleFormChange, formState)}
          </div>
        </div>
      ))}
    </div>
  );
};

function generateFields(
  field: AuthForm.FormField,
  index: number,
  variables: ScopedVariables,
  formType: Authorization.Type,
  onChangeHandler: (value: string, id: string) => void,
  formState: Record<string, string>
) {
  const hasInvalidCharacter = INVALID_KEY_CHARACTERS.test(formState[field.id]);
  //this is used as on mount the formState is undefinded so added a fallback
  const isHeader = (formState.addTo || addToOptions.HEADER) === addToOptions.HEADER;
  /*
  TODO: Make a component for singleLineEditor error-state to avoid repetition
  */
  switch (field.type) {
    case AuthForm.FIELD_TYPE.INPUT:
      return (
        <div
          className={`input-container ${
            hasInvalidCharacter && formType === Authorization.Type.API_KEY && field.id === "key" && isHeader
              ? "error-state"
              : ""
          }`}
        >

            <SingleLineEditor
              key={`${formType}-${index}`}
              className={field.className ?? ""}
              placeholder={field.placeholder}
              defaultValue={formState[field.id]}
              onChange={(value) => onChangeHandler(value, field.id)}
              variables={variables}
              isSecret={field.isSecret ?? false}
            />
          
          <Conditional
            condition={hasInvalidCharacter && formType === Authorization.Type.API_KEY && field.id === "key" && isHeader}
          >
            <div className="error-icon">
              <InfoIcon
                text="Invalid character used in key"
                tooltipPlacement="right"
                showArrow={false}
                style={{
                  color: "var(--requestly-color-error)",
                  fontFamily: "Material Symbols Outlined",
                }}
              />
            </div>
          </Conditional>
        </div>
      );
    case AuthForm.FIELD_TYPE.SELECT:
      return (
        <Select
          key={`${formType}-${index}`}
          value={formState[field.id]}
          options={field.options}
          defaultValue={field.defaultValue}
          className={`${field.className ?? ""} select-full`}
          onChange={(value: any) => onChangeHandler(value, field.id)}
        />
      );
    default:
      return null;
  }
}

export default React.memo(AuthorizationForm);
