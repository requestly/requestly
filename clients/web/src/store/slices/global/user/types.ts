import { EmailType } from "@requestly/shared/types/common";
import { User } from "backend/models/users";
export interface UserAuth {
  loggedIn: boolean;
  isLimitReached?: boolean;
  details?: {
    metadata?: User["metadata"];
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
      type: "team" | "individual" | "student" | "accelerator" | "appsumo" | "signup_trial";
      planName: string;
      subscription: {
        cancelAtPeriodEnd: boolean;
        endDate: string;
        startDate: string;
        id: string;
        duration: "annually" | "monthly";
        quantity: number;
        billingId: string | null;
        isBrowserstackSubscription: boolean;
      };
    };
    organization?: any;
    emailType?: EmailType;
  };
}
