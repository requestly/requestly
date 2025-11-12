export interface API_KEY_FORM_VALUES {
  key: string;
  value: string;
  addTo: "HEADER" | "QUERY";
}

export interface BEARER_TOKEN_FORM_VALUES {
  bearer: string;
}

export interface BASIC_AUTH_FORM_VALUES {
  username?: string;
  password?: string;
}

export type AUTH_OPTIONS = API_KEY_FORM_VALUES | BEARER_TOKEN_FORM_VALUES | BASIC_AUTH_FORM_VALUES;
