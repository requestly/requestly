import noAuth from "./assets/no-auth.svg";

export const AUTHORIZATION_TYPES = {
  NO_AUTH: "NO_AUTH",
  API_KEY: "API_KEY",
  BEARER_TOKEN: "BEARER_TOKEN",
  BASIC_AUTH: "BASIC_AUTH",
};

export const AUTHORIZATION_TYPES_META = [
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
      externalLink: "https://app.requestly.io/",
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
      note: "Store your key in a variable for enhanced security.",
      externalLink: "https://app.requestly.io/",
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
      note: "Store your key in a variable for enhanced security.",
      externalLink: "https://app.requestly.io/",
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
