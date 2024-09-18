import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "lib/design-system-v2/components";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { useDispatch, useSelector } from "react-redux";
import { getIsBillingTeamNudgeClosed, getUserAuthDetails } from "store/selectors";
import { getCompanyNameFromEmail } from "utils/FormattingHelper";
import { getAvailableBillingTeams, getBillingTeamMemberById } from "store/features/billing/selectors";
import PATHS from "config/constants/sub/paths";
import { getFunctions, httpsCallable } from "firebase/functions";
import { actions } from "store";
import "./billingTeamNudge.scss";

export const BillingTeamNudge: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const teamOwnerDetails = useSelector(getBillingTeamMemberById(billingTeams[0]?.id, billingTeams[0]?.owner));
  const isBillingTeamNudgeClosed = useSelector(getIsBillingTeamNudgeClosed);
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [isRequestProcessed, setIsRequestProcessed] = useState(false);

  const domain = getCompanyNameFromEmail(user.details?.profile?.email);

  const availableBillingTeams = useMemo(
    () =>
      billingTeams.filter(
        (team) => team.subscriptionDetails.subscriptionStatus === "active" && !team.members[user.details?.profile?.uid]
      ),
    [billingTeams, user.details?.profile?.uid]
  );

  const handleRequestButtonClick = useCallback(() => {
    if (availableBillingTeams.length > 1) {
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
          setIsRequestSent(true);
          setTimeout(() => {
            toggleBillingTeamNudge();
          }, 4000);
        })
        .catch(() => {
          setIsRequestSent(false);
        })
        .finally(() => {
          setIsLoading(false);
          setIsRequestProcessed(true);
        });
    }
  }, [availableBillingTeams, navigate]);

  const toggleBillingTeamNudge = () => {
    // @ts-ignore
    dispatch(actions.updateIsBillingTeamNudgeClosed(true));
  };

  if (isBillingTeamNudgeClosed) return null;

  if (user.details?.planDetails?.status === "active") return null;
  if (!availableBillingTeams.length) return null;

  return (
    <div className="billing-team-nudge">
      <MdClose className="billing-team-nudge__close-icon" onClick={toggleBillingTeamNudge} />
      <div className="billing-team-nudge__content">
        {isRequestProcessed ? (
          <>
            {isRequestSent ? (
              " Billing team admins have been notified. Please get in touch with them for approval and details."
            ) : (
              <>
                {" "}
                Unable to send request, contact directly at <span className="caption">
                  {teamOwnerDetails?.email}
                </span>{" "}
                for futher details.
              </>
            )}
          </>
        ) : (
          <>
            <span>{domain}</span> has acquired licenses for its members. You can request a license for yourself.
          </>
        )}
      </div>
      <Button
        loading={isLoading}
        className="billing-team-nudge__button"
        size="small"
        disabled={isRequestProcessed}
        type="secondary"
        onClick={handleRequestButtonClick}
      >
        {availableBillingTeams.length > 1 ? (
          <>Checkout Billing Teams </>
        ) : (
          <>{isRequestSent ? "Request sent" : "Send license request"}</>
        )}
      </Button>
    </div>
  );
};
