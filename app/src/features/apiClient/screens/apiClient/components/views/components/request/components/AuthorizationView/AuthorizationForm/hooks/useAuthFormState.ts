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

const getDefaultFormState = (
  formType: AuthConfigMeta.AuthWithConfig,
  defaultAuth?: RQAPI.Auth
): Record<string, string> => {
  if (!defaultAuth || !defaultAuth.currentAuthType) {
    // no default config passed
    return {};
  }

  if (!defaultAuth.authConfigStore || !defaultAuth.authConfigStore[formType]) {
    // happens when auth type has changed but there is no existing config values to prefill the form with
    return {};
  }
  switch (formType) {
    case Authorization.Type.BASIC_AUTH: {
      const config = defaultAuth.authConfigStore[Authorization.Type.BASIC_AUTH];
      if (!config) return {};
      const { username = "", password = "" } = config;
      return { username, password };
    }
    case Authorization.Type.BEARER_TOKEN: {
      const config = defaultAuth.authConfigStore[Authorization.Type.BEARER_TOKEN];
      if (!config) return {};
      const { bearer } = config;
      return { bearer };
    }
    case Authorization.Type.API_KEY: {
      const config = defaultAuth.authConfigStore[Authorization.Type.API_KEY];
      if (!config) return {};
      const { key, value, addTo } = config;
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
  const defaults = getDefaultFormState(formType, defaultAuth);
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

  // fix-me: Ideally the formType callback and the formstate update should be in the same place,
  // using something like zustand or contexts. Side Effect changes like these have been known to be hard to debug.
  useEffect(() => {
    const newDefaults = getDefaultFormState(formType, defaultAuth);
    setFormState((prev) => {
      return {
        ...newDefaults,
        ...prev, // Preserve any existing values in the form state
      };
    });
  }, [formType, defaultAuth]);

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
