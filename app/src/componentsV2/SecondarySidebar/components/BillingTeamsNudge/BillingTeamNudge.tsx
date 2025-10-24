import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RQButton } from "lib/design-system-v2/components";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { useDispatch, useSelector } from "react-redux";
import { getBillingTeamNudgeLastSeenTs } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getCompanyNameFromEmail, getPrettyPlanName } from "utils/FormattingHelper";
import { getAvailableBillingTeams, getBillingTeamMemberById } from "store/features/billing/selectors";
import PATHS from "config/constants/sub/paths";
import { getFunctions, httpsCallable } from "firebase/functions";
import { globalActions } from "store/slices/global/slice";
import { MdCheckCircleOutline } from "@react-icons/all-files/md/MdCheckCircleOutline";
import { MdErrorOutline } from "@react-icons/all-files/md/MdErrorOutline";
import { PlanStatus } from "features/settings/components/BillingTeam/types";
import {
  trackBillingTeamNudgeClosed,
  trackBillingTeamNudgeRequestFailed,
  trackBillingTeamNudgeRequestSent,
  trackBillingTeamNudgeViewed,
  trackCheckoutBillingTeamNudgeClicked,
} from "./analytics";
import "./billingTeamNudge.scss";
import { getDaysDifference } from "utils/DateTimeUtils";
import { PRICING } from "features/pricing";

export const BillingTeamNudge: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const teamOwnerDetails = useSelector(getBillingTeamMemberById(billingTeams[0]?.id, billingTeams[0]?.owner));
  const billingTeamNudgeLastSeenTs = useSelector(getBillingTeamNudgeLastSeenTs);
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [isRequestProcessed, setIsRequestProcessed] = useState(false);

  const domain = getCompanyNameFromEmail(user.details?.profile?.email);

  const daysSinceLastSeen = useMemo(() => getDaysDifference(billingTeamNudgeLastSeenTs), [billingTeamNudgeLastSeenTs]);

  const availableBillingTeams = useMemo(
    () =>
      billingTeams.filter(
        (team) =>
          team.subscriptionDetails &&
          team.subscriptionDetails.subscriptionStatus === PlanStatus.ACTIVE &&
          !team.members[user.details?.profile?.uid]
      ),
    [billingTeams, user.details?.profile?.uid]
  );

  const planNameToShow = useMemo(() => {
    const hasProfessionalPlan = availableBillingTeams.some(
      (team) => team.subscriptionDetails?.plan === PRICING.PLAN_NAMES.PROFESSIONAL
    );
    const plan = hasProfessionalPlan ? PRICING.PLAN_NAMES.PROFESSIONAL : PRICING.PLAN_NAMES.BASIC_V2;
    return getPrettyPlanName(plan);
  }, [availableBillingTeams]);

  const handleCloseBillingTeamNudge = useCallback(() => {
    // @ts-ignore
    dispatch(globalActions.updateBillingTeamNudgeLastSeenTs(new Date().getTime()));
    trackBillingTeamNudgeClosed();
  }, [dispatch]);

  const handleRequestButtonClick = useCallback(() => {
    if (availableBillingTeams.length > 1) {
      trackCheckoutBillingTeamNudgeClicked();
      navigate(PATHS.SETTINGS.BILLING.RELATIVE);
    } else {
      setIsLoading(true);
      setIsRequestProcessed(false);
      const requestEnterprisePlanFromAdmin = httpsCallable<{ billingId: string }, null>(
        getFunctions(),
        "premiumNotifications-requestEnterprisePlanFromAdmin"
      );
      requestEnterprisePlanFromAdmin({
        billingId: availableBillingTeams[0].id,
      })
        .then(() => {
          trackBillingTeamNudgeRequestSent();
          setIsRequestSent(true);
          setTimeout(() => {
            handleCloseBillingTeamNudge();
          }, 4000);
        })
        .catch(() => {
          trackBillingTeamNudgeRequestFailed();
          setIsRequestSent(false);
        })
        .finally(() => {
          setIsLoading(false);
          setIsRequestProcessed(true);
        });
    }
  }, [availableBillingTeams, navigate, handleCloseBillingTeamNudge]);

  useEffect(() => {
    if (
      daysSinceLastSeen &&
      daysSinceLastSeen >= 15 &&
      user.details?.planDetails?.status !== PlanStatus.ACTIVE &&
      availableBillingTeams.length
    ) {
      trackBillingTeamNudgeViewed();
    }
  }, [daysSinceLastSeen, user.details?.planDetails?.status, availableBillingTeams.length]);

  if (daysSinceLastSeen && daysSinceLastSeen < 15) return null;

  if (user.details?.planDetails?.status === PlanStatus.ACTIVE) return null;
  if (!availableBillingTeams.length) return null;

  return (
    <div className="billing-team-nudge">
      <MdClose className="billing-team-nudge__close-icon" onClick={handleCloseBillingTeamNudge} />
      <div className="billing-team-nudge__content">
        {isRequestProcessed ? (
          <>
            {isRequestSent ? (
              " Billing team admins have been notified. Please get in touch with them for approval and details."
            ) : (
              <>
                Unable to send request, contact directly at <span className="caption">{teamOwnerDetails?.email}</span>{" "}
                for futher details.
              </>
            )}
          </>
        ) : (
          <>
            <span>{domain}</span> has Requestly {planNameToShow} Team Plan. Unlock all features by joining the team.
          </>
        )}
      </div>
      {isRequestProcessed ? (
        <div className="billing-team-nudge__request-status">
          {isRequestSent ? (
            <>
              Request sent <MdCheckCircleOutline className="success" />
            </>
          ) : (
            <>
              Unable to send request <MdErrorOutline className="danger" />
            </>
          )}
        </div>
      ) : (
        <RQButton
          block
          loading={isLoading}
          className="billing-team-nudge__button"
          size="small"
          disabled={isRequestProcessed}
          type="secondary"
          onClick={handleRequestButtonClick}
        >
          {availableBillingTeams.length > 1 ? "View Teams" : "Send Request"}
        </RQButton>
      )}
    </div>
  );
};
