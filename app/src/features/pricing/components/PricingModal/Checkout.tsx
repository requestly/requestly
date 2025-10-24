import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Col, Divider, Result, Row, Space, Spin, Typography } from "antd";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { RQButton } from "lib/design-system/components";
import { LoadingOutlined } from "@ant-design/icons";
import { MdArrowBack } from "@react-icons/all-files/md/MdArrowBack";
import { trackPricingModalStripeWindowOpened } from "features/pricing/analytics";
import { redirectToAccountDetails } from "utils/RedirectionUtils";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getBillingTeamRedirectURL } from "backend/billing";
import "./index.scss";
import PATHS from "config/constants/sub/paths";
import { trackCheckoutCompleted } from "modules/analytics/events/misc/business/checkout";

interface CheckoutProps {
  clientSecret: string;
  stripeError: Error;
  isLoading: boolean;
  onCancel: () => void;
  toggleModal: () => void;
  source: string;
  onCheckoutCompleted?: () => void;
}
const stripePromise = loadStripe(process.env.VITE_REACT_APP_STRIPE_PUBLISHABLE_KEY);

export const Checkout: React.FC<CheckoutProps> = ({
  clientSecret,
  stripeError,
  isLoading,
  onCancel,
  toggleModal,
  source,
  onCheckoutCompleted,
}) => {
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);

  const redirectTolatestBillingTeam = async () => {
    getBillingTeamRedirectURL(user?.details?.profile?.uid).then((redirectUrl) => {
      if (!redirectUrl) {
        navigate(PATHS.SETTINGS.BILLING.RELATIVE);
      } else {
        navigate(redirectUrl + "?redirectedFromCheckout=true");
      }

      toggleModal();
    });
  };

  const options = {
    clientSecret,
    onComplete: () => {
      redirectTolatestBillingTeam();
      onCheckoutCompleted?.();
      trackCheckoutCompleted("requestly");
    },
  };

  useEffect(() => {
    if (!isLoading) trackPricingModalStripeWindowOpened(source);
  }, [isLoading, source]);

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
          <Typography.Title level={5}>
            {" "}
            Please wait for a moment while we get your payment options ready.
          </Typography.Title>
        </Col>
      ) : (
        <>
          {stripeError ? (
            <div className="checkout-error-wrapper">
              <Result
                status="warning"
                title={stripeError.message}
                extra={
                  <Space direction="vertical" size={8}>
                    <RQButton
                      type="primary"
                      onClick={() => {
                        redirectToAccountDetails(navigate);
                        toggleModal();
                      }}
                    >
                      Visit account settings
                    </RQButton>
                    <Divider plain>OR</Divider>
                    <Typography.Text>
                      Contact support <span className="text-bold text-underline">contact@requestly.io</span> to manage
                      it
                    </Typography.Text>
                  </Space>
                }
              />
            </div>
          ) : (
            <div className="checkout-embed-wrapper">
              {clientSecret ? (
                <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
                  <EmbeddedCheckout className="embed-checkout" />
                </EmbeddedCheckoutProvider>
              ) : null}
            </div>
          )}
        </>
      )}
    </Col>
  );
};
