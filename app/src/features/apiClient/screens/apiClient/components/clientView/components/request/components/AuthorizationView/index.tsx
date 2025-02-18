import { Select } from "antd";
import { isEmpty } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
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
  defaults?: RQAPI.Auth;
  onAuthUpdate: (newAuth: RQAPI.Auth) => void;
  isRootLevelRecord: Boolean;
  variables: EnvironmentVariables;
  authorizationViewActions?: React.ReactElement;
}

const AuthorizationView: React.FC<Props> = ({
  defaults,
  onAuthUpdate,
  isRootLevelRecord,
  wrapperClass = "",
  variables,
  authorizationViewActions,
}) => {
  const defaultsRef = useRef(defaults);
  const [selectedAuthType, setSelectedAuthType] = useState<Authorization.Type>(
    defaultsRef.current?.currentAuthType ||
      (isRootLevelRecord ? Authorization.Type.NO_AUTH : Authorization.Type.INHERIT)
  );

  const [resolvedAuthConfigStore, setResolvedAuthConfigStore] = useState<RQAPI.Auth["authConfigStore"]>(
    defaultsRef.current?.authConfigStore
  );

  const onFormConfigChange = useCallback((authConfig: AuthConfig | null) => {
    setResolvedAuthConfigStore((prevOptions) => {
      const newConfigStore = { ...prevOptions };
      if (authConfig.type !== Authorization.Type.NO_AUTH && authConfig.type !== Authorization.Type.INHERIT) {
        newConfigStore[authConfig.type] = authConfig.config;
      }
      return newConfigStore;
    });
  }, []);

  const handleAuthTypeChange = useCallback((value: Authorization.Type) => {
    setSelectedAuthType(value);
  }, []);

  useEffect(() => {
    // for some reason there is a re render outside this component that sends an empty defaults object
    if (defaultsRef.current) {
      onAuthUpdate({
        currentAuthType: selectedAuthType,
        authConfigStore: resolvedAuthConfigStore,
      } as RQAPI.Auth);
    }
  }, [selectedAuthType, resolvedAuthConfigStore, onAuthUpdate]);

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
          {![Authorization.Type.NO_AUTH, Authorization.Type.INHERIT].includes(selectedAuthType) && (
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
        {!isEmpty(FORM_TEMPLATE_STATIC_DATA[selectedAuthType].formData) && (
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
