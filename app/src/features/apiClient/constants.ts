import { Authorization } from "./screens/apiClient/components/clientView/components/request/components/AuthorizationView/types/AuthConfig";

export const CONTENT_TYPE_HEADER = "Content-Type";

export const DEMO_API_URL = "https://app.requestly.io/echo";

export const POSTMAN_AUTH_TYPES_MAPPING = {
  inherit: Authorization.Type.INHERIT,
  noauth: Authorization.Type.NO_AUTH,
  apikey: Authorization.Type.API_KEY,
  bearer: Authorization.Type.BEARER_TOKEN,
  basic: Authorization.Type.BASIC_AUTH,
};

export const POSTMAN_FIELD_MAPPING = {
  mapping: {
    in: "addTo",
    query: "QUERY",
    token: "bearer",
  },
  get(key: string): string {
    return this.mapping[key] ?? key;
  },
};

export const SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY = "expanded_record_ids";
