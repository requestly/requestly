import { EmailType } from "@requestly/shared/types/common";
import { getFunctions, httpsCallable } from "firebase/functions";

interface EmailTypeResponse {
  userEmail: string;
  type: EmailType;
}
//backend for frontend implementation
export const fetchEmailType = async (email: string): Promise<EmailType> => {
  try {
    const checkEmailType = httpsCallable<{ userEmail: string }, EmailTypeResponse>(getFunctions(), "fetchEmailType");
    const result = await checkEmailType({ userEmail: email });
    return result.data.type;
  } catch (error) {
    console.error("Error while fetching the emailType", error);
  }
};

export const getDomainFromEmail = (email: string) => {
  if (!email) return;
  return email.split("@")[1];
};

export const isCompanyEmail = async (emailType: EmailType) => {
  return emailType === EmailType.BUSINESS;
};

export const getEmailType = async (email: string) => {
  try {
    const domain = getDomainFromEmail(email);
    if (!domain) {
      return "UNDEFINED";
    }
    const mailType = await fetchEmailType(email);
    if (mailType === EmailType.PERSONAL) {
      return EmailType.PERSONAL;
    } else if (mailType === EmailType.DESTROYABLE) {
      return EmailType.DESTROYABLE;
    } else if (mailType === EmailType.BUSINESS) {
      return EmailType.BUSINESS;
    } else return "UNDEFINED";
  } catch (error) {
    console.error("Error in getEmailType", error);
  }
};

export const isDisposableEmail = async (email: string) => {
  try {
    const mailType = await fetchEmailType(email);
    return mailType === EmailType.DESTROYABLE;
  } catch (error) {
    console.error("Error checking disposable email", error);
  }
};
