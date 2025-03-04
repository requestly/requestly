import { emailType } from "../../../shared/src/types/entities/emailType/type";
import { fetchEmailType } from "./emailService";

export const getDomainFromEmail = (email) => {
  if (!email) return;
  return email.split("@")[1];
};

export const isCompanyEmail = async (emailType) => {
  return emailType === emailType.BUSINESS;
};

export const getEmailType = async (email) => {
  const domain = getDomainFromEmail(email);
  if (!domain) {
    return "UNDEFINED";
  }
  const mailType = await fetchEmailType(email);
  if (mailType === emailType.PERSONAL) {
    return emailType.PERSONAL;
  } else if (mailType === emailType.DESTROYABLE) {
    return emailType.DESTROYABLE;
  } else if (mailType === emailType.BUSINESS) {
    return emailType.BUSINESS;
  } else return "UNDEFINED";
};

export const isDisposableEmail = async (email) => {
  const mailType = await fetchEmailType(email);
  return mailType === emailType.DESTROYABLE;
};
