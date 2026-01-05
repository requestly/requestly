import { Select } from "antd";

import { useCallback, useEffect, useRef, useState } from "react";
import AuthorizationForm from "./AuthorizationForm";
import Description from "./Description";
import { FORM_TEMPLATE_STATIC_DATA, AUTH_SELECTOR_LABELS } from "./AuthorizationForm/formStructure";
import React from "react";
import { LABEL_TEXT } from "./authConstants";
import { AiOutlineExclamationCircle } from "@react-icons/all-files/ai/AiOutlineExclamationCircle";
import { MdClear } from "@react-icons/all-files/md/MdClear";
import { RQAPI } from "features/apiClient/types";
import { AuthConfig, AuthConfigMeta, Authorization } from "./types/AuthConfig";
import { getDefaultAuthType } from "./defaults";
import "./authorizationView.scss";

interface Props {
  recordId: string;
  wrapperClass?: string;
  defaults?: RQAPI.Auth;
  onAuthUpdate: (newAuth: RQAPI.Auth) => void;
  isRootLevelRecord: boolean;
  authorizationViewActions?: React.ReactElement;
}

const AuthorizationView: React.FC<Props> = ({
  recordId,
  defaults,
  onAuthUpdate,
  isRootLevelRecord,
  wrapperClass = "",
  authorizationViewActions,
}) => {
  const defaultsRef = useRef(defaults);
  const [selectedAuthType, setSelectedAuthType] = useState<Authorization.Type>(
    defaultsRef.current?.currentAuthType || getDefaultAuthType(isRootLevelRecord)
  );

  const [resolvedAuthConfigStore, setResolvedAuthConfigStore] = useState<RQAPI.Auth["authConfigStore"]>(
    defaultsRef.current?.authConfigStore
  );

  const onFormConfigChange = useCallback(
    <SelectedAuthType extends AuthConfigMeta.AuthWithConfig>(authConfig: AuthConfig<SelectedAuthType> | null) => {
      setResolvedAuthConfigStore((prevOptions) => {
        const newConfigStore = { ...prevOptions };
        if (authConfig) {
          newConfigStore[authConfig.type] = authConfig.config;
        } else {
          // Clear the config for the current auth type when validation fails
          newConfigStore[selectedAuthType] = null;
        }
        return newConfigStore;
      });
    },
    [selectedAuthType]
  );

  const handleAuthTypeChange = useCallback(
    (value: Authorization.Type) => {
      setSelectedAuthType(value);
      onAuthUpdate({
        currentAuthType: value,
        authConfigStore: resolvedAuthConfigStore,
      });
    },
    [resolvedAuthConfigStore, onAuthUpdate]
  );

  return (
    <div className={`authorization-view ${wrapperClass}`}>
      <div className="type-of-authorization">
        <div className="form-selector">
          <label>{LABEL_TEXT.AUTHORIZATION_TYPE_LABEL}</label>
          <Select
            className="form-selector-dropdown"
            value={selectedAuthType}
            onChange={handleAuthTypeChange}
            options={AUTH_SELECTOR_LABELS}
          />
          {Authorization.requiresConfig(selectedAuthType) && (
            <div
              className="clear-icon"
              onClick={() => {
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
        {Authorization.requiresConfig(selectedAuthType) && (
          <div className="form-view">
            <p className="info-text">
              <AiOutlineExclamationCircle size={"12px"} color="#8f8f8f" />
              <span>{LABEL_TEXT.INFO_TEXT}</span>
            </p>
            <AuthorizationForm
              defaultAuthValues={defaultsRef.current}
              formData={FORM_TEMPLATE_STATIC_DATA[selectedAuthType].formData}
              formType={selectedAuthType}
              onChangeHandler={onFormConfigChange}
              recordId={recordId}
            />
          </div>
        )}
        <Description data={FORM_TEMPLATE_STATIC_DATA[selectedAuthType].description} />
      </div>
    </div>
  );
};

export default AuthorizationView;
