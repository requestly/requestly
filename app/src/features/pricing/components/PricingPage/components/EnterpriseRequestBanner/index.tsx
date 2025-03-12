import React, { useState, useEffect, useCallback, JSX } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAvailableBillingTeams, getBillingTeamMemberById } from "store/features/billing/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { Row, Col, Alert } from "antd";
import { toast } from "utils/Toast.js";
import { getFunctions, httpsCallable } from "firebase/functions";
import { trackEnterpriseRequestEvent } from "modules/analytics/events/misc/business/checkout";
import { LoadingOutlined } from "@ant-design/icons";
import { AiOutlineQuestionCircle } from "@react-icons/all-files/ai/AiOutlineQuestionCircle";
import { trackTeamPlanCardClicked, trackTeamPlanCardShown } from "modules/analytics/events/common/teams";
import { getDomainFromEmail } from "utils/FormattingHelper";
import { redirectToBillingTeam } from "utils/RedirectionUtils";
import "./index.css";
import { isCompanyEmail } from "utils/mailCheckerUtils";

export default function EnterpriseRequestBanner(): JSX.Element | null {
  const user = useSelector(getUserAuthDetails);
  const navigate = useNavigate();
  const billingTeams = useSelector(getAvailableBillingTeams);
  const teamOwnerDetails = useSelector(getBillingTeamMemberById(billingTeams[0]?.id, billingTeams[0]?.owner));
  const [enterpriseRequestedState, setEnterpriseRequestedState] = useState(0); // 1 is clicked, 2 is sent

  // FIREBASE FUNCTIONS
  const functions = getFunctions();
  const requestEnterprisePlanFromAdmin = httpsCallable<{ billingId: string }, null>(
    functions,
    "premiumNotifications-requestEnterprisePlanFromAdmin"
  );

  const requestPremiumToAdmin = useCallback(() => {
    if (billingTeams.length > 1) {
      redirectToBillingTeam(navigate, billingTeams[0].id, window.location.pathname, "pricing_page");
      return;
    }

    setEnterpriseRequestedState(1);
    const domain = getDomainFromEmail(user?.details?.profile?.email);
    trackTeamPlanCardClicked(domain, "pricing_page");
    requestEnterprisePlanFromAdmin({
      billingId: billingTeams[0].id,
    })
      .then(() => {
        //GA4
        trackEnterpriseRequestEvent(domain);
        setEnterpriseRequestedState(2);
      })
      .catch((err) => {
        toast.error("Unable to send email");
        toast.info(`Contact directly at: ${teamOwnerDetails?.email}`);
      });
  }, [requestEnterprisePlanFromAdmin, navigate, billingTeams, user?.details?.profile?.email, teamOwnerDetails?.email]);

  useEffect(() => {
    if (
      billingTeams.length &&
      isCompanyEmail(user.details?.emailType) &&
      user?.details?.profile?.isEmailVerified &&
      user?.details?.isLoggedIn &&
      !user?.details?.isPremium
    )
      trackTeamPlanCardShown(billingTeams[0].ownerDomains);
  }, [
    user.details?.isLoggedIn,
    user.details?.isPremium,
    user.details?.profile.email,
    user.details?.profile?.isEmailVerified,
    billingTeams,
    user.details?.emailType,
  ]);

  if (user?.details?.isPremium || !user?.details?.isLoggedIn) return null;

  return (
    <React.Fragment>
      {billingTeams?.length && isCompanyEmail(user.details?.emailType) && user?.details?.profile?.isEmailVerified ? (
        enterpriseRequestedState === 1 ? (
          <>
            <br />
            <Row>
              <Col span={24} className="display-row-center">
                <LoadingOutlined />
              </Col>
            </Row>
            <br />
          </>
        ) : (
          <>
            <Row className="pricing-alert-row display-row-center mt-16">
              <Col className="display-row-center">
                {enterpriseRequestedState === 2 ? (
                  <Alert
                    type="info"
                    showIcon
                    icon={<></>}
                    message={
                      <>{"✅ Workspace admin has been notified. Please get in touch with them for further details."}</>
                    }
                  ></Alert>
                ) : (
                  <Alert
                    type="info"
                    showIcon
                    icon={<AiOutlineQuestionCircle />}
                    message={
                      <>
                        Your organization is already on Requestly Premium Plan.
                        <br />
                        <span onClick={requestPremiumToAdmin} className="text-white text-underline cursor-pointer">
                          Click here
                        </span>{" "}
                        to request a Requestly Premium subscription for you.
                      </>
                    }
                  ></Alert>
                )}
              </Col>
            </Row>
            <br />
          </>
        )
      ) : null}
    </React.Fragment>
  );
}
