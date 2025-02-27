import { Select } from "antd";
import { debounce, isEmpty } from "lodash";
import { useState } from "react";
import AuthorizationForm from "./AuthorizationForm";
import Description from "./Description";
import { AUTHORIZATION_FORM_DATA, AUTHORIZATION_STATIC_DATA, AUTHORIZATION_TYPES_META } from "./authStaticData";
import React from "react";
import { LABEL_TEXT } from "./authConstants";
import { AiOutlineExclamationCircle } from "@react-icons/all-files/ai/AiOutlineExclamationCircle";
import { MdClear } from "@react-icons/all-files/md/MdClear";
import { AUTHORIZATION_TYPES } from "./types";
import { AUTH_OPTIONS } from "./types/form";
import { RQAPI } from "features/apiClient/types";
import { EnvironmentVariables } from "backend/environment/types";
import { HelpPanel } from "./HelpPanel";
import { ReadOnlyModeAlert } from "../../../ReadOnlyModeAlert/ReadOnlyModeAlert";
import "./authorizationView.scss";

interface Props {
  isReadRole: boolean;
  wrapperClass?: string;
  defaultValues: {
    currentAuthType?: AUTHORIZATION_TYPES;
    authOptions?: AUTH_OPTIONS;
  };
  onAuthUpdate: (authOptions: RQAPI.AuthOptions) => any;
  rootLevelRecord: Boolean;
  variables: EnvironmentVariables;
  authorizationViewActions?: React.ReactNode;
}

const AuthorizationView: React.FC<Props> = ({
  isReadRole,
  defaultValues,
  onAuthUpdate,
  rootLevelRecord,
  wrapperClass = "",
  variables,
  authorizationViewActions,
}) => {
  const [selectedForm, setSelectedForm] = useState(
    defaultValues?.currentAuthType || (rootLevelRecord ? AUTHORIZATION_TYPES.NO_AUTH : AUTHORIZATION_TYPES.INHERIT)
  );
  const [formValues, setFormValues] = useState<Record<string, any>>(defaultValues || {});
  const [showReadOnlyAlert, setShowReadOnlyAlert] = useState(false);

  const getAuthOptions = (
    previousFormValues: Record<string, any>,
    currentAuthType: AUTHORIZATION_TYPES,
    updatedValue?: string,
    updatedId?: string
  ) => {
    const authOptions = {
      currentAuthType,
      [currentAuthType]: {
        ...previousFormValues[currentAuthType],
        ...(updatedId || updatedValue ? { [updatedId]: updatedValue } : {}),
      },
    };
    return authOptions;
  };

  const onChangeHandler = (value: string, id: string) => {
    setFormValues((prevValues) => {
      onAuthUpdate(getAuthOptions(prevValues, selectedForm, value, id));
      return {
        ...prevValues,
        [selectedForm]: {
          ...prevValues[selectedForm],
          [id]: value,
        },
      };
    });
  };

  const debouncedOnChange = debounce(onChangeHandler, 500);

  return (
    <>
      {showReadOnlyAlert && (
        <ReadOnlyModeAlert description="Your changes will not be saved. As a viewer, you can modify and test the APIs, but saving your updates is not permitted." />
      )}

      <div className={`authorization-view ${wrapperClass} ${isReadRole ? "read-only" : ""}`}>
        <div className="type-of-authorization">
          <div className="form-selector">
            <label>{LABEL_TEXT.AUTHORIZATION_TYPE_LABEL}</label>
            <Select
              className="form-selector-dropdown"
              value={selectedForm}
              onChange={(value) => {
                if (isReadRole) {
                  setShowReadOnlyAlert(true);
                }

                setSelectedForm(value);
                onAuthUpdate(getAuthOptions(formValues, value));
              }}
              options={AUTHORIZATION_TYPES_META}
            />
            {![AUTHORIZATION_TYPES.NO_AUTH, AUTHORIZATION_TYPES.INHERIT].includes(selectedForm) && (
              <div
                className="clear-icon"
                onClick={() => {
                  if (isReadRole) {
                    setShowReadOnlyAlert(true);
                  }

                  onAuthUpdate(getAuthOptions(formValues, AUTHORIZATION_TYPES.NO_AUTH));
                  setSelectedForm(AUTHORIZATION_TYPES.NO_AUTH);
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
          {!isEmpty(AUTHORIZATION_FORM_DATA[selectedForm]) && (
            <div className="form-view">
              <p className="info-text">
                <AiOutlineExclamationCircle size={"12px"} color="#8f8f8f" />
                <span>{LABEL_TEXT.INFO_TEXT}</span>
              </p>
              <AuthorizationForm
                formData={AUTHORIZATION_FORM_DATA[selectedForm] || []}
                formType={selectedForm}
                onChangeHandler={(value: string, id: string) => {
                  if (isReadRole) {
                    setShowReadOnlyAlert(true);
                  }

                  debouncedOnChange(value, id);
                }}
                formvalues={formValues[selectedForm] || {}}
                variables={variables}
              />
            </div>
          )}

          {!isEmpty(AUTHORIZATION_STATIC_DATA[selectedForm]?.description) ? (
            [AUTHORIZATION_TYPES.NO_AUTH, AUTHORIZATION_TYPES.INHERIT].includes(selectedForm) ? (
              <Description data={AUTHORIZATION_STATIC_DATA[selectedForm]?.description} />
            ) : (
              <HelpPanel data={AUTHORIZATION_STATIC_DATA[selectedForm]?.description} />
            )
          ) : null}
        </div>
      </div>
    </>
  );
};

export default AuthorizationView;
