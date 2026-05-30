import { Select } from "antd";
import React from "react";
import { RiEyeLine } from "@react-icons/all-files/ri/RiEyeLine";
import { RiEyeOffLine } from "@react-icons/all-files/ri/RiEyeOffLine";
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
  const [revealedSensitiveFields, setRevealedSensitiveFields] = React.useState<Record<string, boolean>>({});

  const scopedVariables = useScopedVariables(recordId);
  const toggleSensitiveFieldVisibility = (fieldKey: string) => {
    setRevealedSensitiveFields((prev) => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  return (
    <div className="form">
      {formData.map((formField, index) => (
        <div className="field-group" key={formField.id || index}>
          <label>{formField.label}</label>
          <div className="field">
            {generateFields(
              formField,
              index,
              scopedVariables,
              formType,
              handleFormChange,
              formState,
              revealedSensitiveFields,
              toggleSensitiveFieldVisibility
            )}
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
  formState: Record<string, string>,
  revealedSensitiveFields: Record<string, boolean>,
  toggleSensitiveFieldVisibility: (fieldKey: string) => void
) {
  const hasInvalidCharacter = INVALID_KEY_CHARACTERS.test(formState[field.id]);
  //this is used as on mount the formState is undefinded so added a fallback
  const isHeader = (formState.addTo || addToOptions.HEADER) === addToOptions.HEADER;
  const sensitiveFieldKey = `${formType}-${field.id}`;
  const isSensitiveFieldHidden = !!field.isSensitive && !revealedSensitiveFields[sensitiveFieldKey];
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
          } ${field.isSensitive ? "has-visibility-toggle" : ""}`}
        >
          <SingleLineEditor
            key={`${formType}-${index}`}
            className={`${field.className ?? ""} ${isSensitiveFieldHidden ? "sensitive-field-hidden" : ""}`}
            placeholder={field.placeholder}
            defaultValue={formState[field.id]}
            onChange={(value) => onChangeHandler(value, field.id)}
            variables={variables}
          />
          <Conditional condition={!!field.isSensitive}>
            <RQButton
              type="transparent"
              size="small"
              className="sensitive-field-toggle"
              icon={isSensitiveFieldHidden ? <RiEyeOffLine /> : <RiEyeLine />}
              aria-label={isSensitiveFieldHidden ? "Show sensitive value" : "Hide sensitive value"}
              onClick={() => toggleSensitiveFieldVisibility(sensitiveFieldKey)}
            />
          </Conditional>
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
