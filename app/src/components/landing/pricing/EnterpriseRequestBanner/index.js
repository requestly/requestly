import React, { useState, useEffect, useCallback } from "react";
import { Row, Col, Alert } from "antd";
import { toast } from "utils/Toast.js";
import { getFunctions, httpsCallable } from "firebase/functions";
import { trackEnterpriseRequestEvent } from "modules/analytics/events/misc/business/checkout";
import { LoadingOutlined } from "@ant-design/icons";
import { AiOutlineQuestionCircle } from "@react-icons/all-files/ai/AiOutlineQuestionCircle";
import "./index.css";
import { trackTeamPlanCardClicked, trackTeamPlanCardShown } from "modules/analytics/events/common/teams";
import { getUserAuthDetails } from "store/selectors";
import { useSelector } from "react-redux";

export default function EnterpriseRequestBanner() {
  const user = useSelector(getUserAuthDetails);
  const [orgContactDetails, setOrgContactDetails] = useState(null);
  const [enterpriseRequestedState, setEnterpriseRequestedState] = useState(0); // 1 is clicked, 2 is sent

  // FIREBASE FUNCTIONS
  const functions = getFunctions();
  const getEnterpriseAdminDetails = httpsCallable(functions, "getEnterpriseAdminDetails");
  const requestEnterprisePlanFromAdmin = httpsCallable(functions, "requestEnterprisePlanFromAdmin");

  const requestPremiumToAdmin = useCallback(() => {
    setEnterpriseRequestedState(1);
    const enterpriseAdmin = orgContactDetails?.admin;
    const domain = enterpriseAdmin.email.split("@")[1];
    trackTeamPlanCardClicked(domain);
    requestEnterprisePlanFromAdmin({
      userEmail: user?.details?.profile?.email,
      adminEmail: enterpriseAdmin.email,
      adminName: enterpriseAdmin.name,
    })
      .then(() => {
        //GA4
        trackEnterpriseRequestEvent(domain);
        setEnterpriseRequestedState(2);
      })
      .catch((err) => {
        toast.error("Unable to send email");
        toast.info(`Contact directly at: ${enterpriseAdmin.email}`);
      });
  }, [orgContactDetails?.admin, requestEnterprisePlanFromAdmin, user?.details?.profile?.email]);

  useEffect(() => {
    if (user?.details?.isLoggedIn) {
      if (!orgContactDetails) {
        getEnterpriseAdminDetails({}).then((response) => {
          if (response.data.success) {
            const contactDetails = response.data.enterpriseData;
            setOrgContactDetails(contactDetails);
            trackTeamPlanCardShown(contactDetails?.admin?.email?.split("@")?.[1]);
          }
        });
      }
    }
  }, [orgContactDetails, getEnterpriseAdminDetails, user?.details?.isLoggedIn]);

  if (user?.details?.isPremium) return null;

  return (
    <React.Fragment>
      {orgContactDetails !== null ? (
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
                        {orgContactDetails?.admin?.name} has been notified. Please get in touch with them for further
                        details.
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
                        {orgContactDetails?.admin?.name}
                        . <br />
                        <span onClick={requestPremiumToAdmin} className="text-white text-underline cursor-pointer">
                          Click here
                        </span>{" "}
                        to request a Requestly Professional subscription for you.
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
