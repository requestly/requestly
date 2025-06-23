import { useMemo } from "react";
import { useSelector } from "react-redux";
import { getCompanyNameFromEmail, getPrettyPlanName } from "utils/FormattingHelper";
import { isCompanyEmail } from "utils/mailCheckerUtils";
import { Banner, BANNER_ID } from "../banner.types";
import { getUserAuthDetails } from "store/slices/global/user/selectors";

export const useRenderBannerText = (banner: Banner): string => {
  const user = useSelector(getUserAuthDetails);

  const companyName = useMemo(() => getCompanyNameFromEmail(user?.details?.profile?.email) || "", [
    user?.details?.profile?.email,
  ]);

  const planName = useMemo(() => getPrettyPlanName(user?.details?.planDetails?.planName), [
    user?.details?.planDetails?.planName,
  ]);

  switch (banner.id) {
    case BANNER_ID.COMMERCIAL_LICENSE:
    case BANNER_ID.REQUEST_TEAM_ACCESS:
      return `Dear ${companyName} user, ${banner.text}`;

    case BANNER_ID.ACCELERATOR_PROGRAM:
      return isCompanyEmail(user?.details?.emailType)
        ? `Requestly is offering an exclusive 6-month free access to the entire ${companyName} team as a part of its Accelerator Program.`
        : "Requestly is offering six months of free access to its Professional Plan through the Accelerator program, limited to 20 companies.";

    case BANNER_ID.CONVERT_TO_ANNUAL_PLAN:
      return `You're on the ${planName} Monthly plan. Switch to the annual plan and save over 40% on your annual spends with our New Year Deal.`;

    default:
      return banner.text;
  }
};
