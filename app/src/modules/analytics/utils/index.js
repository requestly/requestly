import { EmailType } from "@requestly/shared/types/common";

export function buildBasicUserProperties(user) {
  if (user && user.uid && user.providerData && user.providerData.length > 0) {
    const profile = user.providerData[0];
    const email = profile["email"];
    let isBusinessAccount = false;
    let company = null;
    const emailType = user.emailType;

    if (email && emailType === EmailType.BUSINESS) {
      isBusinessAccount = true;
      company = email.split("@")[1];
    }

    return {
      name: profile["displayName"],
      email: email,
      uid: user.uid,
      isBusinessAccount,
      company,
      workspaceId: window.currentlyActiveWorkspaceTeamId ? window.currentlyActiveWorkspaceTeamId : null,
      browserstackId: user.browserstackId,
    };
  }
}
