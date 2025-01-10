import { AUTHORIZATION_TYPES } from "./screens/apiClient/components/clientView/components/request/components/AuthorizationView/authStaticData";

export const CONTENT_TYPE_HEADER = "Content-Type";

export const DEMO_API_URL = "https://app.requestly.io/echo";

export const POSTMAN_AUTH_TYPES_MAPPING = {
  inherit: AUTHORIZATION_TYPES.INHERIT,
  noauth: AUTHORIZATION_TYPES.NO_AUTH,
  apikey: AUTHORIZATION_TYPES.API_KEY,
  bearer: AUTHORIZATION_TYPES.BEARER_TOKEN,
  basic: AUTHORIZATION_TYPES.BASIC_AUTH,
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

export const SESSION_STORAGE_ACTIVE_COLLECTIONS_KEY = "active_collection_keys";
