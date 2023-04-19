import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Card, CardHeader, Col, CardBody, Input, InputGroup, InputGroupText } from "reactstrap";
import { Button as AntButton } from "antd";
import { toast } from "utils/Toast.js";
//SUB COMPONENTS
import ManageTeams from "./ManageTeams";
import ActiveLicenseInfo from "./ActiveLicenseInfo";
import UserInfo from "./UserInfo";
//UTILS
import { getUserAuthDetails } from "../../../../store/selectors";
import DataStoreUtils from "../../../../utils/DataStoreUtils";
import {
  redirectToRefreshSubscription,
  redirectToUpdateSubscriptionContactUs,
} from "../../../../utils/RedirectionUtils";
// ACTIONS
import { handleForgotPasswordButtonOnClick } from "../../../authentication/AuthForm/actions";
import { refreshUserInGlobalState } from "../../common/actions";
// CONSTANTS
import APP_CONSTANTS from "../../../../config/constants";
import ProCard from "@ant-design/pro-card";
import { Dropdown, Menu } from "antd";

import isEmpty from "is-empty";
import { RiArrowDropDownLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";

const getDesignationDisplayValue = (originalValue) => {
  switch (originalValue) {
    case "marketer":
      return "Marketer";

    case "developer":
      return "Developer";

    case "designer":
      return "Designer";

    case "consultant":
      return "Consultant";

    case "support":
      return "Customer Support";

    case "eng_manager":
      return "Engineering Manager";

    case "prod_manager":
      return "Product Manager";

    case "tester":
      return "Tester";

    case "gamer":
      return "Video Gamer";

    case "goanimator":
      return "Goanimator";

    case "student":
      return "Student";

    case "other":
      return "Other";

    default:
      return "Developer";
  }
};

const getUserProfileDropdown = (currentValue, onChangeHandler) => {
  const allRoles = {
    0: "marketer",
    1: "developer",
    2: "designer",
    3: "consultant",
    4: "support",
    5: "eng_manager",
    6: "prod_manager",
    9: "marketer",
    10: "tester",
    11: "gamer",
    12: "student",
    13: "other",
  };

  function handleMenuClick(e) {
    const role = allRoles[e.key];
    onChangeHandler(role, getDesignationDisplayValue(role));
  }

  const menu = (
    <Menu onClick={handleMenuClick}>
      {Object.keys(allRoles).map((key) => (
        <Menu.Item key={key}>{getDesignationDisplayValue(allRoles[key])}</Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown overlay={menu}>
      <AntButton>
        <span style={{ textTransform: "capitalize", cursor: "pointer" }}>
          {isEmpty(currentValue) ? "Choose" : currentValue} <RiArrowDropDownLine className="remix-icon" />
        </span>
      </AntButton>
    </Dropdown>
  );
};

const ManageAccount = () => {
  const navigate = useNavigate();

  //Global State
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);

  //Component State
  const [areChangesPending, setAreChangesPending] = useState(false);
  const [userDesignation, setUserDesignation] = useState("");
  const [userCompanyName, setUserCompanyName] = useState("");
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

  const handleDesignationDropdownOnChange = (newValue, newDisplayValue) => {
    // Update local state
    setUserDesignation(newDisplayValue);
    // Save change to DB
    DataStoreUtils.updateValueAsPromise(["customProfile", user.details.profile.uid], {
      position: newValue,
    }).then(() => {
      // Refresh user in global state
      refreshUserInGlobalState(dispatch);
    });
  };

  const handleSaveProfileOnClick = () => {
    // Save change to DB
    DataStoreUtils.updateValueAsPromise(["customProfile", user.details.profile.uid], {
      companyName: userCompanyName,
    }).then(() => {
      // Notify
      toast.info("Profile saved");
      setAreChangesPending(false);
    });
  };

  const handleCancelSubscription = () => {
    redirectToUpdateSubscriptionContactUs();
  };
  useEffect(() => {
    // Initial values. Fetch full profile
    if (user.details) {
      DataStoreUtils.getValue(["customProfile", user.details.profile.uid]).then((customProfile) => {
        if (!customProfile) return;
        const { position, companyName } = customProfile;
        if (position) setUserDesignation(getDesignationDisplayValue(position));
        if (companyName) setUserCompanyName(companyName);
      });
    }
  }, [user.details.profile.uid, user]);

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
                  <div className="h5 mt-4">
                    <i className="ni business_briefcase-24 mr-2" />
                    {getUserProfileDropdown(userDesignation, handleDesignationDropdownOnChange)}
                  </div>
                  <div style={{ margin: "1rem 0" }}>
                    <InputGroup className="input-group mb-4">
                      <InputGroupText>
                        <i className="ni ni-building" />
                      </InputGroupText>
                      <Input
                        className="form-control-alternative"
                        type="text"
                        placeholder="Company name"
                        id="companyName"
                        value={userCompanyName}
                        onChange={(e) => {
                          setAreChangesPending(true);
                          setUserCompanyName(e.target.value);
                        }}
                        style={{ textTransform: "capitalize" }}
                      />
                    </InputGroup>
                  </div>
                  <div className="my-4">
                    <AntButton
                      type={areChangesPending ? "primary" : "secondary"}
                      onClick={handleSaveProfileOnClick}
                      disabled={!areChangesPending || !userCompanyName}
                    >
                      Save profile
                    </AntButton>
                  </div>
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
                            redirectToRefreshSubscription(navigate);
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
