import React, { useState, useEffect } from "react";
import { Row, Col, Alert } from "antd";
import { toast } from "utils/Toast.js";
//Firebase
import { getFunctions, httpsCallable } from "firebase/functions";
// UTILS
import { trackEnterpriseRequestEvent } from "modules/analytics/events/misc/business/checkout";
import { LoadingOutlined } from "@ant-design/icons";
import { AiOutlineQuestionCircle } from "@react-icons/all-files/ai/AiOutlineQuestionCircle";
import "./index.css";
import {
  trackTeamPlanCardClicked,
  trackTeamPlanCardShown,
  trackTeamPlanInterestCaptured,
} from "modules/analytics/events/common/teams";

export default function EnterpriseRequestBanner({ user }) {
  const [enterpriseContactDetails, setEnterpriseContactDetails] = useState({});
  const [enterpriseRequestedState, setEnterpriseRequestedState] = useState(0); // 1 is clicked, 2 is sent

  // FIREBASE FUNCTIONS
  const functions = getFunctions();
  const getEnterpriseAdminDetails = httpsCallable(functions, "getEnterpriseAdminDetails");
  const requestEnterprisePlanFromAdmin = httpsCallable(functions, "requestEnterprisePlanFromAdmin");

  function requestPremiumToAdmin() {
    setEnterpriseRequestedState(1);
    const enterpriseAdmin = enterpriseContactDetails.data.enterpriseData.admin;
    const domain = enterpriseAdmin.email.split("@")[1];
    trackTeamPlanCardClicked(domain);
    requestEnterprisePlanFromAdmin({
      userEmail: user.details.profile.email,
      adminEmail: enterpriseAdmin.email,
      adminName: enterpriseAdmin.name,
    })
      .then(() => {
        //GA4
        trackTeamPlanInterestCaptured(domain);
        trackEnterpriseRequestEvent(domain);
        setEnterpriseRequestedState(2);
      })
      .catch((err) => {
        toast.error("Unable to send email");
        toast.info(`Contact directly at: ${enterpriseAdmin.email}`);
      });
  }

  useEffect(() => {
    if (user?.details?.isLoggedIn) {
      if (Object.keys(enterpriseContactDetails).length === 0) {
        getEnterpriseAdminDetails({}).then((response) => {
          setEnterpriseContactDetails(response);
          if (response.data.success) {
            trackTeamPlanCardShown(response.data?.enterpriseData?.admin?.email?.split("@")?.[1]);
          }
        });
      }
    }
  }, [enterpriseContactDetails, getEnterpriseAdminDetails, user?.details?.isLoggedIn]);

  if (user?.details?.isPremium) return null;

  return (
    <React.Fragment>
      {enterpriseContactDetails && enterpriseContactDetails.data && enterpriseContactDetails.data.success ? (
        enterpriseRequestedState === 1 ? (
          <>
            <br />
            <Row>
              <Col span={24} align="center">
                <LoadingOutlined />
              </Col>
            </Row>
            <br />
          </>
        ) : (
          <>
            <Row className="pricing-alert-row">
              <Col span={24} align="center">
                {enterpriseRequestedState === 2 ? (
                  <Alert
                    type="info"
                    showIcon
                    icon={<>✅</>}
                    color="secondary"
                    message={
                      <>
                        {enterpriseContactDetails.data.enterpriseData.admin.name} has been notified. Please get in touch
                        with them for further details.
                      </>
                    }
                  ></Alert>
                ) : (
                  <Alert
                    type="info"
                    showIcon
                    icon={<AiOutlineQuestionCircle />}
                    message={
                      <>
                        Your organization is already on Requestly Professional Plan managed by{" "}
                        {enterpriseContactDetails.data.enterpriseData.admin.name}
                        . <br />
                        <span onClick={requestPremiumToAdmin} className="text-white text-underline cursor-pointer">
                          Click here
                        </span>{" "}
                        to request a Professional Plan subscription for you.
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
