import { AuthFormData, AuthStaticData, AUTHORIZATION_TYPES, AUTH_FORM_FIELD_TYPES } from "./types";

export const AUTHORIZATION_TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: "No Auth", value: AUTHORIZATION_TYPES.NO_AUTH },
  { label: "API Key", value: AUTHORIZATION_TYPES.API_KEY },
  { label: "Bearer Token", value: AUTHORIZATION_TYPES.BEARER_TOKEN },
  { label: "Basic Auth", value: AUTHORIZATION_TYPES.BASIC_AUTH },
];

export const AUTHORIZATION_FORM_DATA: AuthFormData = {
  [AUTHORIZATION_TYPES.NO_AUTH]: [],
  [AUTHORIZATION_TYPES.API_KEY]: [
    { id: "key", type: AUTH_FORM_FIELD_TYPES.INPUT, label: "Key", placeholder: "Key" },
    { id: "value", type: AUTH_FORM_FIELD_TYPES.INPUT, label: "Value", placeholder: "Value" },
    {
      id: "addTo",
      type: AUTH_FORM_FIELD_TYPES.SELECT,
      label: "Add to",
      options: [
        { label: "Header", value: "HEADER" },
        { label: "Query Params", value: "QUERY" },
      ],
      defaultValue: "HEADER",
    },
  ],
  [AUTHORIZATION_TYPES.BEARER_TOKEN]: [
    { id: "bearer", type: AUTH_FORM_FIELD_TYPES.INPUT, label: "Token", placeholder: "Token" },
  ],
  [AUTHORIZATION_TYPES.BASIC_AUTH]: [
    { id: "username", type: AUTH_FORM_FIELD_TYPES.INPUT, label: "Username", placeholder: "Username" },
    { id: "password", type: AUTH_FORM_FIELD_TYPES.INPUT, label: "Password", placeholder: "Password" },
  ],
};

export const AUTHORIZATION_STATIC_DATA: AuthStaticData = {
  [AUTHORIZATION_TYPES.NO_AUTH]: null,
  [AUTHORIZATION_TYPES.API_KEY]: {
    formData: AUTHORIZATION_FORM_DATA[AUTHORIZATION_TYPES.API_KEY],
    description: {
      heading: "API Key",
      subHeading:
        "API Key authentication allows you to send a key-value pair to the API for verification. Here’s how to set it up:",
      steps: [
        { value: "In the Authorization tab, choose API Key from the dropdown." },
        { value: "Enter your key name and value in the respective fields." },
        {
          value: "Choose where to include the key:",
          steps: [
            { value: "Header: Adds the key to the request headers." },
            { value: "Query Params: Adds the key as a query parameter." },
          ],
        },
      ],
    },
  },
  [AUTHORIZATION_TYPES.BEARER_TOKEN]: {
    formData: AUTHORIZATION_FORM_DATA[AUTHORIZATION_TYPES.BEARER_TOKEN],
    description: {
      heading: "Bearer Token",
      subHeading:
        "API Key authentication allows you to send a key-value pair to the API for verification. Here’s how to set it up:",
      steps: [
        { value: "In the Authorization tab, choose API Key from the dropdown." },
        { value: "Enter your key name and value in the respective fields." },
        {
          value: "Choose where to include the key:",
          steps: [
            { value: "Header: Adds the key to the request headers." },
            { value: "Query Params: Adds the key as a query parameter." },
          ],
        },
      ],
    },
  },
  [AUTHORIZATION_TYPES.BASIC_AUTH]: {
    formData: AUTHORIZATION_FORM_DATA[AUTHORIZATION_TYPES.BASIC_AUTH],
    description: {
      heading: "Basic Auth",
      subHeading:
        "API Key authentication allows you to send a key-value pair to the API for verification. Here’s how to set it up:",
      steps: [
        { value: "In the Authorization tab, choose API Key from the dropdown." },
        { value: "Enter your key name and value in the respective fields." },
        {
          value: "Choose where to include the key:",
          steps: [
            { value: "Header: Adds the key to the request headers." },
            { value: "Query Params: Adds the key as a query parameter." },
          ],
        },
      ],
    },
  },
};
