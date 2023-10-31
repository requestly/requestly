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

interface OrgContactDetails {
  workspaces: Array<{
    adminName: string;
    adminEmail: string;
    workspaceName?: string;
  }>;
}

export default function EnterpriseRequestBanner(): React.ReactNode {
  const user = useSelector(getUserAuthDetails);
  const [orgContactDetails, setOrgContactDetails] = useState<OrgContactDetails>(null);
  const [enterpriseRequestedState, setEnterpriseRequestedState] = useState(0); // 1 is clicked, 2 is sent

  // FIREBASE FUNCTIONS
  const functions = getFunctions();
  const getEnterpriseAdminDetails = httpsCallable<null, { enterpriseData: OrgContactDetails; success: boolean }>(
    functions,
    "getEnterpriseAdminDetails"
  );
  const requestEnterprisePlanFromAdmin = httpsCallable<{ workspaceDetails: OrgContactDetails["workspaces"] }, null>(
    functions,
    "requestEnterprisePlanFromAdmin"
  );

  const requestPremiumToAdmin = useCallback(() => {
    setEnterpriseRequestedState(1);
    const enterpriseAdmin = orgContactDetails?.workspaces?.[0];
    const domain = enterpriseAdmin.adminEmail.split("@")[1];
    trackTeamPlanCardClicked(domain);
    requestEnterprisePlanFromAdmin({
      workspaceDetails: orgContactDetails?.workspaces,
    })
      .then(() => {
        //GA4
        trackEnterpriseRequestEvent(domain);
        setEnterpriseRequestedState(2);
      })
      .catch((err) => {
        toast.error("Unable to send email");
        toast.info(`Contact directly at: ${enterpriseAdmin.adminEmail}`);
      });
  }, [orgContactDetails?.workspaces, requestEnterprisePlanFromAdmin]);

  useEffect(() => {
    if (user?.details?.isLoggedIn) {
      if (!orgContactDetails) {
        getEnterpriseAdminDetails().then((response) => {
          if (response.data.success) {
            const contactDetails = response.data.enterpriseData;
            setOrgContactDetails(contactDetails);
            trackTeamPlanCardShown(contactDetails?.workspaces?.[0]?.adminEmail?.split("@")?.[1]);
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
              <Col span={24} className="display-row-center">
                <LoadingOutlined />
              </Col>
            </Row>
            <br />
          </>
        ) : (
          <>
            <Row className="pricing-alert-row">
              <Col span={24} className="display-row-center">
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
                        Your organization is already on Requestly Professional Plan managed by{" "}
                        {orgContactDetails?.workspaces?.map((workspace) => workspace.adminName)?.join(", ")}
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
