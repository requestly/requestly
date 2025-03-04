import { fetchEmailType } from "./emailService";
import { emailType as email_type } from "@requestly/shared/types/common";

export const getDomainFromEmail = (email: string) => {
  if (!email) return;
  return email.split("@")[1];
};

export const isCompanyEmail = async (emailType: string) => {
  return emailType === email_type.BUSINESS;
};

export const getEmailType = async (email: string) => {
  const domain = getDomainFromEmail(email);
  if (!domain) {
    return "UNDEFINED";
  }
  const mailType = await fetchEmailType(email);
  if (mailType === email_type.PERSONAL) {
    return email_type.PERSONAL;
  } else if (mailType === email_type.DESTROYABLE) {
    return email_type.DESTROYABLE;
  } else if (mailType === email_type.BUSINESS) {
    return email_type.BUSINESS;
  } else return "UNDEFINED";
};

export const isDisposableEmail = async (email: string) => {
  const mailType = await fetchEmailType(email);
  return mailType === email_type.DESTROYABLE;
};
