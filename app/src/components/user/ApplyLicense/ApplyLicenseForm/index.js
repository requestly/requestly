import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Alert, FormGroup } from "reactstrap";
import { Button, Form, Input, Row, Col, Typography } from "antd";
//Sub Components
import SpinnerColumn from "../../../misc/SpinnerColumn";
//Utils
import { getUserAuthDetails } from "../../../../store/selectors";
import { submitAttrUtil } from "../../../../utils/AnalyticsUtils";
//Firebase
import { getFunctions, httpsCallable } from "firebase/functions";
//CONSTANTS
import APP_CONSTANTS from "../../../../config/constants";
import { KeyOutlined, UserOutlined } from "@ant-design/icons";
import Jumbotron from "components/bootstrap-legacy/jumbotron";

const { Link } = Typography;

const TRACKING = APP_CONSTANTS.GA_EVENTS;

const ApplyLicenseForm = () => {
  //Global State
  const user = useSelector(getUserAuthDetails);

  //Component State
  const [licenseCode, setLicenseCode] = useState("");
  const [planId, setPlanId] = useState("");
  const [company, setCompany] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [descriptionMessage, setDescriptionMessage] = useState("");
  const [hasLicense, setHasLicense] = useState(false);
  //   const [isExpired, setIsExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [validUpto, setValidUpto] = useState(false);

  const fetchLoginDetails = () => {
    if (user.details.isLoggedIn) {
      setEmail(user.details.profile.email);

      if (user.details.planDetails && user.details.planDetails.type === "license") {
        const subscriptionObj = user.details.planDetails.subscription || {};
        const endDate = subscriptionObj.endDate || subscriptionObj.current_period_end * 1000;
        const formattedEndDate = new Date(endDate).toISOString().split("T")[0];
        //   const formattedCurrentDate = new Date().toISOString().split("T")[0];

        setHasLicense(user.details.planDetails.type === "license");
        setPlanId(user.details.planDetails.planId);
        setLicenseCode(user.details.planDetails.subscription.id);
        setValidUpto(new Date(formattedEndDate).toDateString());
        //   setIsExpired(formattedCurrentDate > formattedEndDate);
      }

      setIsLoading(false);
    }
  };

  const stableFetchLoginDetails = useCallback(fetchLoginDetails, [
    user.details.isLoggedIn,
    user.details.planDetails,
    user.details.profile.email,
  ]);

  const getSigninStatus = () => {
    setIsLoading(true);
    stableFetchLoginDetails();
  };

  const stableGetSignInStatus = useCallback(getSigninStatus, [stableFetchLoginDetails]);

  const handleApplyLicense = () => {
    setIsApplying(true);
    const functions = getFunctions();
    const applyLicense = httpsCallable(functions, "applyLicense");

    applyLicense({ license: licenseCode, company: company, email: email }).then((result) => {
      setIsApplying(false);
      setIsApplied(result.data.success);
      setDescriptionMessage(result.data.message);

      if (result.data.success) {
        submitAttrUtil(TRACKING.ATTR.LICENSE, licenseCode);
        submitAttrUtil(TRACKING.ATTR.COMPANY, company);

        //Refresh page
        window.location.reload();
      } else {
        //Reset Form
        setLicenseCode("");
      }

      fetchLoginDetails();
    });
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    handleApplyLicense();
  };

  useEffect(() => {
    stableGetSignInStatus();
  }, [stableGetSignInStatus, user]);

  if (isLoading) {
    return <SpinnerColumn message="Fetching your license details" />;
  } else if (hasLicense) {
    return (
      <Row>
        <Col span={24} align="center">
          <Jumbotron style={{ background: "transparent" }} className="text-center">
            {/* <h1 className="display-3">License Info</h1> */}
            <h3>
              <Alert color="secondary">
                <strong>
                  <span className="alert-inner--icon" role="img" aria-label="emoji">
                    📢
                  </span>
                </strong>{" "}
                <span className="alert-inner--text">
                  License is being replaced by Teams.{" "}
                  <Link
                    onClick={() => window.open(APP_CONSTANTS.LINKS.REQUESTLY_DOCS_PREMIUM_SUBSCRIPTION, "_blank")}
                    className="cursor-pointer"
                  >
                    Read more
                  </Link>
                </span>
              </Alert>
            </h3>
            <br />
            <p className="lead">
              You have a <strong>{planId.split("_")[0].toUpperCase()}</strong> License Key.
            </p>
            <p className="lead">
              Your License is valid upto : <strong>{validUpto}</strong>
            </p>
            {/* <p className="lead">
              <Button color="primary">Chrome</Button>
              <Button color="primary">Firefox</Button>
            </p> */}
          </Jumbotron>
        </Col>
      </Row>
    );
  } else {
    const isErrorMode = descriptionMessage && !isApplied;
    const isSuccessMode = descriptionMessage && isApplied;
    return (
      <Form onSubmit={handleFormSubmit} role="form" id="applyLicenseForm">
        <center>
          <h3>
            <Alert color="secondary">
              <strong>
                <span className="alert-inner--icon" role="img" aria-label="emoji">
                  📢
                </span>
              </strong>{" "}
              <span className="alert-inner--text">
                License is being replaced by Teams.{" "}
                <Link
                  onClick={() => window.open(APP_CONSTANTS.LINKS.REQUESTLY_DOCS_PREMIUM_SUBSCRIPTION, "_blank")}
                  className="cursor-pointer"
                >
                  Read more
                </Link>
              </span>
            </Alert>
          </h3>
          <br />
          <h3>Please enter the following details </h3>
        </center>
        <br />
        <center>
          <Row>
            <Col align="center" span={8} offset={8}>
              <FormGroup
                className={["mb-3", isErrorMode ? "has-danger" : "", isSuccessMode ? "has-success" : ""].join(" ")}
                style={{ width: "50%" }}
              >
                <Input
                  required={true}
                  type="text"
                  placeholder="Company Name"
                  value={company}
                  disabled={isApplied}
                  onChange={(e) => setCompany(e.target.value)}
                  className={[
                    "form-control-alternative",
                    isErrorMode ? "is-invalid" : "",
                    isSuccessMode ? "is-valid" : "",
                  ].join(" ")}
                  addonBefore={<UserOutlined />}
                />
                <br />

                <Input
                  style={{ marginTop: "2%" }}
                  required={true}
                  type="text"
                  placeholder="License Key"
                  value={licenseCode}
                  disabled={isApplied}
                  onChange={(e) => setLicenseCode(e.target.value)}
                  className={[
                    "form-control-alternative",
                    isErrorMode ? "is-invalid" : "",
                    isSuccessMode ? "is-valid" : "",
                  ].join(" ")}
                  addonBefore={<KeyOutlined />}
                />
                {isApplied ? null : (
                  <Button className="my-4" type="primary" style={{ marginTop: "2%" }} loading={isApplying}>
                    Apply License
                  </Button>
                )}
              </FormGroup>
            </Col>
          </Row>
        </center>
        {isErrorMode ? (
          <center>
            <h4 style={{ color: "red" }}>{descriptionMessage}</h4>
          </center>
        ) : null}

        {isSuccessMode ? (
          <center>
            <h4 style={{ color: "green" }}>{descriptionMessage}</h4>
          </center>
        ) : null}
      </Form>
    );
  }
};

export default ApplyLicenseForm;
