import { getDomainFromEmail } from "utils/FormattingHelper";
import { EmailType } from "@requestly/shared/types/common";
import { getEmailType } from "utils/mailCheckerUtils";

export async function buildBasicUserProperties(user) {
  if (user && user.uid && user.providerData && user.providerData.length > 0) {
    const profile = user.providerData[0];
    const email = profile["email"];
    let isBusinessAccount = false;
    let company = null;
    const email_type = await getEmailType(user.email);

    if (email && email_type === EmailType.BUSINESS) {
      isBusinessAccount = true;
      company = getDomainFromEmail(email);
    }

    return {
      name: profile["displayName"],
      email: email,
      uid: user.uid,
      isBusinessAccount,
      company,
      workspaceId: window.currentlyActiveWorkspaceTeamId ? window.currentlyActiveWorkspaceTeamId : null,
    };
  }
}
