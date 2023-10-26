import React from "react";
import { Col, Divider, Row, Typography } from "antd";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { RQButton } from "lib/design-system/components";
import { MdArrowBack } from "@react-icons/all-files/md/MdArrowBack";
import "./index.scss";

interface CheckoutProps {
  clientSecret: string;
  onCancel: () => void;
}
const stripePromise = loadStripe(
  "pk_test_51KflXlDiNNz2hbmOUApXI81Y1qQu3F9dt0xmoC79bnNjJnYU1tRr7YpkjSMOqI5kVKesBVv4HEfa5m6NMjSmolC600bkl82JE6"
);

export const Checkout: React.FC<CheckoutProps> = ({ clientSecret, onCancel }) => {
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
      <div className="checkout-embed-wrapper">
        {clientSecret ? (
          <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
            <EmbeddedCheckout className="embed-checkout" />
          </EmbeddedCheckoutProvider>
        ) : null}
      </div>
    </Col>
  );
};
