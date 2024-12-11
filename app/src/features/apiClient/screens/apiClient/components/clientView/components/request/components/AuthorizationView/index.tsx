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
          <label>Authorization Type</label>
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
                  },
                }));
              }
            }}
            options={AUTHORIZATION_TYPES_META}
          />
        </div>
      </div>
      <div className="form-and-description">
        <div className="form-view">
          {!isEmpty(AUTHORIZATION_FORM_DATA[selectedForm]) && (
            <AuthorizationForm
              formData={AUTHORIZATION_FORM_DATA[selectedForm]}
              formType={selectedForm}
              onChangeHandler={onChangeHandler}
              formvalues={formValues[selectedForm] || {}}
            />
          )}
        </div>
        {!isEmpty(AUTHORIZATION_STATIC_DATA[selectedForm]?.description) && (
          <Description data={AUTHORIZATION_STATIC_DATA[selectedForm]?.description} />
        )}
      </div>
    </div>
  );
};

export default AuthorizationView;
