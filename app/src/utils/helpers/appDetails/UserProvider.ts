import { getDomainFromEmail, isCompanyEmail } from "utils/FormattingHelper";

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

export const updateUserEmail = (email: string) => {
  userDetails.email = email;
  if (email && isCompanyEmail(email)) {
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
