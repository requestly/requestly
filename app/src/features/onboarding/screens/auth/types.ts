export enum AuthProvider {
  GOOGLE = "google.com",
  PASSWORD = "password",
  SSO = "sso",
}

export type AuthSyncMetadata = {
  success: boolean;
  syncData: {
    isExistingUser: boolean;
    isSyncedUser: boolean;
    providers: AuthProvider[];
    forceBstackAuth?: boolean;
  };
};
export interface CredentialResponse {
  credential: string;
  select_by: string;
  client_id: string;
}

export enum AuthErrorCode {
  NONE = "none",
  UNKNOWN = "unknown",
  DIFFERENT_USER = "different_user",
}

export enum AuthScreenMode {
  MODAL = "modal",
  PAGE = "page",
}

export enum AuthMode {
  LOG_IN = "log_in",
  SIGN_UP = "sign_up",
}
