import React, { useState } from "react";
import { Row, Card, CardHeader, Col, CardBody } from "reactstrap";
import { Button as AntButton } from "antd";
//SUB COMPONENTS
import UserInfo from "./UserInfo";
//UTILS
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { redirectToDeleteAccount, redirectToSignDPA } from "../../../../utils/RedirectionUtils";
// ACTIONS
import { handleForgotPasswordButtonOnClick } from "features/onboarding/components/auth/components/Form/actions";
import ProCard from "@ant-design/pro-card";

import { useSelector } from "react-redux";
import "./index.css";
import { useNavigate } from "react-router-dom";

const ManageAccount = () => {
  //Global State
  const user = useSelector(getUserAuthDetails);
  const navigate = useNavigate();

  //Component State
  const [isChangePasswordLoading, setIsChangePasswordLoading] = useState(false);
  // Fallback image
  const defaultImageSrc = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
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

  return (
    <React.Fragment>
      {/* Page content */}
      <ProCard className="github-like-border settings-profile-wrapper">
        <Row className="profile-container">
          <Col className="profile-container-left profile-container-child" xl="8">
            <UserInfo shadow={true} hideBillingAddress={true} />
            {/* Active License Info */}
            <br />
            {/* <ActiveLicenseInfo customHeading={"Active Subscription"} /> */}
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
                          onClick={() => redirectToSignDPA(navigate, { newTab: true })}
                        >
                          Request DPA
                        </AntButton>
                      </Col>
                    </Row>
                    <Row className="my-2">
                      <Col>
                        <AntButton
                          type="secondary"
                          size="small"
                          onClick={() => redirectToDeleteAccount(navigate, { newTab: true })}
                        >
                          Request Account Deletion
                        </AntButton>
                      </Col>
                    </Row>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Teams */}
      </ProCard>
    </React.Fragment>
  );
};

export default ManageAccount;
