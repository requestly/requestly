import { trackBillingTeamNoMemberFound } from "features/settings/analytics";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getDomainFromEmail } from "utils/FormattingHelper";
import { OrgMember } from "../types";
import { LOGGER as Logger } from "@requestly/utils";
import { isCompanyEmail } from "utils/mailCheckerUtils";

export const useFetchOrgMembers = () => {
  const user = useSelector(getUserAuthDetails);
  const [isLoading, setIsLoading] = useState(true);
  const [organizationMembers, setOrganizationMembers] = useState<{ total: number; users: OrgMember[] }>(null);

  useEffect(() => {
    if (user.loggedIn && !isCompanyEmail(user.details?.emailType)) {
      trackBillingTeamNoMemberFound("personal_email", "");
      setOrganizationMembers({ total: 0, users: [] });
      setIsLoading(false);
      return;
    }

    if (user?.details?.profile?.isEmailVerified && isCompanyEmail(user.details?.emailType)) {
      const getOrganizationUsers = httpsCallable(getFunctions(), "users-getOrganizationUsers");
      getOrganizationUsers({
        domain: getDomainFromEmail(user?.details?.profile?.email),
      })
        .then((res: any) => {
          if (res.data.total <= 1) {
            trackBillingTeamNoMemberFound("no_org_member_available", "");
          }
          setOrganizationMembers(res.data);
        })
        .catch((error) => {
          Logger.log("Error fetching organization members", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [user.loggedIn, user.details?.profile?.email, user.details?.profile?.isEmailVerified, user.details?.emailType]);

  return { isLoading, organizationMembers: organizationMembers?.users };
};
