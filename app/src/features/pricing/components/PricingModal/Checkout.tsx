import React from "react";
import { Col, Divider, Row, Spin, Typography } from "antd";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { RQButton } from "lib/design-system/components";
import { LoadingOutlined } from "@ant-design/icons";
import { MdArrowBack } from "@react-icons/all-files/md/MdArrowBack";
import "./index.scss";

interface CheckoutProps {
  clientSecret: string;
  isLoading: boolean;
  onCancel: () => void;
}
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export const Checkout: React.FC<CheckoutProps> = ({ clientSecret, isLoading, onCancel }) => {
  const options = {
    clientSecret,
  };

  return (
    <Col className="checkout-screen-wrapper">
      <Row align="middle" gutter={8} className="checkout-screen-header">
        <Col>
          <RQButton iconOnly icon={<MdArrowBack className="checkout-back-btn-icon" />} onClick={onCancel} />
        </Col>
        <Col>
          <Typography.Title level={4}>Make Payment</Typography.Title>
        </Col>
      </Row>
      <Divider />
      {isLoading ? (
        <Col className="pricing-modal-loading-overlay">
          <Spin size="large" indicator={<LoadingOutlined className="text-white" spin />} />
          <Typography.Text> Please wait for a moment while we get your payment options ready.</Typography.Text>
        </Col>
      ) : (
        <div className="checkout-embed-wrapper">
          {clientSecret ? (
            <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
              <EmbeddedCheckout className="embed-checkout" />
            </EmbeddedCheckoutProvider>
          ) : null}
        </div>
      )}
    </Col>
  );
};
