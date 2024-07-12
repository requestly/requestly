import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserAuthDetails } from "store/selectors";
import Modal from "antd/lib/modal/Modal";
import { Col, Row, Space, Typography } from "antd";
import { RQButton } from "lib/design-system/components";
import { HiOutlinePaperAirplane } from "@react-icons/all-files/hi/HiOutlinePaperAirplane";
import { RiCloseCircleLine } from "@react-icons/all-files/ri/RiCloseCircleLine";
import { RiCheckboxCircleLine } from "@react-icons/all-files/ri/RiCheckboxCircleLine";
import { CloseOutlined } from "@ant-design/icons";
import { getFunctions, httpsCallable } from "firebase/functions";
import { capitalize } from "lodash";
import { actions } from "store";
import { trackEnterpriseRequestEvent } from "modules/analytics/events/misc/business/checkout";
import { trackUpgradeOptionClicked, trackUpgradePopoverViewed } from "../../analytics";
import { trackTeamPlanCardClicked } from "modules/analytics/events/common/teams";
import { BillingTeamDetails } from "features/settings/components/BillingTeam/types";
import APP_CONSTANTS from "config/constants";
import { getBillingTeamMemberById } from "store/features/billing/selectors";
import { getDomainFromEmail } from "utils/FormattingHelper";
import { SOURCE } from "modules/analytics/events/common/constants";
import { INCENTIVIZATION_SOURCE } from "features/incentivization";
import { IncentivizationModal } from "store/features/incentivization/types";
import { incentivizationActions } from "store/features/incentivization/slice";
import { useIsIncentivizationEnabled } from "features/incentivization/hooks";
import "./index.scss";

interface RequestFeatureModalProps {
  isOpen: boolean;
  billingTeams: BillingTeamDetails[];
  hasReachedLimit?: boolean;
  source: string;
  isDeadlineCrossed: boolean;
  featureName?: string;
  setOpenPopup: (open: boolean) => void;
  onContinue?: () => void;
  onUpgradeYourselfClickCallback?: () => void;
  onUpgradeForFreeClickCallback?: () => void;
}

export const RequestFeatureModal: React.FC<RequestFeatureModalProps> = ({
  isOpen,
  billingTeams,
  hasReachedLimit,
  source,
  isDeadlineCrossed,
  setOpenPopup,
  onContinue,
  featureName,
  onUpgradeYourselfClickCallback,
  onUpgradeForFreeClickCallback,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const [isLoading, setIsLoading] = useState(false);
  const [postRequestMessage, setPostRequestMessage] = useState(null);
  const teamOwnerDetails = useSelector(getBillingTeamMemberById(billingTeams[0]?.id, billingTeams[0]?.owner));
  const isIncentivizationEnabled = useIsIncentivizationEnabled();

  const requestEnterprisePlanFromAdmin = useMemo(
    () =>
      httpsCallable<{ billingId: string }, null>(getFunctions(), "premiumNotifications-requestEnterprisePlanFromAdmin"),
    []
  );

  const handleSendRequest = useCallback(() => {
    setIsLoading(true);
    const domain = getDomainFromEmail(user?.details?.profile?.email);
    trackTeamPlanCardClicked(domain, source);
    trackUpgradeOptionClicked("send_request_to_admin");

    requestEnterprisePlanFromAdmin({
      billingId: billingTeams[0].id,
    })
      .then(() => {
        setIsLoading(false);
        trackEnterpriseRequestEvent(domain);
        setPostRequestMessage({
          status: "success",
          message: (
            <>
              Billing team admins been notified.
              <br /> Please get in touch with them for further details.
            </>
          ),
        });
      })
      .catch((err) => {
        setIsLoading(false);
        setPostRequestMessage({
          status: "error",
          message: (
            <>
              Unable to send request, contact directly at{" "}
              <span className="enterprise-admin-details">{teamOwnerDetails?.email} for futher details.</span>.
            </>
          ),
        });
      });
  }, [requestEnterprisePlanFromAdmin, source, billingTeams, user?.details?.profile?.email, teamOwnerDetails?.email]);

  const renderModalTitle = () => {
    if (!postRequestMessage) {
      return (
        <>
          {hasReachedLimit ? (
            <Typography.Title level={5}>
              {capitalize(user?.details?.planDetails?.planName) || "Free"} plan limits reached!
            </Typography.Title>
          ) : (
            <Typography.Title level={5}>
              {featureName ?? "This feature"} is a part of our paid offering
            </Typography.Title>
          )}
        </>
      );
    }

    return null;
  };

  const ModalActionButtons = useMemo(() => {
    return (
      <Row className="mt-16" justify="space-between" align="middle">
        {isIncentivizationEnabled && (
          <Col>
            <RQButton
              type="text"
              className="request-modal-text-btn"
              disabled={isLoading}
              onClick={() => {
                onUpgradeForFreeClickCallback();
                trackUpgradeOptionClicked("upgrade_for_free");
                dispatch(
                  incentivizationActions.toggleActiveModal({
                    modalName: IncentivizationModal.TASKS_LIST_MODAL,
                    newValue: true,
                    newProps: {
                      source: INCENTIVIZATION_SOURCE.UPGRADE_POPOVER,
                    },
                  })
                );

                setOpenPopup(false);
                setPostRequestMessage(null);
              }}
            >
              Upgrade for free
            </RQButton>
          </Col>
        )}

        <Col>
          <Space direction="horizontal" size={8}>
            <RQButton
              type="default"
              className="request-modal-default-btn"
              disabled={isLoading}
              onClick={() => {
                onUpgradeYourselfClickCallback();
                trackUpgradeOptionClicked("upgrade_yourself");
                dispatch(
                  // @ts-ignore
                  actions.toggleActiveModal({
                    modalName: "pricingModal",
                    newValue: true,
                    newProps: { selectedPlan: null, source: SOURCE.REQUEST_FEATURE_MODAL },
                  })
                );

                setOpenPopup(false);
                setPostRequestMessage(null);
              }}
            >
              Upgrade yourself
            </RQButton>
            {billingTeams.length > 1 ? (
              <RQButton
                type="primary"
                onClick={() => {
                  trackUpgradeOptionClicked(SOURCE.CHECKOUT_BILLING_TEAMS);
                  navigate(`${APP_CONSTANTS.PATHS.SETTINGS.BILLING.RELATIVE}/${billingTeams[0].id}`);
                }}
              >
                Checkout billing teams
              </RQButton>
            ) : (
              <RQButton
                loading={isLoading}
                type="primary"
                icon={<HiOutlinePaperAirplane className="send-icon" />}
                onClick={handleSendRequest}
              >
                Send request
              </RQButton>
            )}
          </Space>
        </Col>
      </Row>
    );
  }, [billingTeams, dispatch, handleSendRequest, isLoading, navigate, user, isIncentivizationEnabled]);

  useEffect(() => {
    if (isOpen) {
      trackUpgradePopoverViewed("send_request", source);
    }
  }, [isOpen, source]);

  return (
    <Modal
      open={isOpen}
      onCancel={(e) => {
        e?.stopPropagation?.();
        setOpenPopup(false);
        setPostRequestMessage(null);
      }}
      footer={null}
      className="request-feature-modal"
      title={renderModalTitle()}
      maskStyle={{ backdropFilter: "blur(4px)", background: "none" }}
      closeIcon={<RQButton type="default" iconOnly icon={<CloseOutlined />} />}
      maskClosable={false}
      zIndex={10010}
    >
      {postRequestMessage ? (
        <Col className="post-request-message-container">
          {postRequestMessage.status === "success" ? (
            <RiCheckboxCircleLine className="success" />
          ) : (
            <RiCloseCircleLine className="danger" />
          )}
          <Typography.Text className="post-request-message">{postRequestMessage.message}</Typography.Text>
          <RQButton
            type="primary"
            onClick={() => {
              setOpenPopup(false);
              setPostRequestMessage(null);
            }}
          >
            Close
          </RQButton>
        </Col>
      ) : (
        <>
          <Typography.Text>
            Your organization is currently subscribed to the Requestly Premium Plan. If you need a Requestly
            Professional subscription for yourself, send request to admin.
          </Typography.Text>
          {ModalActionButtons}
        </>
      )}
    </Modal>
  );
};
