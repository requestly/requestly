import React, { useCallback, useState, useEffect, useRef } from "react";
import { Col, Modal, Row, Switch, Typography } from "antd";
import { useSelector } from "react-redux";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { PricingTable, UpgradeWorkspaceMenu, PRICING } from "features/pricing";
import { CompaniesSection } from "../CompaniesSection";
import { CloseOutlined } from "@ant-design/icons";
import { IoIosArrowDropright } from "@react-icons/all-files/io/IoIosArrowDropright";
import { IoIosArrowDropleft } from "@react-icons/all-files/io/IoIosArrowDropleft";
import { RQButton } from "lib/design-system/components";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Checkout } from "./Checkout";
import TEAM_WORKSPACES from "config/constants/sub/team-workspaces";
import { trackPricingModalPlansViewed } from "features/pricing/analytics";
import { isNull } from "lodash";
import { TeamWorkspace } from "types";
import "./index.scss";

interface PricingModalProps {
  isOpen: boolean;
  toggleModal: () => void;
  selectedPlan?: string;
  workspace?: TeamWorkspace;
  title?: string;
  planDuration?: string;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  toggleModal,
  workspace,
  planDuration,
  selectedPlan = null,
  title = "Upgrade your plan to get the most out of Requestly",
}) => {
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const [workspaceToUpgrade, setWorkspaceToUpgrade] = useState(
    workspace?.id
      ? workspace
      : isNull(currentlyActiveWorkspace.id)
      ? TEAM_WORKSPACES.PRIVATE_WORKSPACE
      : currentlyActiveWorkspace
  );

  const [duration, setDuration] = useState(planDuration || PRICING.DURATION.ANNUALLY);
  const [stripeClientSecret, setStripeClientSecret] = useState(null);
  const [stripeError, setStripeError] = useState(null);
  const [isCheckoutScreenVisible, setIsCheckoutScreenVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTableScrolledToRight, setIsTableScrolledToRight] = useState(false);
  const tableRef = useRef(null);

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
      const subscriptionData = {
        currency: "usd",
        teamId: workspaceToUpgrade?.id === TEAM_WORKSPACES.PRIVATE_WORKSPACE.id ? null : workspaceToUpgrade?.id,
        quantity: workspaceToUpgrade?.accessCount || 1,
        planName: planName,
        duration: duration,
      };
      if (workspaceToUpgrade?.id === TEAM_WORKSPACES.PRIVATE_WORKSPACE.id) {
        createIndividualSubscriptionUsingStripeCheckout(subscriptionData)
          .then((data: any) => {
            setStripeClientSecret(data?.data?.payload.clientSecret);
            setIsLoading(false);
          })
          .catch((err) => {
            setStripeError(err);
            setIsLoading(false);
          });
      } else {
        createTeamSubscriptionUsingStripeCheckout(subscriptionData)
          .then((data: any) => {
            setStripeClientSecret(data?.data?.payload.clientSecret);
            setIsLoading(false);
          })
          .catch((err) => {
            setStripeError(err);
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

  useEffect(() => {
    if (!isCheckoutScreenVisible) trackPricingModalPlansViewed();
  }, [isCheckoutScreenVisible]);

  return (
    <Modal
      centered
      open={isOpen}
      onCancel={toggleModal}
      footer={null}
      width={1130}
      className="pricing-modal"
      maskClosable={false}
      maskStyle={{ backdropFilter: "blur(4px)", background: "none" }}
      closeIcon={<RQButton iconOnly icon={<CloseOutlined className="pricing-modal-close-icon" />} />}
    >
      <div className="pricing-modal-wrapper">
        {isCheckoutScreenVisible ? (
          <Checkout
            clientSecret={stripeClientSecret}
            stripeError={stripeError}
            onCancel={() => setIsCheckoutScreenVisible(false)}
            isLoading={isLoading}
            toggleModal={toggleModal}
          />
        ) : (
          <>
            <Col span={24} className="display-row-center" style={{ paddingTop: "1rem" }}>
              <Typography.Title level={4}>{title}</Typography.Title>
            </Col>
            <Row justify="center" className="display-row-center w-full mt-8" gutter={24}>
              <Col>
                <UpgradeWorkspaceMenu
                  workspaceToUpgrade={workspaceToUpgrade}
                  setWorkspaceToUpgrade={setWorkspaceToUpgrade}
                  isOpenedFromModal
                />
              </Col>
              <Col className="display-row-center plan-duration-switch-container">
                <Switch
                  size="small"
                  checked={duration === PRICING.DURATION.ANNUALLY}
                  onChange={(checked) => {
                    setDuration(checked ? PRICING.DURATION.ANNUALLY : PRICING.DURATION.MONTHLY);
                  }}
                />{" "}
                <span>
                  Annual pricing <span className="success">(save 20%)</span>
                </span>
              </Col>
            </Row>
            {isTableScrolledToRight ? (
              <div className="pricing-modal-left-inset-shadow">
                <IoIosArrowDropleft
                  onClick={() => {
                    tableRef.current.scrollLeft = 0;
                    setIsTableScrolledToRight(false);
                  }}
                />
              </div>
            ) : (
              <div className="pricing-modal-right-inset-shadow">
                <IoIosArrowDropright
                  onClick={() => {
                    tableRef.current.scrollLeft = tableRef.current.scrollWidth;
                    setIsTableScrolledToRight(true);
                  }}
                />
              </div>
            )}

            <PricingTable
              workspaceToUpgrade={workspaceToUpgrade}
              duration={duration}
              isOpenedFromModal
              handleOnSubscribe={handleSubscribe}
              tableRef={tableRef}
            />
            <CompaniesSection />
          </>
        )}
      </div>
    </Modal>
  );
};
