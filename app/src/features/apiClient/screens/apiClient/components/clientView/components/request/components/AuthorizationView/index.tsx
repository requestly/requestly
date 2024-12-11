import { Select } from "antd";
import { KeyValuePair, RQAPI } from "features/apiClient/types";
import { debounce, isEmpty } from "lodash";
import { useState } from "react";
import AuthorizationForm from "./AuthorizationForm";
import Description from "./Description";
import {
  AUTHORIZATION_FORM_DATA,
  AUTHORIZATION_STATIC_DATA,
  AUTHORIZATION_TYPES,
  AUTHORIZATION_TYPES_META,
} from "./authStaticData";
import React from "react";
import { appendAuthOptions } from "features/apiClient/screens/apiClient/utils";
import "./authorizationView.scss";
import { LABEL_TEXT } from "./authConstants";
import { AiOutlineExclamationCircle } from "@react-icons/all-files/ai/AiOutlineExclamationCircle";

interface Props {
  requestHeaders: KeyValuePair[];
  prefillAuthValues: {};
  updateEntry: (updaterFn: (prev: RQAPI.Entry) => RQAPI.Entry) => void;
}

const AuthorizationView: React.FC<Props> = ({ apiEntry, updateEntry, prefillAuthValues }) => {
  const [selectedForm, setSelectedForm] = useState(prefillAuthValues?.currentAuthType || AUTHORIZATION_TYPES.NO_AUTH);
  const [formValues, setFormValues] = useState<Record<string, any>>(prefillAuthValues?.authOptions || {});
  const onChangeHandler = (value: string, id: string) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [selectedForm]: {
        ...prevValues[selectedForm],
        [id]: value,
      },
    }));

    appendAuthOptions(apiEntry, updateEntry, selectedForm, formValues, value, id);
  };

  const debouncedOnChange = debounce(onChangeHandler, 500);

  return (
    <div className="authorization-view">
      <div className="type-of-authorization">
        <div className="form-selector">
          <label>{LABEL_TEXT.AUTHORIZATION_TYPE_LABEL}</label>
          <Select
            className="form-selector-dropdown"
            value={selectedForm}
            onChange={(value) => {
              setSelectedForm(value);
              if (value === AUTHORIZATION_TYPES.NO_AUTH) {
                updateEntry((prev) => ({
                  ...prev,
                  request: {
                    ...prev.request,
                    headers: prev.request.headers.filter((header) => header.type !== "auth"),
                    queryParams: prev.request.queryParams.filter((queryParam) => queryParam.type !== "auth"),
                  },
                  auth: {
                    ...prev.auth,
                    currentAuthType: value,
                  },
                }));
              }
            }}
            options={AUTHORIZATION_TYPES_META}
          />
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
              formData={AUTHORIZATION_FORM_DATA[selectedForm]}
              formType={selectedForm}
              onChangeHandler={debouncedOnChange}
              formvalues={formValues[selectedForm] || {}}
            />
          </div>
        )}
        {!isEmpty(AUTHORIZATION_STATIC_DATA[selectedForm]?.description) && (
          <Description
            data={AUTHORIZATION_STATIC_DATA[selectedForm]?.description}
            wrapperClass={`${selectedForm === AUTHORIZATION_TYPES.NO_AUTH ? "no-auth" : ""}`}
          />
        )}
      </div>
    </div>
  );
};

export default AuthorizationView;
