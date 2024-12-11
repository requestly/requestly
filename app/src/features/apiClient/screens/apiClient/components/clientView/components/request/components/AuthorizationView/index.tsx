import { Select } from "antd";
import { KeyValuePair, RQAPI } from "features/apiClient/types";
import { debounce } from "lodash";
import { useCallback, useEffect, useState } from "react";
import AuthorizationForm from "./AuthorizationForm";
import Description from "./Description";
import { AUTHORIZATION_FORM_DATA, AUTHORIZATION_STATIC_DATA, AUTHORIZATION_TYPE_OPTIONS } from "./authStaticData";
import React from "react";
import { AUTH_ENTRY_IDENTIFIER, AUTHORIZATION_TYPES } from "./types";
import NoAuthBanner from "./NoAuthBanner";
import { AUTH_OPTIONS } from "./types/form";

interface AuthorizationViewProps {
  requestHeaders: KeyValuePair[];
  prefillAuthValues: {
    currentAuthType?: AUTHORIZATION_TYPES;
    authOptions?: AUTH_OPTIONS; // todo: could be empty, need to check // also need to add inherit from parent later
  };
  setRequestEntry: (updaterFn: (prev: RQAPI.Entry) => RQAPI.Entry) => void;
}

const AuthorizationView: React.FC<AuthorizationViewProps> = ({
  requestHeaders,
  setRequestEntry,
  prefillAuthValues,
}) => {
  const [selectedForm, setSelectedForm] = useState(prefillAuthValues?.currentAuthType || AUTHORIZATION_TYPES.NO_AUTH);
  const [formValues, setFormValues] = useState<AUTH_OPTIONS>(prefillAuthValues?.authOptions);
  const [requestHeadersState, updateRequestHeaders] = useState(requestHeaders);

  useEffect(() => {
    updateRequestHeaders(requestHeaders);
  }, [requestHeaders]);

  const onChangeHandler = useCallback(
    (value: string, id: string) => {
      console.log("DBG: onChangeHandler", value, id);
      setFormValues((prevValues) => ({
        ...prevValues,
        [selectedForm]: {
          ...prevValues[selectedForm],
          [id]: value,
        },
      }));

      let currentFormValues; // fix-me: have to define it this way to avoid type inference issues
      const headersState = [...requestHeadersState];

      switch (selectedForm) {
        case AUTHORIZATION_TYPES.API_KEY:
          currentFormValues = { ...formValues[selectedForm], [id]: value };
          updateHeadersInState(headersState, currentFormValues.key || "", currentFormValues.value || "");
          break;

        case AUTHORIZATION_TYPES.BEARER_TOKEN:
          currentFormValues = { ...formValues[selectedForm], [id]: value };
          updateHeadersInState(headersState, "Authorization", `Bearer ${currentFormValues.bearer}`);
          break;

        case AUTHORIZATION_TYPES.BASIC_AUTH: {
          currentFormValues = { ...formValues[selectedForm], [id]: value };
          const username = currentFormValues.username || "";
          const password = currentFormValues.password || "";
          updateHeadersInState(headersState, "Authorization", `Basic ${`${username}:${password}`}`);
          break;
        }

        default:
          break;
      }

      function updateHeadersInState(
        headersState: KeyValuePair[],
        key: string | null,
        value: string | null,
        selectortId: string | null = null
      ) {
        const existingHeaderIndex = headersState.findIndex((header) => header.type === AUTH_ENTRY_IDENTIFIER);
        if (existingHeaderIndex !== -1) {
          headersState[existingHeaderIndex] = {
            ...headersState[existingHeaderIndex],
            key: key || headersState[existingHeaderIndex].key,
            value: value || headersState[existingHeaderIndex].value,
          };
        } else {
          headersState.unshift(createAuthorizationHeader(key, value, selectortId));
        }

        setRequestEntry((prev) => ({
          ...prev,
          request: {
            ...prev.request,
            headers: headersState,
            auth: { currentAuthType: selectedForm, authOptions: formValues },
          },
        }));
      }

      function createAuthorizationHeader(key: string | null, value: string | null, id: string | null = null) {
        return {
          id: Math.random(),
          key,
          value,
          type: AUTH_ENTRY_IDENTIFIER,
          isEnabled: true,
          ...(id ? { [id]: value } : {}),
        };
      }
    },
    [formValues, requestHeadersState, selectedForm, setRequestEntry]
  );

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
                setRequestEntry((prev) => ({
                  ...prev,
                  request: {
                    ...prev.request,
                    headers: prev.request.headers.filter((header) => header.type !== "auth"),
                    auth: { currentAuthType: AUTHORIZATION_TYPES.NO_AUTH },
                  },
                }));
              }
            }}
            options={AUTHORIZATION_TYPE_OPTIONS}
          />
        </div>
      </div>
      <div className="form-and-description">
        {selectedForm === AUTHORIZATION_TYPES.NO_AUTH ? (
          <NoAuthBanner />
        ) : (
          <>
            <div className="form-view">
              <AuthorizationForm
                formData={AUTHORIZATION_FORM_DATA[selectedForm]}
                formType={selectedForm}
                onChangeHandler={debouncedOnChange}
                formvalues={formValues[selectedForm]}
              />
            </div>
            <Description data={AUTHORIZATION_STATIC_DATA[selectedForm]?.description} />
          </>
        )}
      </div>
    </div>
  );
};

export default AuthorizationView;
