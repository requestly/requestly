import { EmailType } from "@requestly/shared/types/common";
export interface UserAuth {
  loggedIn: boolean;
  isLimitReached?: boolean;
  details?: {
    profile?: {
      uid: string;
      email: string;
      displayName: string;
      isEmailVerified: boolean;
      photoURL: string;
      providerId: string;
      isSyncEnabled?: boolean;
      isBackupEnabled?: boolean;
    };
    isLoggedIn?: boolean;
    username?: string;
    isBackupEnabled?: boolean;
    isSyncEnabled?: boolean;
    isPremium?: boolean;
    planDetails?: {
      planId: string;
      status: string;
      type: "team" | "individual";
      planName: string;
      subscription: {
        cancelAtPeriodEnd: boolean;
        endDate: string;
        startDate: string;
        id: string;
        duration: "annually" | "monthly";
        quantity: number;
      };
    };
    organization?: any;
    emailType?: EmailType;
  };
}
