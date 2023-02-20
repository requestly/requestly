import { getDomainFromEmail, isCompanyEmail } from "utils/FormattingHelper";

export function buildBasicUserProperties(user) {
  if (user && user.uid && user.providerData && user.providerData.length > 0) {
    const profile = user.providerData[0];
    const email = profile["email"];
    let isBusinessAccount = false;
    let company = null;
    if (email && isCompanyEmail(email)) {
      isBusinessAccount = true;
      company = getDomainFromEmail(email);
    }

    return {
      name: profile["displayName"],
      email: email,
      uid: user.uid,
      isBusinessAccount,
      company,
    };
  }
}
