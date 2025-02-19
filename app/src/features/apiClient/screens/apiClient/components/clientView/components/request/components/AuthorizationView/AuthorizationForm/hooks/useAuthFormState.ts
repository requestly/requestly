import { useState, useCallback, useRef, useEffect } from "react";
import {
  Authorization,
  AuthConfig,
  BasicAuthAuthorizationConfig,
  BearerTokenAuthorizationConfig,
  ApiKeyAuthorizationConfig,
} from "../../types/AuthConfig";
import { RQAPI } from "features/apiClient/types";

const createAuthConfig = (formState: Record<string, string>, formType: Authorization.Type): AuthConfig | null => {
  switch (formType) {
    case Authorization.Type.BASIC_AUTH: {
      const { username, password } = formState;
      return new BasicAuthAuthorizationConfig(username, password);
    }
    case Authorization.Type.BEARER_TOKEN: {
      return new BearerTokenAuthorizationConfig(formState.bearer);
    }
    case Authorization.Type.API_KEY: {
      const { key, value, addTo } = formState;
      return new ApiKeyAuthorizationConfig(key, value, addTo as Authorization.API_KEY_CONFIG["addTo"]);
    }
    default:
      return null;
  }
};

export const getDefaultFormState = (defaultConfig: RQAPI.Auth): Record<string, string> => {
  switch (defaultConfig.currentAuthType) {
    case Authorization.Type.BASIC_AUTH: {
      const { username, password } = defaultConfig.authConfigStore[Authorization.Type.BASIC_AUTH];
      return { username, password };
    }
    case Authorization.Type.BEARER_TOKEN: {
      const { bearer } = defaultConfig.authConfigStore[Authorization.Type.BEARER_TOKEN];
      return { bearer };
    }
    case Authorization.Type.API_KEY: {
      const { key, value, addTo } = defaultConfig.authConfigStore[Authorization.Type.API_KEY];
      return { key, value, addTo };
    }
    default:
      return {};
  }
};

export const useAuthFormState = (
  defaultAuth: RQAPI.Auth,
  formType: Authorization.Type,
  onChangeHandler: (config: AuthConfig | null) => void
) => {
  const defaults = getDefaultFormState(defaultAuth);
  const [formState, setFormState] = useState<Record<string, string>>(defaults ?? {});

  // Use ref to avoid closure issues with onChangeHandler
  const onChangeHandlerRef = useRef(onChangeHandler);
  useEffect(() => {
    onChangeHandlerRef.current = onChangeHandler;
  }, [onChangeHandler]);

  useEffect(() => {
    const newConfig = createAuthConfig(formState, formType);
    console.log("DBG: useAuthFormState: useEffect: newConfig: ", newConfig);
    console.log("DBG: useAuthFormState: useEffect: formState: ", newConfig.type);
    onChangeHandlerRef.current(newConfig?.validate() ? newConfig : null);
  }, [formState, formType]);

  const handleFormChange = useCallback(
    (value: string, id: string) => {
      if (formState[id] === value) return;

      setFormState((prev) => ({
        ...prev,
        [id]: value,
      }));
    },
    [formState]
  );

  return {
    formState,
    handleFormChange,
  };
};
