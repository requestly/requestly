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
  setAuthHeaders: (updaterFn: (prev: RQAPI.Entry) => RQAPI.Entry) => void;
}

const AuthorizationView: React.FC<Props> = ({ requestHeaders, setAuthHeaders }) => {
  const [selectedForm, setSelectedForm] = useState("");
  const [formValues, setFormValues] = useState({});
  const [requestHeadersState, updateRequestHeaders] = useState(requestHeaders);

  useEffect(() => {
    updateRequestHeaders(requestHeaders);
  }, [requestHeaders]);

  const updateHeadersInState = (
    headersState: KeyValuePair[],
    type: string,
    key: string | null,
    value: string | null,
    id: string | null = null
  ) => {
    const existingHeader = headersState.find((header) => header.type === type);

    if (existingHeader) {
      existingHeader.key = key || existingHeader.key;
      existingHeader.value = value || existingHeader.value;
      if (id) {
        existingHeader[id] = value;
      }
    } else {
      headersState.unshift(createAuthorizationHeader(type, key, value, id));
    }
  };

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

  const onChangeHandler = (value: string, id: string) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [selectedForm]: {
        ...prevValues[selectedForm],
        [id]: value,
      },
    }));

    const headersState = [...requestHeadersState];

    switch (selectedForm) {
      case AUTHORIZATION_TYPES.API_KEY:
        updateHeadersInState(headersState, "auth", null, value, id);
        break;

      case AUTHORIZATION_TYPES.BEARER_TOKEN:
        updateHeadersInState(headersState, "auth", "Authorization", `Bearer ${value}`);
        break;

      case AUTHORIZATION_TYPES.BASIC_AUTH: {
        const existingHeaderIndex = headersState.findIndex((header) => header.type === "auth");
        let headerValue = "";

        if (existingHeaderIndex !== -1) {
          const existingHeader = headersState[existingHeaderIndex];
          const existingUsername = existingHeader.value?.split("Basic ")[1]?.split(":")[0];
          const existingPassword = existingHeader.value?.split("Basic ")[1]?.split(":")[1];
          const username = id === "username" ? value : existingUsername;
          const password = id === "password" ? value : existingPassword;
          headerValue = `Basic ${username}:${password}`;
          headersState[existingHeaderIndex] = {
            ...existingHeader,
            key: "Authorization",
            value: headerValue,
          };
        } else {
          const username = id === "username" ? value : "";
          const password = id === "password" ? value : "";
          headerValue = `Basic ${username}:${password}`;
          headersState.unshift(createAuthorizationHeader("auth", "Authorization", headerValue));
        }
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
            defaultValue={AUTHORIZATION_TYPES_META[0]}
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
              formvalues={formValues[selectedForm]}
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
