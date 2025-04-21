// FIXME: This needs to be fetched from backend
export interface User {
  domain: string;
  email?: string;
  isVerified?: boolean;
  photoURL: string;
  signupTs: number;
  username: string;
  browserstackId?: string;
  "block-config"?: {
    grr: {
      isBlocked: boolean;
      reason: string;
    };
  };
}
