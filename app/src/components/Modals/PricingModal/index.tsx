import React, { useCallback, useState } from "react";
import { Col, Modal, Row, Switch, Typography } from "antd";
import { PricingTable, UpgradeWorkspaceMenu, PRICING } from "features/pricing";
import { CloseOutlined } from "@ant-design/icons";
import APP_CONSTANTS from "config/constants";
import "./index.scss";
import { RQButton } from "lib/design-system/components";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Checkout } from "./Checkout";

const PRIVATE_WORKSPACE = {
  name: APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE,
  id: "private_workspace",
  accessCount: 1,
};

const PricingModal: React.FC = () => {
  const [workspaceToUpgrade, setWorkspaceToUpgrade] = useState(PRIVATE_WORKSPACE);
  const [duration, setDuration] = useState(PRICING.DURATION.ANNUALLY);
  const [stripeClientSecret, setStripeClientSecret] = useState(null);
  const [isCheckoutScreenVisible, setIsCheckoutScreenVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = useCallback(
    (planName: string) => {
      const functions = getFunctions();
      const createTeamSubscriptionUsingStripeCheckout = httpsCallable(
        functions,
        "createTeamSubscriptionUsingStripeCheckout"
      );
      const createIndividualSubscriptionUsingStripeCheckout = httpsCallable(
        functions,
        "createIndividualSubscriptionUsingStripeCheckout"
      );

      setIsLoading(true);
      if (workspaceToUpgrade?.id === PRIVATE_WORKSPACE.id) {
        createIndividualSubscriptionUsingStripeCheckout({
          currency: "usd",
          teamId: null,
          quantity: 1,
          planName: planName,
          duration: duration,
        }).then((data: any) => {
          setStripeClientSecret(data?.data?.payload.clientSecret);
          setIsLoading(false);
          setIsCheckoutScreenVisible(true);
        });
      } else {
        createTeamSubscriptionUsingStripeCheckout({
          currency: "usd",
          teamId: workspaceToUpgrade?.id,
          quantity: workspaceToUpgrade?.accessCount || 1,
          planName: planName,
          duration: duration,
        }).then((data: any) => {
          setStripeClientSecret(data?.data?.payload.clientSecret);
          setIsLoading(false);
          setIsCheckoutScreenVisible(true);
        });
      }
    },
    [duration, workspaceToUpgrade?.id, workspaceToUpgrade?.accessCount]
  );

  return (
    <Modal
      centered
      open={true}
      footer={null}
      width={1130}
      className="pricing-modal"
      maskStyle={{ backdropFilter: "blur(4px)", background: "none" }}
      closeIcon={<RQButton iconOnly icon={<CloseOutlined className="pricing-modal-close-icon" />} />}
    >
      <div className="pricing-modal-wrapper">
        {isLoading ? (
          <div className="pricing-modal-loading-overlay">Loading...</div>
        ) : isCheckoutScreenVisible ? (
          <Checkout clientSecret={stripeClientSecret} onCancel={() => setIsCheckoutScreenVisible(false)} />
        ) : (
          <>
            <Col span={24} className="display-row-center" style={{ paddingTop: "1rem" }}>
              <Typography.Title level={4}>Upgrade your plan for unlimited active rules</Typography.Title>
            </Col>
            <Row justify="center" className="display-row-center w-full mt-16" gutter={24}>
              <Col>
                <UpgradeWorkspaceMenu
                  workspaceToUpgrade={workspaceToUpgrade}
                  setWorkspaceToUpgrade={setWorkspaceToUpgrade}
                />
              </Col>
              <Col className="display-row-center plan-duration-switch-container">
                <Switch
                  size="small"
                  checked={duration === PRICING.DURATION.ANNUALLY}
                  onChange={(checked) => {
                    if (checked) setDuration(PRICING.DURATION.ANNUALLY);
                    else setDuration(PRICING.DURATION.MONTHLY);
                  }}
                />{" "}
                <span>
                  Annual pricing <span className="success">(save 20%)</span>
                </span>
              </Col>
            </Row>
            <div className="pricing-modal-inset-shadow"></div>
            <PricingTable
              workspaceToUpgrade={workspaceToUpgrade}
              duration={duration}
              isOpenedFromModal
              handleOnSubscribe={handleSubscribe}
            />
          </>
        )}
      </div>
    </Modal>
  );
};

export default PricingModal;
