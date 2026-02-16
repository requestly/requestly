export namespace Authorization {
  export enum Type {
    INHERIT = "INHERIT",
    NO_AUTH = "NO_AUTH",
    API_KEY = "API_KEY",
    BEARER_TOKEN = "BEARER_TOKEN",
    BASIC_AUTH = "BASIC_AUTH",
  }

  type AddToOptions = "HEADER" | "QUERY";
  export type API_KEY_CONFIG = {
    key: string;
    value: string;
    addTo: AddToOptions;
  };

  export type BEARER_TOKEN_CONFIG = {
    bearer: string;
  };

  export type BASIC_AUTH_CONFIG = {
    username?: string;
    password?: string;
  };

  export const requiresConfig = (type: Type): type is AuthConfigMeta.AuthWithConfig => {
    return ![Type.NO_AUTH, Type.INHERIT].includes(type);
  };

  export const hasNoConfig = (type: Type): type is AuthConfigMeta.NoConfigAuth => {
    return [Type.NO_AUTH, Type.INHERIT].includes(type);
  };
}

export namespace AuthConfigMeta {
  export type TypeToConfig = {
    [Authorization.Type.API_KEY]: Authorization.API_KEY_CONFIG;
    [Authorization.Type.BEARER_TOKEN]: Authorization.BEARER_TOKEN_CONFIG;
    [Authorization.Type.BASIC_AUTH]: Authorization.BASIC_AUTH_CONFIG;
    [Authorization.Type.NO_AUTH]: never;
    [Authorization.Type.INHERIT]: never;
  };

  type HasConfig<T extends Authorization.Type> = TypeToConfig[T] extends never ? false : true;

  export type AuthWithConfig = {
    [K in Authorization.Type]: HasConfig<K> extends true ? K : never;
  }[Authorization.Type];

  export type NoConfigAuth = {
    [K in Authorization.Type]: HasConfig<K> extends false ? K : never;
  }[Authorization.Type];
}

export abstract class AuthConfig<T extends AuthConfigMeta.AuthWithConfig> {
  abstract validate(): boolean;
  abstract readonly type: T;
  abstract get config(): AuthConfigMeta.TypeToConfig[T] | null;
}

export class ApiKeyAuthorizationConfig implements AuthConfig<Authorization.Type.API_KEY> {
  key: string;
  value: string;
  addTo: Authorization.API_KEY_CONFIG["addTo"];

  type: Authorization.Type.API_KEY = Authorization.Type.API_KEY;

  constructor(key: string, value: string, addTo: Authorization.API_KEY_CONFIG["addTo"] = "HEADER") {
    this.key = key;
    this.value = value;
    this.addTo = addTo;
  }

  validate(): boolean {
    return Boolean(this.key && this.value);
  }

  get config(): AuthConfigMeta.TypeToConfig[Authorization.Type.API_KEY] | null {
    if (!this.validate()) {
      // throw new Error("Invalid API Key Authorization Config");
      return null;
    }
    return {
      key: this.key,
      value: this.value,
      addTo: this.addTo,
    };
  }
}

export class BearerTokenAuthorizationConfig implements AuthConfig<Authorization.Type.BEARER_TOKEN> {
  bearer: string;

  type: Authorization.Type.BEARER_TOKEN = Authorization.Type.BEARER_TOKEN;

  constructor(bearer: string) {
    this.bearer = bearer;
  }

  validate(): boolean {
    return Boolean(this.bearer);
  }

  get config(): AuthConfigMeta.TypeToConfig[Authorization.Type.BEARER_TOKEN] | null {
    if (!this.validate()) {
      // throw new Error("Invalid Bearer Token Authorization Config");
      return null;
    }
    return {
      bearer: this.bearer,
    };
  }
}

export class BasicAuthAuthorizationConfig implements AuthConfig<Authorization.Type.BASIC_AUTH> {
  username?: string;
  password?: string;

  type: Authorization.Type.BASIC_AUTH = Authorization.Type.BASIC_AUTH;

  constructor(username?: string, password?: string) {
    this.username = username ?? "";
    this.password = password ?? "";
  }

  validate(): boolean {
    return true; //always send headers , no validation is done
  }

  get config(): AuthConfigMeta.TypeToConfig[Authorization.Type.BASIC_AUTH] | null {
    // always return config since validate alwyas return true
    return {
      username: this.username,
      password: this.password,
    };
  }
}
