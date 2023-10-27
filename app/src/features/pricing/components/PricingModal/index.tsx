import React, { useCallback, useState, useEffect } from "react";
import { Col, Modal, Row, Switch, Typography } from "antd";
import { PricingTable, UpgradeWorkspaceMenu, PRICING } from "features/pricing";
import { CompaniesSection } from "../CompaniesSection";
import { CloseOutlined } from "@ant-design/icons";
import { RQButton } from "lib/design-system/components";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Checkout } from "./Checkout";
import APP_CONSTANTS from "config/constants";
import "./index.scss";

interface PricingModalProps {
  isOpen: boolean;
  toggleModal: () => void;
  selectedPlan?: string;
  workspace?: any;
}

const PRIVATE_WORKSPACE = {
  name: APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE,
  id: "private_workspace",
  accessCount: 1,
};

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  toggleModal,
  workspace = PRIVATE_WORKSPACE,
  selectedPlan = null,
}) => {
  const [workspaceToUpgrade, setWorkspaceToUpgrade] = useState(workspace);
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
      setIsCheckoutScreenVisible(true);
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
        });
      }
    },
    [duration, workspaceToUpgrade?.id, workspaceToUpgrade?.accessCount]
  );

  useEffect(() => {
    if (selectedPlan) {
      setIsCheckoutScreenVisible(true);
      setIsLoading(true);
      handleSubscribe(selectedPlan);
    }
  }, [selectedPlan, handleSubscribe]);

  return (
    <Modal
      centered
      open={isOpen}
      onCancel={toggleModal}
      footer={null}
      width={1130}
      className="pricing-modal"
      maskStyle={{ backdropFilter: "blur(4px)", background: "none" }}
      closeIcon={<RQButton iconOnly icon={<CloseOutlined className="pricing-modal-close-icon" />} />}
    >
      <div className="pricing-modal-wrapper">
        {isCheckoutScreenVisible ? (
          <Checkout
            clientSecret={stripeClientSecret}
            onCancel={() => setIsCheckoutScreenVisible(false)}
            isLoading={isLoading}
          />
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
            <CompaniesSection />
          </>
        )}
      </div>
    </Modal>
  );
};
