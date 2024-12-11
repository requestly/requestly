import { Select } from "antd";
import { KeyValuePair, RQAPI } from "features/apiClient/types";
import { debounce, isEmpty } from "lodash";
import { useEffect, useState } from "react";
import AuthorizationForm from "./AuthorizationForm";
import Description from "./Description";
import {
  AUTHORIZATION_FORM_DATA,
  AUTHORIZATION_STATIC_DATA,
  AUTHORIZATION_TYPES,
  AUTHORIZATION_TYPES_META,
} from "./authStaticData";
import React from "react";

interface Props {
  requestHeaders: KeyValuePair[];
  prefillAuthValues: {};
  setAuthHeaders: (updaterFn: (prev: RQAPI.Entry) => RQAPI.Entry) => void;
}

const AuthorizationView: React.FC<Props> = ({ requestHeaders, setAuthHeaders, prefillAuthValues }) => {
  const [selectedForm, setSelectedForm] = useState(prefillAuthValues?.currentAuthType || AUTHORIZATION_TYPES.NO_AUTH);
  const [formValues, setFormValues] = useState<Record<string, any>>(prefillAuthValues?.authOptions || {});
  const [requestHeadersState, updateRequestHeaders] = useState(requestHeaders);

  useEffect(() => {
    updateRequestHeaders(requestHeaders);
  }, [requestHeaders]);

  const createAuthorizationHeader = (
    type: string,
    key: string | null,
    value: string | null,
    id: string | null = null
  ) => ({
    id: Math.random(),
    key,
    value,
    type,
    isEnabled: true,
    ...(id ? { [id]: value } : {}),
  });

  const updateHeadersInState = (
    headersState: KeyValuePair[],
    type: string,
    key: string | null,
    value: string | null,
    selectortId: string | null = null
  ) => {
    const existingHeaderIndex = headersState.findIndex((header) => header.type === type);
    if (existingHeaderIndex !== -1) {
      headersState[existingHeaderIndex] = {
        ...headersState[existingHeaderIndex],
        key: key || headersState[existingHeaderIndex].key,
        value: value || headersState[existingHeaderIndex].value,
      };
    } else {
      headersState.unshift(createAuthorizationHeader(type, key, value, selectortId));
    }
  };

  const onChangeHandler = (value: string, id: string) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [selectedForm]: {
        ...prevValues[selectedForm],
        [id]: value,
      },
    }));

    const currentFormValues = { ...formValues[selectedForm], [id]: value };
    const headersState = [...requestHeadersState];

    switch (selectedForm) {
      case AUTHORIZATION_TYPES.API_KEY:
        updateHeadersInState(headersState, "auth", currentFormValues.key || "", currentFormValues.value || "");
        break;

      case AUTHORIZATION_TYPES.BEARER_TOKEN:
        updateHeadersInState(headersState, "auth", "Authorization", `Bearer ${currentFormValues.bearer}`);
        break;

      case AUTHORIZATION_TYPES.BASIC_AUTH: {
        const username = currentFormValues.username || "";
        const password = currentFormValues.password || "";
        updateHeadersInState(headersState, "auth", "Authorization", `Basic ${`${username}:${password}`}`);
        break;
      }

      default:
        break;
    }

    setAuthHeaders((prev) => ({
      ...prev,
      request: {
        ...prev.request,
        headers: headersState,
        auth: { currentAuthType: selectedForm, authOptions: formValues },
      },
    }));
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
                setAuthHeaders((prev) => ({
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
              onChangeHandler={debouncedOnChange}
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
