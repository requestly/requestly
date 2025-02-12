export abstract class AuthConfig {
  type: Authorization.Type;
  abstract validate(): boolean;
  abstract get config(): any;
}

export class ApiKeyAuthorizationConfig implements AuthConfig {
  type: Authorization.Type.API_KEY;
  key: string;
  value: string;
  addTo: "HEADER" | "QUERY";

  constructor(key: string, value: string, addTo: "HEADER" | "QUERY" = "HEADER") {
    this.key = key;
    this.value = value;
    this.addTo = addTo;
  }

  validate(): boolean {
    return this.key !== "" && this.value !== "";
  }

  get config() {
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
  type: Authorization.Type.BEARER_TOKEN;
  bearer: string;
  constructor(bearer: string) {
    this.bearer = bearer;
  }

  validate(): boolean {
    return this.bearer !== "";
  }
  get config() {
    if (!this.validate()) {
      // throw new Error("Invalid Bearer Token Authorization Config");
      return null;
    }
    return {
      bearer: this.bearer,
    };
  }
}

export class BasicAuthAuthorizationConfig implements AuthConfig {
  type: Authorization.Type.BASIC_AUTH;
  username: string;
  password: string;
  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  validate(): boolean {
    return this.username !== "" && this.password !== "";
  }

  get config() {
    if (!this.validate()) {
      // throw new Error("Invalid Basic Auth Authorization Config");
      return null;
    }
    return {
      username: this.username,
      password: this.password,
    };
  }
}

export namespace Authorization {
  export enum Type {
    INHERIT = "INHERIT",
    NO_AUTH = "NO_AUTH",
    API_KEY = "API_KEY",
    BEARER_TOKEN = "BEARER_TOKEN",
    BASIC_AUTH = "BASIC_AUTH",
  }

  export interface API_KEY_CONFIG {
    key: string;
    value: string;
    addTo: "HEADER" | "QUERY";
  }

  export interface BEARER_TOKEN_CONFIG {
    bearer: string;
  }

  export interface BASIC_AUTH_CONFIG {
    username: string;
    password: string;
  }
}
