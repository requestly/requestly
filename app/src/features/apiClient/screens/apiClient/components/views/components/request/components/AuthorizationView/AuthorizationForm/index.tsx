import { Select } from "antd";
import React, { useState } from "react";
import { AuthForm } from "./formStructure/types";
import { AuthConfig, AuthConfigMeta, Authorization } from "../types/AuthConfig";
import { useAuthFormState } from "./hooks/useAuthFormState";
import { RQAPI } from "features/apiClient/types";
import SingleLineEditor from "features/apiClient/screens/environment/components/SingleLineEditor";
import InfoIcon from "components/misc/InfoIcon";
import { Conditional } from "components/common/Conditional";
import { INVALID_KEY_CHARACTERS } from "features/apiClient/constants";
import { ScopedVariables, useScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import { RQButton } from "lib/design-system-v2/components";
import { RiEyeLine } from "@react-icons/all-files/ri/RiEyeLine";
import { RiEyeOffLine } from "@react-icons/all-files/ri/RiEyeOffLine";

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
  const fieldValue = formState[field.id] ?? "";
  const hasInvalidCharacter = INVALID_KEY_CHARACTERS.test(fieldValue);
  //this is used as on mount the formState is undefinded so added a fallback
  const isHeader = (formState.addTo || addToOptions.HEADER) === addToOptions.HEADER;
  /*
  TODO: Make a component for singleLineEditor error-state to avoid repetition
  */
  switch (field.type) {
    case AuthForm.FIELD_TYPE.INPUT:
      return (
        <AuthorizationInputField
          field={field}
          formType={formType}
          index={index}
          variables={variables}
          value={fieldValue}
          hasInvalidCharacter={hasInvalidCharacter}
          isHeader={isHeader}
          onChangeHandler={onChangeHandler}
        />
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

interface AuthorizationInputFieldProps {
  field: AuthForm.InputField;
  formType: Authorization.Type;
  index: number;
  variables: ScopedVariables;
  value: string;
  hasInvalidCharacter: boolean;
  isHeader: boolean;
  onChangeHandler: (value: string, id: string) => void;
}

const AuthorizationInputField: React.FC<AuthorizationInputFieldProps> = ({
  field,
  formType,
  index,
  variables,
  value,
  hasInvalidCharacter,
  isHeader,
  onChangeHandler,
}) => {
  const [isValueVisible, setIsValueVisible] = useState(false);
  const shouldShowError =
    hasInvalidCharacter && formType === Authorization.Type.API_KEY && field.id === "key" && isHeader;
  const shouldMaskValue = field.isSensitive && !isValueVisible;

  return (
    <div
      className={`input-container ${shouldShowError ? "error-state" : ""} ${
        field.isSensitive ? "sensitive-input" : ""
      }`}
    >
      <SingleLineEditor
        key={`${formType}-${index}`}
        className={`${field.className ?? ""} ${field.isSensitive ? "sensitive-auth-editor" : ""} ${
          shouldMaskValue ? "sensitive-auth-editor-masked" : ""
        }`}
        placeholder={field.placeholder}
        defaultValue={value}
        onChange={(updatedValue) => onChangeHandler(updatedValue, field.id)}
        variables={variables}
      />
      <Conditional condition={!!field.isSensitive}>
        <RQButton
          type="transparent"
          size="small"
          className="sensitive-auth-toggle-btn"
          title={isValueVisible ? "Hide value" : "Show value"}
          icon={isValueVisible ? <RiEyeOffLine /> : <RiEyeLine />}
          onClick={() => setIsValueVisible((prev) => !prev)}
        />
      </Conditional>
      <Conditional condition={shouldShowError}>
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
};

export default React.memo(AuthorizationForm);
