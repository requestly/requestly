import { Authorization } from "./screens/apiClient/components/views/components/request/components/AuthorizationView/types/AuthConfig";
import { RQAPI } from "./types";

export const CONTENT_TYPE_HEADER = "Content-Type";

export const DEMO_HTTP_API_URL = "https://app.requestly.io/echo";

export const DEMO_GRAPHQL_API_URL = "https://rickandmortyapi.com/graphql";

export const DEFAULT_REQUEST_NAME = "Untitled request";

export const SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY = "expanded_record_ids";

export namespace PostmanAuth {
  export enum AuthType {
    INHERIT = "inherit",
    NO_AUTH = "noauth",
    API_KEY = "apikey",
    BEARER_TOKEN = "bearer",
    BASIC_AUTH = "basic",
  }

  export type KV<Label extends string> = {
    key: Label;
    value: string;
    type: "string";
  };
  export namespace Bearer {
    export type ConfigData = [KV<"token">];
    export type Config = { [AuthType.BEARER_TOKEN]: ConfigData };
    export type Item = { type: AuthType.BEARER_TOKEN } & Config;
  }

  export namespace ApiKey {
    export type ConfigData = Array<
      | KV<"key">
      | KV<"value">
      | {
          key: "in";
          value: "header" | "query";
          type: "string";
        }
    > & { length: 3 };
    export type Config = { [AuthType.API_KEY]: ConfigData };
    export type Item = { type: AuthType.API_KEY } & Config;
  }

  export namespace Basic {
    export type ConfigData = Array<KV<"username"> | KV<"password">> & { length: 2 };
    export type Config = { [AuthType.BASIC_AUTH]: ConfigData };
    export type Item = { type: AuthType.BASIC_AUTH } & Config;
  }

  export type NoAuth = { type: AuthType.NO_AUTH };
  export type Inherit = { type: AuthType.INHERIT };

  export type Item = Bearer.Item | ApiKey.Item | Basic.Item | NoAuth | Inherit;
}

export const POSTMAN_AUTH_TYPES_MAPPING = {
  [PostmanAuth.AuthType.INHERIT]: Authorization.Type.INHERIT,
  [PostmanAuth.AuthType.NO_AUTH]: Authorization.Type.NO_AUTH,
  [PostmanAuth.AuthType.API_KEY]: Authorization.Type.API_KEY,
  [PostmanAuth.AuthType.BEARER_TOKEN]: Authorization.Type.BEARER_TOKEN,
  [PostmanAuth.AuthType.BASIC_AUTH]: Authorization.Type.BASIC_AUTH,
};

export const DEFAULT_SCRIPT_VALUES = {
  [RQAPI.ScriptType.PRE_REQUEST]:
    "// **********************************************\n// 🛠️ Learn more about scripts and snippets: https://docs.requestly.com/general/api-client/scripts\n// **********************************************\n",
  [RQAPI.ScriptType.POST_RESPONSE]:
    "// **********************************************\n// 🛠️ Use JavaScript to visualize responses: https://docs.requestly.com/general/api-client/scripts\n// **********************************************\n",
};

/*
 * Regex looks for the characters other than this
 * Also checks the braces, cases where ex:{{RQ_CLIENT_ID}} environment variables are used, this should be not marked invalid other than this will be flagged
 */
export const INVALID_KEY_CHARACTERS = /^(?!\{\{.*\}\}|^\{\{?$|^\}\}?$)[^!#$%&'*+\-.^_`|~0-9A-Za-z]/;

export enum Headers {
  CONTENT_TYPE = "Content-Type",
}

export const LARGE_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

export const API_CLIENT_DOCS = {
  COLLECTION_RUNNER: "https://docs.requestly.com/general/api-client/collection-runner",
  COLLECTION_RUNNER_DATA_FILE: "https://docs.requestly.com/general/api-client/collection-runner-data-file",
};
