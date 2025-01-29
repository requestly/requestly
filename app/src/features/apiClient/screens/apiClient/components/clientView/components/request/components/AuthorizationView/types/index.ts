export enum AUTHORIZATION_TYPES {
  INHERIT = "INHERIT",
  NO_AUTH = "NO_AUTH",
  API_KEY = "API_KEY",
  BEARER_TOKEN = "BEARER_TOKEN",
  BASIC_AUTH = "BASIC_AUTH",
}

export const AUTH_ENTRY_IDENTIFIER = "auth";

/* FORM */

interface BaseAuthFormField {
  id: string;
  type: string;
  label: string;
  className?: string;
}
export enum AUTH_FORM_FIELD_TYPES {
  INPUT = "RQ_SINGLE_LINE_EDITOR",
  SELECT = "SELECT",
}
export interface SingleLineEditorField extends BaseAuthFormField {
  type: AUTH_FORM_FIELD_TYPES.INPUT;
  placeholder?: string;
}

export interface SelectField extends BaseAuthFormField {
  type: AUTH_FORM_FIELD_TYPES.SELECT;
  options: { label: string; value: string }[];
  defaultValue?: string;
}

export type AuthFormField = SingleLineEditorField | SelectField;

export type AuthFormData = AuthFormField[];

/* DESCRIPTION */
export interface AuthDescriptionStep {
  value: string;
  steps?: AuthDescriptionStep[];
}

export interface AuthDescriptionData {
  heading: string;
  subHeading: string;
  note?: string;
  externalLink?: string;
  img?: string;
  steps?: AuthDescriptionStep[];
}
