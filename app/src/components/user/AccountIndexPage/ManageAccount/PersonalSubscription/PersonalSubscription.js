import React, { useRef, useState, useCallback, useEffect } from "react";
import { Col, Row, Card, CardHeader, CardBody, Container } from "reactstrap";
import { Button } from "antd";
import ProCard from "@ant-design/pro-card";
import { CalendarOutlined } from "@ant-design/icons";
// Sub Components
import ActiveLicenseInfo from "../ActiveLicenseInfo";
import CurrentPersonalSubscription from "./CurrentPersonalSubscription";
import InvoiceTable from "../ManageTeams/TeamViewer/BillingDetails/InvoiceTable";
// CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import APP_CONSTANTS from "../../../../../config/constants/index";
// UTILS
import { redirectToUpdateSubscription } from "../../../../../utils/RedirectionUtils";
// ICONS
import { Link } from "react-router-dom";
// Firebase
import { getFunctions, httpsCallable } from "firebase/functions";
const PersonalSubscription = () => {
  const mountedRef = useRef(true);
  // Component State
  const [isPersonalSubscriptionActive, setIsPersonalSubscriptionActive] = useState(true);

  const fetchIndividualUserSubscriptionDetails = () => {
    const functions = getFunctions();
    const fetchIndividualUserSubscriptionDetailsFF = httpsCallable(functions, "fetchIndividualUserSubscriptionDetails");

    fetchIndividualUserSubscriptionDetailsFF()
      .then((res) => {
        if (!mountedRef.current) return null;
        if (res.data.success === false) {
          setIsPersonalSubscriptionActive(false);
          return;
        }
        const userSubscriptionDetails = res.data.data;
        if (userSubscriptionDetails.status === "canceled") {
          setIsPersonalSubscriptionActive(false);
        }
      })
      .catch((err) => {
        if (!mountedRef.current) return null;
      });
  };

  const stableFetchIndividualSubscriptionData = useCallback(fetchIndividualUserSubscriptionDetails, []);

  const renderBillingDetails = () => {
    return (
      <ProCard title={<h3 style={{ marginBottom: "0" }}>Billing</h3>} className="primary-card github-like-border">
        <CardBody className="border-0">
          <InvoiceTable mode="individual" />
        </CardBody>
      </ProCard>
    );
  };

  useEffect(() => {
    stableFetchIndividualSubscriptionData();
    return () => {
      mountedRef.current = false;
    };
  }, [stableFetchIndividualSubscriptionData]);
  return (
    <ProCard gutter={[16, 16]}>
      <ProCard title={<h2 className="mb-0">Requestly Premium</h2>} className="primary-card github-like-border">
        <Container className=" mt--7" fluid>
          <Row>
            <Col>
              <Card className="shadow">
                <CardHeader className="border-0 ">
                  <Row>
                    {!isPersonalSubscriptionActive ? null : (
                      <Col
                        xs="12"
                        xl="6"
                        lg="6"
                        md="6"
                        // className="text-center text-sm-center text-xl-right text-md-right text-lg-right"
                      >
                        <Button
                          type="primary"
                          onClick={() => {
                            redirectToUpdateSubscription({
                              mode: "individual",
                              planType: "gold",
                            });
                          }}
                          icon={<CalendarOutlined />}
                        >
                          Change Plan
                        </Button>
                      </Col>
                    )}
                  </Row>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col>
                      <h4 style={{ textAlign: "center" }}>
                        You can manage your personal subscription here. If you want to manage a subscription for a Team
                        instead, click <Link to={APP_CONSTANTS.PATHS.ACCOUNT.MY_TEAMS.ABSOLUTE}>here</Link>.
                      </h4>
                    </Col>
                  </Row>
                  <ActiveLicenseInfo
                    hideShadow={true}
                    customHeading={"Currently Selected Subscription"}
                    hideManagePersonalSubscriptionButton={true}
                    hideIfSubscriptionIsPersonal={true}
                    hideIfNoSubscription={true}
                  />
                  <br />
                  <CurrentPersonalSubscription hideShadow={true} customHeading={"Personal Subscription"} />
                  <br />
                  {renderBillingDetails()}

                  <Row>
                    <Col style={{ fontSize: "0.8125rem" }} className="text-center fix-dark-mode-color">
                      Any questions? Reach our payment support team at{" "}
                      <a href={`mailto:${GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL}`}>
                        {GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL}
                      </a>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </ProCard>
    </ProCard>
  );
};

export default PersonalSubscription;
