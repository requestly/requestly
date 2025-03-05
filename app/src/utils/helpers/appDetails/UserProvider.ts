import { getDomainFromEmail } from "utils/FormattingHelper";
import { EmailType } from "@requestly/shared/types/common";
import { getEmailType } from "utils/mailCheckerUtils";
/* was created for integrations but no longer used */
export type User = {
  id: string;
  email?: string;
  planDetails?: object;
  isLoggedIn?: boolean;
  isBusinessAccount?: boolean;
  company?: string;
};

let userDetails: User = {
  id: "",
  email: null,
  planDetails: null,
  isLoggedIn: false,
  isBusinessAccount: false,
  company: null,
};

export const setAndUpdateUserDetails = (newUserDetails: Partial<User>, addMissingProperties = true): void => {
  for (const [attr, value] of Object.entries(newUserDetails)) {
    if (!addMissingProperties && !userDetails[attr as keyof User]) {
      continue;
    }
    if (attr !== "email") {
      //@ts-ignore
      userDetails[attr] = value;
    } else {
      updateUserEmail(newUserDetails["email"]);
    }
  }
};

export const resetUserDetails = (): void => {
  userDetails = {
    id: "",
    isLoggedIn: false,
    planDetails: null,
    email: null,
  };
};

export const updateUserEmail = async (email: string) => {
  userDetails.email = email;
  const emailType = await getEmailType(email);
  if (email && emailType === EmailType.BUSINESS) {
    userDetails.isBusinessAccount = true;
    userDetails.company = getDomainFromEmail(email);
  }
};

export const getUserDetails = () => {
  return userDetails;
};

export const getUserDetail = (key: keyof User) => {
  return userDetails[key];
};
