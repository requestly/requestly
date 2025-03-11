import { useState, useCallback, useRef, useEffect } from "react";
import {
  Authorization,
  AuthConfig,
  BasicAuthAuthorizationConfig,
  BearerTokenAuthorizationConfig,
  ApiKeyAuthorizationConfig,
  AuthConfigMeta,
} from "../../types/AuthConfig";
import { RQAPI } from "features/apiClient/types";

const createAuthConfig = (
  formState: Record<string, string>,
  formType: AuthConfigMeta.AuthWithConfig
): AuthConfig<typeof formType> | null => {
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
      throw new Error("Invalid Auth Type");
  }
};

export const getDefaultFormState = (defaultAuth?: RQAPI.Auth): Record<string, string> => {
  if (!defaultAuth || !defaultAuth.currentAuthType) {
    // no default config passed
    return {};
  }
  if (Authorization.hasNoConfig(defaultAuth.currentAuthType)) {
    return {};
  }

  if (!defaultAuth.authConfigStore || !defaultAuth.authConfigStore[defaultAuth.currentAuthType]) {
    // happens when auth type has changed but there is no existing config values to prefill the form with
    return {};
  }
  switch (defaultAuth.currentAuthType) {
    case Authorization.Type.BASIC_AUTH: {
      const { username, password } = defaultAuth.authConfigStore[Authorization.Type.BASIC_AUTH];
      return { username, password };
    }
    case Authorization.Type.BEARER_TOKEN: {
      const { bearer } = defaultAuth.authConfigStore[Authorization.Type.BEARER_TOKEN];
      return { bearer };
    }
    case Authorization.Type.API_KEY: {
      const { key, value, addTo } = defaultAuth.authConfigStore[Authorization.Type.API_KEY];
      return { key, value, addTo };
    }
    default:
      throw new Error("Invalid Auth Type");
  }
};

export const useAuthFormState = (
  formType: AuthConfigMeta.AuthWithConfig,
  onChangeHandler: (config: AuthConfig<typeof formType> | null) => void,
  defaultAuth?: RQAPI.Auth
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
