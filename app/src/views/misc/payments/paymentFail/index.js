import { ArrowRightOutlined } from "@ant-design/icons";
import ProCard from "@ant-design/pro-card";
import { Result, Button, Row, Col, Typography } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
// Utils
import { redirectToPricingPlans } from "../../../../utils/RedirectionUtils";
import { trackCheckoutFailedEvent } from "modules/analytics/events/misc/business/checkout";

const { Text } = Typography;

const PaymentFail = () => {
  const navigate = useNavigate();
  trackCheckoutFailedEvent();
  return (
    <>
      <ProCard className="primary-card github-like-border">
        <Result
          status="warning"
          title="We are unable to verify this transaction!"
          subTitle="Please try again
          with a different payment method. Any amount deducted would be automatically
          credited back to your card."
          extra={[
            <Button
              type="primary"
              onClick={() => redirectToPricingPlans(navigate)}
              key="go-back"
              icon={<ArrowRightOutlined />}
            >
              Try again
            </Button>,
          ]}
        />
        <Row>
          <Col span={24} align="center">
            <Text type="secondary">
              To pay via PayPal or wire transfer, write to us at
              contact@requestly.io
            </Text>
          </Col>
        </Row>
      </ProCard>
    </>
  );
};

export default PaymentFail;
