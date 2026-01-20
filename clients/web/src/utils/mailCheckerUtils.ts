import { EmailType } from "@requestly/shared/types/common";
import { getFunctions, httpsCallable } from "firebase/functions";
import Logger from "lib/logger";

interface EmailTypeResponse {
  userEmail: string;
  type: EmailType;
}
//backend for frontend implementation
export const fetchEmailType = async (email: string): Promise<EmailType | null> => {
  try {
    const checkEmailType = httpsCallable<{ userEmail: string }, EmailTypeResponse>(getFunctions(), "fetchEmailType");
    const result = await checkEmailType({ userEmail: email });
    return result.data.type;
  } catch (error) {
    Logger.error("Error while fetching the emailType", error);
    return null;
  }
};

export const getDomainFromEmail = (email: string) => {
  if (!email) return;
  return email.split("@")[1];
};

export const isCompanyEmail = (emailType: EmailType) => {
  return emailType === EmailType.BUSINESS;
};

export const getEmailType = async (email: string) => {
  try {
    const domain = getDomainFromEmail(email);
    if (!domain) {
      return null;
    }
    const mailType = await fetchEmailType(email);
    switch (mailType) {
      case EmailType.PERSONAL:
        return EmailType.PERSONAL;
      case EmailType.DESTROYABLE:
        return EmailType.DESTROYABLE;
      case EmailType.BUSINESS:
        return EmailType.BUSINESS;
      default:
        return null;
    }
  } catch (error) {
    Logger.error("Error in getEmailType", error);
    return null;
  }
};
