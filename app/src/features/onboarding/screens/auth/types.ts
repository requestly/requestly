export enum Provider {
  GOOGLE = "google",
  EMAIL_LINK = "email_link",
}

export type AuthSyncMetadata = {
  success: boolean;
  syncData: {
    isExistingUser: boolean;
    isSyncedUser: boolean;
    providers: Provider[];
  };
};
