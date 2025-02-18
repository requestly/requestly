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
    username: string;
    password: string;
  };
}

export abstract class AuthConfig {
  abstract validate(): boolean;
  abstract get config(): any;
  abstract get type(): Authorization.Type;
}

export class ApiKeyAuthorizationConfig implements AuthConfig {
  key: string;
  value: string;
  addTo: Authorization.API_KEY_CONFIG["addTo"];

  constructor(key: string, value: string, addTo: Authorization.API_KEY_CONFIG["addTo"] = "HEADER") {
    this.key = key;
    this.value = value;
    this.addTo = addTo;
  }

  validate(): boolean {
    return this.key !== "" && this.value !== "";
  }

  get type() {
    return Authorization.Type.API_KEY;
  }

  get config(): Authorization.API_KEY_CONFIG | null {
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

export class BearerTokenAuthorizationConfig implements AuthConfig {
  bearer: string;
  constructor(bearer: string) {
    this.bearer = bearer;
  }

  validate(): boolean {
    return this.bearer !== "";
  }
  get config(): Authorization.BEARER_TOKEN_CONFIG | null {
    if (!this.validate()) {
      // throw new Error("Invalid Bearer Token Authorization Config");
      return null;
    }
    return {
      bearer: this.bearer,
    };
  }

  get type() {
    return Authorization.Type.BEARER_TOKEN;
  }
}

export class BasicAuthAuthorizationConfig implements AuthConfig {
  username: string;
  password: string;
  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  validate(): boolean {
    return this.username !== "" && this.password !== "";
  }

  get config(): Authorization.BASIC_AUTH_CONFIG | null {
    if (!this.validate()) {
      // throw new Error("Invalid Basic Auth Authorization Config");
      return null;
    }
    return {
      username: this.username,
      password: this.password,
    };
  }

  get type() {
    return Authorization.Type.BASIC_AUTH;
  }
}
