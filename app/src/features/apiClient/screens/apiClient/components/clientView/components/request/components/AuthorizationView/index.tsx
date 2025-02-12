import { Select } from "antd";
import { isEmpty } from "lodash";
import { useCallback, useState } from "react";
import AuthorizationForm from "./AuthorizationForm";
import Description from "./Description";
import { FORM_TEMPLATE_STATIC_DATA, AUTH_SELECTOR_LABELS } from "./AuthorizationForm/formStructure";
import React from "react";
import { LABEL_TEXT } from "./authConstants";
import { AiOutlineExclamationCircle } from "@react-icons/all-files/ai/AiOutlineExclamationCircle";
import { MdClear } from "@react-icons/all-files/md/MdClear";
import { RQAPI } from "features/apiClient/types";
import { EnvironmentVariables } from "backend/environment/types";
import { HelpPanel } from "./HelpPanel";
import "./authorizationView.scss";
import { AuthConfig, Authorization } from "./types/AuthConfig";

interface Props {
  wrapperClass?: string;
  defaultValues: RQAPI.Auth;
  onAuthUpdate: (authOptions: RQAPI.Auth) => any;
  rootLevelRecord: Boolean;
  variables: EnvironmentVariables;
  authorizationViewActions?: React.ReactElement;
}

const AuthorizationView: React.FC<Props> = ({
  defaultValues,
  onAuthUpdate,
  rootLevelRecord,
  wrapperClass = "",
  variables,
  authorizationViewActions,
}) => {
  const [selectedAuthType, setSelectedAuthType] = useState<Authorization.Type>(
    defaultValues?.currentAuthType || (rootLevelRecord ? Authorization.Type.NO_AUTH : Authorization.Type.INHERIT)
  );
  const [finalAuthOptions, setFinalAuthOptions] = useState<RQAPI.Auth>({
    currentAuthType: selectedAuthType,
    authConfigStore: {},
  });

  // const getAuthOptions = (
  //   previousFormValues: Record<string, any>,
  //   currentAuthType: Authorization.Type,
  //   updatedValue?: string,
  //   updatedId?: string
  // ) => {
  //   const authOptions = {
  //     currentAuthType,
  //     [currentAuthType]: {
  //       ...previousFormValues[currentAuthType],
  //       ...(updatedId || updatedValue ? { [updatedId]: updatedValue } : {}),
  //     },
  //   };
  //   return authOptions;
  // };

  // todo: add authType here
  const onChangeHandler = useCallback(
    (authConfig: AuthConfig | null) => {
      const newAuthOptions = finalAuthOptions;
      if (selectedAuthType === Authorization.Type.NO_AUTH || selectedAuthType === Authorization.Type.INHERIT) {
        // no op so far
      } else {
        newAuthOptions.authConfigStore[selectedAuthType] = authConfig?.config;
      }
      newAuthOptions.currentAuthType = selectedAuthType;
      setFinalAuthOptions(newAuthOptions);
      onAuthUpdate(newAuthOptions);
    },
    [finalAuthOptions, onAuthUpdate, selectedAuthType]
  );

  // const debouncedOnChange = debounce(onChangeHandler, 500);

  return (
    <div className={`authorization-view ${wrapperClass}`}>
      <div className="type-of-authorization">
        <div className="form-selector">
          <label>{LABEL_TEXT.AUTHORIZATION_TYPE_LABEL}</label>
          <Select
            className="form-selector-dropdown"
            value={selectedAuthType}
            onChange={useCallback(
              (value) => {
                setSelectedAuthType(value);
                onAuthUpdate(finalAuthOptions);
              },
              [finalAuthOptions, onAuthUpdate]
            )}
            options={AUTH_SELECTOR_LABELS}
          />
          {![Authorization.Type.NO_AUTH, Authorization.Type.INHERIT].includes(selectedAuthType) && (
            <div
              className="clear-icon"
              onClick={() => {
                onAuthUpdate(finalAuthOptions);
                setSelectedAuthType(Authorization.Type.NO_AUTH);
              }}
            >
              <MdClear color="#bbbbbb" size="12px" />
              <span>{LABEL_TEXT.CLEAR}</span>
            </div>
          )}
          {authorizationViewActions}
        </div>
      </div>
      <div className="form-and-description">
        {!isEmpty(FORM_TEMPLATE_STATIC_DATA[selectedAuthType].formData) && (
          <div className="form-view">
            <p className="info-text">
              <AiOutlineExclamationCircle size={"12px"} color="#8f8f8f" />
              <span>{LABEL_TEXT.INFO_TEXT}</span>
            </p>
            <AuthorizationForm
              formData={FORM_TEMPLATE_STATIC_DATA[selectedAuthType].formData}
              formType={selectedAuthType}
              onChangeHandler={onChangeHandler}
              variables={variables}
            />
          </div>
        )}

        {!isEmpty(FORM_TEMPLATE_STATIC_DATA[selectedAuthType]?.description) ? (
          [Authorization.Type.NO_AUTH, Authorization.Type.INHERIT].includes(selectedAuthType) ? (
            <Description data={FORM_TEMPLATE_STATIC_DATA[selectedAuthType]?.description} />
          ) : (
            <HelpPanel data={FORM_TEMPLATE_STATIC_DATA[selectedAuthType]?.description} />
          )
        ) : null}
      </div>
    </div>
  );
};

export default AuthorizationView;
