export const AUTHORIZATION_TYPES = {
  INHERIT: "INHERIT",
  NO_AUTH: "NO_AUTH",
  API_KEY: "API_KEY",
  BEARER_TOKEN: "BEARER_TOKEN",
  BASIC_AUTH: "BASIC_AUTH",
};

export const AUTHORIZATION_TYPES_META = [
  { label: "Inherit from Parent", value: AUTHORIZATION_TYPES.INHERIT },
  { label: "No Auth", value: AUTHORIZATION_TYPES.NO_AUTH },
  { label: "API Key", value: AUTHORIZATION_TYPES.API_KEY },
  { label: "Bearer Token", value: AUTHORIZATION_TYPES.BEARER_TOKEN },
  { label: "Basic Auth", value: AUTHORIZATION_TYPES.BASIC_AUTH },
];

export const AUTHORIZATION_FORM_DATA = {
  [AUTHORIZATION_TYPES.API_KEY]: [
    { id: "key", type: "RQ_SINGLE_LINE_EDITOR", label: "Key", placeholder: "Key" },
    { id: "value", type: "RQ_SINGLE_LINE_EDITOR", label: "Value", placeholder: "Value" },
    {
      id: "addTo",
      type: "SELECT",
      label: "Add to",
      options: [
        { label: "Header", value: "HEADER" },
        { label: "Query Params", value: "QUERY" },
      ],
      defaultValue: "HEADER",
    },
  ],
  [AUTHORIZATION_TYPES.BEARER_TOKEN]: [
    { id: "bearer", type: "RQ_SINGLE_LINE_EDITOR", label: "Token", placeholder: "Token" },
  ],
  [AUTHORIZATION_TYPES.BASIC_AUTH]: [
    { id: "username", type: "RQ_SINGLE_LINE_EDITOR", label: "Username", placeholder: "Username" },
    { id: "password", type: "RQ_SINGLE_LINE_EDITOR", label: "Password", placeholder: "Password" },
  ],
};

export const AUTHORIZATION_STATIC_DATA = {
  [AUTHORIZATION_TYPES.INHERIT]: {
    description: {
      img: "/assets/media/apiClient/inherit-auth.svg",
      heading: "Inherits authorization from the parent collection.",
      subHeading: "This request will use its parent collection’s auth token when you send the request.",
    },
  },
  [AUTHORIZATION_TYPES.NO_AUTH]: {
    description: {
      img: "/assets/media/apiClient/no-auth.svg",
      heading: "No authorization type selected for this request.",
      subHeading: "Please select a authorization type above.",
    },
  },
  [AUTHORIZATION_TYPES.API_KEY]: {
    formData: AUTHORIZATION_FORM_DATA[AUTHORIZATION_TYPES.API_KEY],
    description: {
      heading: "API Key",
      subHeading:
        "API Key authentication allows you to securely send a key-value pair to the API, enabling it to verify and authorize your request.",
      externalLink: "https://docs.requestly.com/general/api-client/authorization/authorization-types#api-key",
    },
  },
  [AUTHORIZATION_TYPES.BEARER_TOKEN]: {
    formData: AUTHORIZATION_FORM_DATA[AUTHORIZATION_TYPES.BEARER_TOKEN],
    description: {
      heading: "Bearer Token",
      subHeading:
        "Bearer Tokens let you securely authenticate requests using an access key, such as a JSON Web Token (JWT).",
      externalLink: "https://docs.requestly.com/general/api-client/authorization/authorization-types#bearer-tokens",
    },
  },
  [AUTHORIZATION_TYPES.BASIC_AUTH]: {
    formData: AUTHORIZATION_FORM_DATA[AUTHORIZATION_TYPES.BASIC_AUTH],
    description: {
      heading: "Basic Auth",
      subHeading:
        "Basic Authentication lets you securely send a verified username and password with your request for verification purposes.",
      externalLink: "https://docs.requestly.com/general/api-client/authorization/authorization-types#basic-auth",
    },
  },
};
