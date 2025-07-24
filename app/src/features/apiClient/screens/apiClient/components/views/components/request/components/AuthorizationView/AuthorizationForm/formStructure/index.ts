import { AuthConfigMeta, Authorization } from "../../types/AuthConfig";
import { AuthForm } from "./types";

export const AUTH_SELECTOR_LABELS = [
  { label: "Inherit from Parent", value: Authorization.Type.INHERIT },
  { label: "No Auth", value: Authorization.Type.NO_AUTH },
  { label: "API Key", value: Authorization.Type.API_KEY },
  { label: "Bearer Token", value: Authorization.Type.BEARER_TOKEN },
  { label: "Basic Auth", value: Authorization.Type.BASIC_AUTH },
];

const FORM_FIELDS_LAYOUT: Record<AuthConfigMeta.AuthWithConfig, AuthForm.FormField[]> = {
  [Authorization.Type.API_KEY]: [
    { id: "key", type: AuthForm.FIELD_TYPE.INPUT, label: "Key", placeholder: "Key" },
    { id: "value", type: AuthForm.FIELD_TYPE.INPUT, label: "Value", placeholder: "Value" },
    {
      id: "addTo",
      type: AuthForm.FIELD_TYPE.SELECT,
      label: "Add to",
      options: [
        { label: "Header", value: "HEADER" },
        { label: "Query Params", value: "QUERY" },
      ],
      defaultValue: "HEADER",
    },
  ],
  [Authorization.Type.BEARER_TOKEN]: [
    { id: "bearer", type: AuthForm.FIELD_TYPE.INPUT, label: "Token", placeholder: "Token" },
  ],
  [Authorization.Type.BASIC_AUTH]: [
    { id: "username", type: AuthForm.FIELD_TYPE.INPUT, label: "Username", placeholder: "Username" },
    { id: "password", type: AuthForm.FIELD_TYPE.INPUT, label: "Password", placeholder: "Password" },
  ],
};

export const FORM_TEMPLATE_STATIC_DATA: AuthForm.FormStructure = {
  [Authorization.Type.INHERIT]: {
    description: {
      img: "/assets/media/apiClient/inherit-auth.svg",
      heading: "Inherits authorization from the parent collection.",
      subHeading: "This request will use its parent collection’s auth token when you send the request.",
    },
  },
  [Authorization.Type.NO_AUTH]: {
    description: {
      img: "/assets/media/apiClient/no-auth.svg",
      heading: "No authorization type selected for this request.",
      subHeading: "Please select a authorization type above.",
    },
  },
  [Authorization.Type.API_KEY]: {
    formData: FORM_FIELDS_LAYOUT[Authorization.Type.API_KEY],
    description: {
      heading: "API Key",
      subHeading:
        "API Key authentication allows you to securely send a key-value pair to the API, enabling it to verify and authorize your request.",
      externalLink: "https://docs.requestly.com/general/api-client/authorization/authorization-types#api-key",
    },
  },
  [Authorization.Type.BEARER_TOKEN]: {
    formData: FORM_FIELDS_LAYOUT[Authorization.Type.BEARER_TOKEN],
    description: {
      heading: "Bearer Token",
      subHeading:
        "Bearer Tokens let you securely authenticate requests using an access key, such as a JSON Web Token (JWT).",
      externalLink: "https://docs.requestly.com/general/api-client/authorization/authorization-types#bearer-tokens",
    },
  },
  [Authorization.Type.BASIC_AUTH]: {
    formData: FORM_FIELDS_LAYOUT[Authorization.Type.BASIC_AUTH],
    description: {
      heading: "Basic Auth",
      subHeading:
        "Basic Authentication lets you securely send a verified username and password with your request for verification purposes.",
      externalLink: "https://docs.requestly.com/general/api-client/authorization/authorization-types#basic-auth",
    },
  },
};
