import { useSelector } from "react-redux";
import { useMemo } from "react";
import { BANNER_ID } from "../banner.types";
import { PlanStatus, PlanType } from "features/settings/components/BillingTeam/types";
import { PRICING } from "features/pricing/constants/pricing";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getAvailableBillingTeams } from "store/features/billing/selectors";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { getAppNotificationBannerDismissTs } from "store/selectors";

export const useBannerVisibility = (bannerId: string): boolean => {
  const user = useSelector(getUserAuthDetails);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const lastDismissTs = useSelector(getAppNotificationBannerDismissTs);
  const allBanners = useFeatureValue("app_banner", []);
  const newBanners = useMemo(() => allBanners.filter((banner: any) => banner.createdTs > (lastDismissTs || 0)), [
    allBanners,
    lastDismissTs,
  ]);

  const BILLING_TEAM_PLAN_REMINDER_END_DATE = 1738434600000;

  return useMemo(() => {
    switch (bannerId) {
      case BANNER_ID.COMMERCIAL_LICENSE:
        return !user?.details?.isPremium;

      case BANNER_ID.REQUEST_TEAM_ACCESS:
        return billingTeams?.length > 0 && !billingTeams.some((team) => user?.details?.profile?.uid in team.members);

      case BANNER_ID.ACCELERATOR_PROGRAM:
        return !user?.details?.isPremium && !billingTeams?.length && user?.loggedIn;

      case BANNER_ID.BILLING_TEAM_PLAN_REMINDER: {
        const billingTeam = billingTeams?.find(
          (team) => team.id === newBanners[0]?.billingId && user.details?.profile?.uid in team.members
        );
        return (
          billingTeam &&
          new Date(user.details?.planDetails?.subscription?.endDate).getTime() <= BILLING_TEAM_PLAN_REMINDER_END_DATE
        );
      }

      case BANNER_ID.BLACK_FRIDAY:
        return !user?.details?.isPremium;

      case BANNER_ID.CONVERT_TO_ANNUAL_PLAN: {
        if (
          !user?.details?.isPremium ||
          user?.details?.planDetails?.status !== PlanStatus.ACTIVE ||
          user?.details?.planDetails?.subscription?.duration === PRICING.DURATION.ANNUALLY
        )
          return false;

        if (user?.details?.planDetails?.type === PlanType.INDIVIDUAL) return true;

        const isTeamOwner = billingTeams?.some(
          (team) =>
            user?.details?.profile?.uid in team.members &&
            !team.isAcceleratorTeam &&
            team.owner === user?.details?.profile?.uid
        );
        return isTeamOwner;
      }

      default:
        return true;
    }
  }, [bannerId, user, billingTeams, newBanners]);
};
