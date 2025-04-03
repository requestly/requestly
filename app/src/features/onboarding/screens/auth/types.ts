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
