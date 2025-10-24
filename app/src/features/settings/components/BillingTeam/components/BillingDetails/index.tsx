import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useParams, useSearchParams } from "react-router-dom";
import { useCheckCurrentTeamAccess } from "../../hooks/useCheckCurrentTeamAccess";
import { getAvailableBillingTeams, getBillingTeamMemberById } from "store/features/billing/selectors";
import { Result } from "antd";
import { MyBillingTeamDetails } from "./MyBillingTeamDetails";
import { OtherBillingTeamDetails } from "./OtherBillingTeamDetails";
import { ReviewJoinRequestModal } from "./modals/ReviewJoinRequestModal/ReviewJoinRequestModal";
import { BillingTeamJoinRequestAction } from "./types";

export const BillingTeamDetails = () => {
  const { billingId } = useParams();
  const user = useSelector(getUserAuthDetails);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const [queryParams] = useSearchParams();
  const [isRequestReviewModalOpen, setIsRequestReviewModalOpen] = useState(false);

  const joinRequestAction = queryParams.get("joinRequestAction") as BillingTeamJoinRequestAction;
  const userId = queryParams.get("userId");

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
      setIsRequestReviewModalOpen(true);
    }
  }, [billingId, joinRequestAction, userId, user.loggedIn]);

  if (!user.loggedIn) {
    return null;
  }

  if (!isBillingTeamDetailsViewable && billingId) {
    return (
      <div className="display-row-center items-center" style={{ marginTop: "80px" }}>
        <Result
          status="error"
          title="Oops, something went wrong!"
          subTitle="You don't have a license for the billing dashboard you are trying to access"
        />
      </div>
    );
  }
  return (
    <>
      <ReviewJoinRequestModal
        isOpen={isRequestReviewModalOpen}
        onClose={() => setIsRequestReviewModalOpen(false)}
        billingId={billingId}
        userId={userId}
        requestAction={joinRequestAction}
      />
      {hasAccessToCurrentTeam || userDetailsOfSelectedBillingTeam ? (
        <MyBillingTeamDetails />
      ) : (
        <OtherBillingTeamDetails />
      )}
    </>
  );
};
