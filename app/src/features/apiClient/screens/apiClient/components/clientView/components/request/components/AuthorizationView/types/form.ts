import { AUTHORIZATION_TYPES } from ".";

interface API_KEY_FORM_VALUES {
  key: string;
  value: string;
}

interface BEARER_TOKEN_FORM_VALUES {
  bearer: string;
}

interface BASIC_AUTH_FORM_VALUES {
  username: string;
  password: string;
}

export interface AUTH_OPTIONS {
  [AUTHORIZATION_TYPES.NO_AUTH]: null;
  [AUTHORIZATION_TYPES.API_KEY]: API_KEY_FORM_VALUES;
  [AUTHORIZATION_TYPES.BEARER_TOKEN]: BEARER_TOKEN_FORM_VALUES;
  [AUTHORIZATION_TYPES.BASIC_AUTH]: BASIC_AUTH_FORM_VALUES;
}
