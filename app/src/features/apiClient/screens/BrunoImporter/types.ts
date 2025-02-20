import { EnvironmentVariableType } from "backend/environment/types";
import { RequestMethod } from "features/apiClient/types";

interface RootData {
  request?: {
    vars?: Vars;
    auth?: Bruno.Auth;
  };
  meta?: { name: string };
}
interface Vars {
  req?: Bruno.Variable[];
  res?: Bruno.Variable[];
}
interface FieldValue {
  name: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export namespace Bruno {
  export interface RootCollection {
    name: string;
    version: string;
    items: Item[];
    environments?: Array<{
      name: string;
      variables: Variable[];
    }>;
    brunoConfig?: {
      version: string;
      name: string;
      type: string;
      ignore?: string[];
    };
    root?: RootData;
  }

  export interface Item {
    type: "http" | "folder";
    name: string;
    seq: number;
    request?: Request;
    items?: Item[];
    root?: RootData;
  }

  export type BodyMode = "json" | "text" | "xml" | "graphql" | "sparql" | "formUrlEncoded" | "multipartForm";

  type BodyType<T extends BodyMode, V> = {
    mode: T;
  } & Record<T, V>;

  export type Body =
    | BodyType<"json", string>
    | BodyType<"text", string>
    | BodyType<"xml", string>
    | BodyType<"graphql", string>
    | BodyType<"sparql", string>
    | BodyType<"formUrlEncoded", Param[]>
    | BodyType<"multipartForm", Param[]>;

  export type AuthMode = "none" | "basic" | "bearer";

  type AuthType<T extends AuthMode, V> = {
    mode: T;
  } & Record<T, V>;

  export type Auth =
    | AuthType<"basic", { username: string; password: string }>
    | AuthType<"bearer", { token: string }>
    | AuthType<"none", never>;

  export interface Variable extends FieldValue {
    local: boolean;
    secret?: boolean;
    type?: EnvironmentVariableType;
  }

  export type Header = FieldValue;

  export interface Param extends FieldValue {
    type?: string;
  }

  export interface Request {
    url: string;
    method: RequestMethod;
    headers: Header[];
    params: Param[];
    body: Body;
    auth?: Auth;
    script?: {
      req?: string;
      res?: string;
    };
    vars?: Vars;
  }
}
