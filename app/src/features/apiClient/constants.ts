import { AUTHORIZATION_TYPES } from "./screens/apiClient/components/clientView/components/request/components/AuthorizationView/authStaticData";

export const CONTENT_TYPE_HEADER = "Content-Type";

export const DEMO_API_URL = "https://app.requestly.io/echo";

export const POSTMAN_AUTH_TYPES_MAPPING = {
  apikey: AUTHORIZATION_TYPES.API_KEY,
  bearer: AUTHORIZATION_TYPES.BEARER_TOKEN,
  basic: AUTHORIZATION_TYPES.BASIC_AUTH,
};
