import noAuth from "./assets/no-auth.svg";
import inheritAuth from "./assets/inherit-auth.svg";

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
      img: inheritAuth,
      heading: "Inherits authorization from the parent collection.",
      subHeading: "This request will use its parent collection’s auth token when you send the request.",
    },
  },
  [AUTHORIZATION_TYPES.NO_AUTH]: {
    description: {
      img: noAuth,
      heading: "No authorization type selected for this request.",
      subHeading: "Please select a authorization type above.",
    },
  },
  [AUTHORIZATION_TYPES.API_KEY]: {
    formData: AUTHORIZATION_FORM_DATA[AUTHORIZATION_TYPES.API_KEY],
    description: {
      heading: "API Key",
      subHeading:
        "API Key authentication allows you to send a key-value pair to the API for verification. Here’s how to set it up:",
      note: "Store your key in a variable for enhanced security.",
      externalLink: "https://docs.requestly.com/general/api-client/authorization/authorization-types#api-key",
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
        "Bearer tokens enable requests to authenticate using an access key, such as a JSON Web Token (JWT). The token is a text string, included in the request header. Here’s how to set it up:",
      note: "Store your key in a variable for enhanced security.",
      externalLink: "https://docs.requestly.com/general/api-client/authorization/authorization-types#bearer-tokens",
      steps: [
        { value: "In the Authorization tab, choose Bearer Token from the dropdown." },
        { value: "Enter your token value in the token field." },
      ],
    },
  },
  [AUTHORIZATION_TYPES.BASIC_AUTH]: {
    formData: AUTHORIZATION_FORM_DATA[AUTHORIZATION_TYPES.BASIC_AUTH],
    description: {
      heading: "Basic Auth",
      subHeading:
        "Basic authentication involves sending a verified username and password with your request. In the request Authorization tab, select Basic Auth from the Auth Type dropdown list. Here’s how to set it up:",
      note: "Store your key in a variable for enhanced security.",
      externalLink: "https://docs.requestly.com/general/api-client/authorization/authorization-types#basic-auth",
      steps: [
        { value: "In the Authorization tab, choose Basic Auth from the dropdown." },
        { value: "Enter your API username in username field" },
        { value: "Enter your API password in password field" },
      ],
    },
  },
};
