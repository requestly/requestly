export enum Provider {
  GOOGLE = "google.com",
  EMAIL_LINK = "email_link",
  PASSWORD = "password",
}

export type AuthSyncMetadata = {
  success: boolean;
  syncData: {
    isExistingUser: boolean;
    isSyncedUser: boolean;
    providers: Provider[];
  };
};
export interface CredentialResponse {
  credential: string;
  select_by: string;
  client_id: string;
}

export enum FailedLoginCode {
  DIFFERENT_USER = "different_user",
  UNKNOWN = "unknown",
}
