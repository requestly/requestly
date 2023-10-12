import React, { useState } from "react";
import { Row, Card, CardHeader, Col, CardBody } from "reactstrap";
import { Button as AntButton } from "antd";
//SUB COMPONENTS
import ManageTeams from "./ManageTeams";
import ActiveLicenseInfo from "./ActiveLicenseInfo";
import UserInfo from "./UserInfo";
//UTILS
import { getUserAuthDetails } from "../../../../store/selectors";
import { redirectToUpdateSubscriptionContactUs } from "../../../../utils/RedirectionUtils";
// ACTIONS
import { handleForgotPasswordButtonOnClick } from "../../../authentication/AuthForm/actions";
// CONSTANTS
import APP_CONSTANTS from "../../../../config/constants";
import ProCard from "@ant-design/pro-card";

import { useSelector } from "react-redux";
import "./index.css";

const ManageAccount = () => {
  //Global State
  const user = useSelector(getUserAuthDetails);

  //Component State
  const [isChangePasswordLoading, setIsChangePasswordLoading] = useState(false);
  // const [cancelFormText, setCancelFormText] = useState("");
  // const [alternateEmail, setAlternateEmail] = useState("");
  // const [confirmLoading, setConfirmLoading] = useState(false);
  // const [cancelSubscriptionModal, setCancelSubscriptionModal] = useState(false);
  // Fallback image
  const defaultImageSrc = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
  const isUserPremium = user.details?.isPremium;
  let userImageSrc = user.details.profile.photoURL ? user.details.profile.photoURL : defaultImageSrc;

  const userDisplayName = user.details.profile.displayName ? user.details.profile.displayName : "User";

  // Reqeust larger gravatar
  if ("URLSearchParams" in window) {
    // To URL
    let userImageSrcURL = new URL(userImageSrc);
    let userImageSrcParams = userImageSrcURL.searchParams;
    // Set query param
    userImageSrcParams.set("s", "180");
    // Attach to new URL
    userImageSrcURL.search = userImageSrcParams.toString();
    // Attach to original URL
    userImageSrc = userImageSrcURL.toString();
  }

  const handleCancelSubscription = () => {
    redirectToUpdateSubscriptionContactUs();
  };

  return (
    <React.Fragment>
      {/* Page content */}
      <ProCard className="primary-card github-like-border">
        <Row className="profile-container">
          <Col className="profile-container-left profile-container-child" xl="8">
            <UserInfo shadow={true} hideBillingAddress={true} />
            {/* Active License Info */}
            <br />
            <ActiveLicenseInfo customHeading={"Active Subscription"} />
          </Col>
          <Col className="profile-container-right profile-container-child mb-5 mb-xl-0" xl="4">
            <Card className="profile-card profile-card-shadow">
              <Row className="justify-content-center">
                <Col className="order-lg-2" lg="3">
                  <div className="card-profile-image">
                    <a href="https://gravatar.com" target="_blank" rel="noopener noreferrer">
                      <img alt="..." className="rounded-circle" src={userImageSrc} />
                    </a>
                  </div>
                </Col>
              </Row>
              <CardHeader className="profile-card-header border-0 pt-1 pt-md-1 pb-0 pb-md-1"></CardHeader>
              <CardBody className="profile-card-body pt-0 pt-md-1" style={{ fontSize: "14px" }}>
                <Row>
                  <div className="col">
                    <div className="card-profile-stats d-flex justify-content-center mt-md-5"></div>
                  </div>
                </Row>
                <div className="text-center">
                  <h3>{userDisplayName}</h3>
                  <hr className="my-4" />
                  <div style={{ textAlign: "left" }}>
                    <Row className="my-2">
                      <Col>
                        <AntButton
                          type="secondary"
                          size="small"
                          loading={isChangePasswordLoading}
                          onClick={() => {
                            handleForgotPasswordButtonOnClick(
                              null,
                              user.details.profile.email,
                              () => setIsChangePasswordLoading(true),
                              () => setIsChangePasswordLoading(false)
                            );
                          }}
                        >
                          Change Password
                        </AntButton>
                      </Col>
                    </Row>
                    <Row className="my-2">
                      <Col>
                        <AntButton
                          type="secondary"
                          size="small"
                          onClick={() => window.open(APP_CONSTANTS.LINKS.GDPR.EXPORT_DATA, "_blank")}
                        >
                          Request Data Download
                        </AntButton>
                      </Col>
                    </Row>
                    <Row className="my-2">
                      <Col>
                        <AntButton
                          type="secondary"
                          size="small"
                          onClick={() => window.open(APP_CONSTANTS.LINKS.GDPR.DELETE_ACCOUNT, "_blank")}
                        >
                          Request Account Deletion
                        </AntButton>
                      </Col>
                    </Row>
                    <Row className="my-2">
                      <Col>
                        <AntButton
                          type="secondary"
                          size="small"
                          onClick={() => {
                            redirectToUpdateSubscriptionContactUs();
                          }}
                        >
                          Refresh Subscription
                        </AntButton>
                      </Col>
                    </Row>
                    {isUserPremium ? (
                      <Row className="my-2">
                        <Col>
                          <AntButton
                            type="secondary"
                            size="small"
                            onClick={() => {
                              // setCancelSubscriptionModal(true);
                              handleCancelSubscription();
                            }}
                          >
                            Cancel Subscription
                          </AntButton>
                        </Col>
                      </Row>
                    ) : null}
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Teams */}
        <Row>
          <Col>
            <CardBody className="profile-team-body">
              <ManageTeams />
            </CardBody>
          </Col>
        </Row>
      </ProCard>
    </React.Fragment>
  );
};

export default ManageAccount;
