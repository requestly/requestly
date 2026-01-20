import { AuthConfigMeta, Authorization } from "../../types/AuthConfig";

export const AUTH_ENTRY_IDENTIFIER = "auth";

/* FORM */

export namespace AuthForm {
  interface BaseAuthFormField {
    id: string;
    type: string;
    label: string;
    className?: string;
  }
  export enum FIELD_TYPE {
    INPUT = "RQ_SINGLE_LINE_EDITOR",
    SELECT = "SELECT",
  }

  export interface InputField extends BaseAuthFormField {
    type: FIELD_TYPE.INPUT;
    placeholder?: string;
  }

  export interface SelectField extends BaseAuthFormField {
    type: FIELD_TYPE.SELECT;
    options: { label: string; value: string }[];
    defaultValue?: string;
  }
  export type FormField = InputField | SelectField;

  export type FormData = Record<Authorization.Type, FormField[] | null>;

  /* DESCRIPTION */
  export namespace Description {
    export interface Step {
      value: string;
      steps?: Step[];
    }

    export interface Data {
      heading: string;
      subHeading: string;
      note?: string;
      externalLink?: string;
      img?: string;
      steps?: Step[];
    }
  }

  // export type FormStructure = Record<
  //   Exclude<Authorization.Type, [Authorization.Type.NO_AUTH, Authorization.Type.INHERIT]>,
  //   {
  //     formData: FormField[];
  //     description: Description.Data;
  //   }
  // > & {
  //   [Authorization.Type.INHERIT]: {
  //     description: Description.Data;
  //   };
  //   [Authorization.Type.NO_AUTH]: {
  //     description: Description.Data;
  //   };
  // };

  export type FormStructure = Record<
    AuthConfigMeta.AuthWithConfig,
    { formData: FormField[]; description: Description.Data }
  > &
    Record<AuthConfigMeta.NoConfigAuth, { description: Description.Data }>;
}
