import EMAIL_DOMAINS from "config/constants/sub/email-domains";

export const getBusinessDomain = (user: any) => {
  const email = user?.details?.profile?.email;
  const domain = email.split("@")[1];

  if (EMAIL_DOMAINS.PERSONAL.includes(domain)) {
    return null;
  } else {
    return domain;
  }
};
