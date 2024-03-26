import { useCallback, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import useBillingTeamFetcher from "../../hooks/useBillingTeamFetcher";
import { getAvailableBillingTeams, getBillingTeamMemberById } from "store/features/billing/selectors";
import { Result } from "antd";
import { MyBillingTeamDetails } from "./MyBillingTeamDetails";
import { OtherBillingTeamDetails } from "./OtherBillingTeamDetails";
import APP_CONSTANTS from "config/constants";
import { toast } from "utils/Toast";
import { trackJoinBillingTeamRequestToastViewed } from "features/settings/analytics";
import { getFunctions, httpsCallable } from "firebase/functions";
import Logger from "lib/logger";

const BILLING_TEAM_JOIN_REQUEST_ACTION = {
  ACCEPT: "accept",
  REJECT: "reject",
};

export const BillingDetails = () => {
  const location = useLocation();
  const { billingId } = useParams();
  const user = useSelector(getUserAuthDetails);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const [queryParams] = useSearchParams();

  const joiningRequestAction = queryParams.get("joinRequestAction");
  const userId = queryParams.get("userId");

  const showReviewResultToast = useCallback((message: string, type: string, duration = 5) => {
    switch (type) {
      case "success":
        toast.success(message, duration);
        break;
      case "warning":
        toast.warn(message, duration);
        break;
      case "error":
        toast.error(message, duration);
        break;
      default:
        toast.info(message, duration);
    }
  }, []);

  const hasAccessToBillingTeam = useMemo(
    () =>
      billingTeams?.some((billingTeam) => {
        return billingTeam?.id === billingId && location.pathname !== APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE;
      }),
    [billingTeams, billingId, location.pathname]
  );
  const isTeamMember = useBillingTeamFetcher(hasAccessToBillingTeam, billingId);

  const userDetailsOfSelectedBillingTeam = useSelector(
    getBillingTeamMemberById(billingId, user?.details?.profile?.uid)
  );

  useEffect(() => {
    if (user.loggedIn && billingId && joiningRequestAction && userId) {
      toast.loading(
        `${
          joiningRequestAction === BILLING_TEAM_JOIN_REQUEST_ACTION.ACCEPT ? "Approving" : "Declining"
        } the joining request ...`,
        5
      );
      trackJoinBillingTeamRequestToastViewed(joiningRequestAction, "loading");
      const reviewBillingTeamJoiningRequest = httpsCallable(getFunctions(), "billing-reviewBillingTeamJoiningRequest");
      reviewBillingTeamJoiningRequest({
        billingTeamId: billingId,
        action: joiningRequestAction,
        userId,
      })
        .then((res: any) => {
          showReviewResultToast(res.data.message, res.data.result.status);
          trackJoinBillingTeamRequestToastViewed(joiningRequestAction, res.data.result.status);
          Logger.log("Billing team joining request reviewed");
        })
        .catch((err: any) => {
          toast.error(err.message, 5);
          trackJoinBillingTeamRequestToastViewed(joiningRequestAction, "error");
          Logger.log("Error while reviewing billing team joining request");
        });
    }
  }, [billingId, joiningRequestAction, userId, showReviewResultToast, user.loggedIn]);

  if (!hasAccessToBillingTeam && billingId) {
    return (
      <div className="display-row-center items-center" style={{ marginTop: "80px" }}>
        <Result
          status="error"
          title="Oops, something went wrong!"
          subTitle="You are not a part of this billing team or this team does not exist"
        />
      </div>
    );
  }

  if (isTeamMember || userDetailsOfSelectedBillingTeam) return <MyBillingTeamDetails />;
  else return <OtherBillingTeamDetails />;
};
