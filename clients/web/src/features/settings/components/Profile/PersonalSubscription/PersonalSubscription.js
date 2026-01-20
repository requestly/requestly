import React from "react";
import { Col, Row, Card, CardBody, Container } from "reactstrap";
import ProCard from "@ant-design/pro-card";
// Sub Components
import ActiveLicenseInfo from "../ActiveLicenseInfo";
import InvoiceTable from "../ManageTeams/TeamViewer/BillingDetails/InvoiceTable";
// CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
// Firebase
const PersonalSubscription = () => {
  const renderBillingDetails = () => {
    return (
      <ProCard title={<h3 style={{ marginBottom: "0" }}>Billing</h3>} className="primary-card github-like-border">
        <CardBody className="border-0">
          <InvoiceTable mode="individual" />
        </CardBody>
      </ProCard>
    );
  };

  return (
    <ProCard gutter={[16, 16]}>
      <ProCard title={<h2 className="mb-0">Requestly Premium</h2>} className="primary-card github-like-border">
        <Container className=" mt--7" fluid>
          <Row>
            <Col>
              <Card className="shadow">
                <CardBody>
                  <ActiveLicenseInfo
                    hideShadow={true}
                    customHeading={"Currently Selected Subscription"}
                    hideManagePersonalSubscriptionButton={true}
                    hideIfSubscriptionIsPersonal={false}
                    hideIfNoSubscription={true}
                  />
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
