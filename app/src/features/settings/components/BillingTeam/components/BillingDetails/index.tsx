import { useCallback, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { useParams, useSearchParams } from "react-router-dom";
import { useCheckCurrentTeamAccess } from "../../hooks/useCheckCurrentTeamAccess";
import { getAvailableBillingTeams, getBillingTeamMemberById } from "store/features/billing/selectors";
import { Result } from "antd";
import { MyBillingTeamDetails } from "./MyBillingTeamDetails";
import { OtherBillingTeamDetails } from "./OtherBillingTeamDetails";
import { toast } from "utils/Toast";
import { trackBillingTeamAccessRequestResponded } from "features/settings/analytics";
import { getFunctions, httpsCallable } from "firebase/functions";
import Logger from "lib/logger";

enum BillingTeamJoinRequestAction {
  ACCEPT = "accept",
  REJECT = "reject",
}

export const BillingTeamDetails = () => {
  const { billingId } = useParams();
  const user = useSelector(getUserAuthDetails);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const [queryParams] = useSearchParams();

  const joinRequestAction = queryParams.get("joinRequestAction");
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

  const hasAccessToCurrentTeam = useCheckCurrentTeamAccess(billingId);

  const isBillingTeamDetailsViewable = useMemo(
    () =>
      billingTeams?.some((billingTeam) => {
        return billingTeam?.id === billingId;
      }),
    [billingTeams, billingId]
  );

  const userDetailsOfSelectedBillingTeam = useSelector(
    getBillingTeamMemberById(billingId, user?.details?.profile?.uid)
  );

  useEffect(() => {
    if (user.loggedIn && billingId && joinRequestAction && userId) {
      toast.loading(
        `${
          joinRequestAction === BillingTeamJoinRequestAction.ACCEPT ? "Approving" : "Declining"
        } the joining request ...`,
        5
      );
      trackBillingTeamAccessRequestResponded(joinRequestAction, "loading");
      const reviewBillingTeamJoiningRequest = httpsCallable(getFunctions(), "billing-reviewBillingTeamJoiningRequest");
      reviewBillingTeamJoiningRequest({
        billingId,
        action: joinRequestAction,
        userId,
      })
        .then((res: any) => {
          showReviewResultToast(res.data.message, res.data.result.status);
          trackBillingTeamAccessRequestResponded(joinRequestAction, res.data.result.status);
          Logger.log("Billing team joining request reviewed");
        })
        .catch((err: any) => {
          toast.error(err.message, 5);
          trackBillingTeamAccessRequestResponded(joinRequestAction, "error");
          Logger.log("Error while reviewing billing team joining request");
        });
    }
  }, [billingId, joinRequestAction, userId, showReviewResultToast, user.loggedIn]);

  if (!user.loggedIn) {
    return null;
  }

  if (!isBillingTeamDetailsViewable && billingId) {
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

  if (hasAccessToCurrentTeam || userDetailsOfSelectedBillingTeam) return <MyBillingTeamDetails />;
  else return <OtherBillingTeamDetails />;
};
