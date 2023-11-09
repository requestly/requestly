import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import Modal from "antd/lib/modal/Modal";
import { Col, Row, Space, Typography } from "antd";
import { RQButton } from "lib/design-system/components";
import { HiOutlinePaperAirplane } from "@react-icons/all-files/hi/HiOutlinePaperAirplane";
import { RiCloseCircleLine } from "@react-icons/all-files/ri/RiCloseCircleLine";
import { RiCheckboxCircleLine } from "@react-icons/all-files/ri/RiCheckboxCircleLine";
import { CloseOutlined } from "@ant-design/icons";
import { OrganizationsDetails } from "../../types";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getPrettyPlanNameFromId } from "utils/PremiumUtils";
import { capitalize } from "lodash";
import { actions } from "store";
import { trackEnterpriseRequestEvent } from "modules/analytics/events/misc/business/checkout";
import { trackUpgradeOptionClicked, trackUpgradePopoverViewed } from "../../analytics";
import { trackTeamPlanCardClicked } from "modules/analytics/events/common/teams";
import "./index.scss";

interface RequestFeatureModalProps {
  isOpen: boolean;
  organizationsData: OrganizationsDetails;
  hasReachedLimit?: boolean;
  source: string;
  setOpenPopup: (open: boolean) => void;
  onContinue?: () => void;
}

export const RequestFeatureModal: React.FC<RequestFeatureModalProps> = ({
  isOpen,
  organizationsData,
  hasReachedLimit,
  source,
  setOpenPopup,
  onContinue,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const [isLoading, setIsLoading] = useState(false);
  const [postRequestMessage, setPostRequestMessage] = useState(null);

  const requestEnterprisePlanFromAdmin = useMemo(
    () =>
      httpsCallable<{ workspaceDetails: OrganizationsDetails["workspaces"] }, null>(
        getFunctions(),
        "requestEnterprisePlanFromAdmin"
      ),
    []
  );

  const handleSendRequest = useCallback(() => {
    setIsLoading(true);
    const enterpriseAdmin = organizationsData?.workspaces?.[0];
    const domain = enterpriseAdmin.adminEmail.split("@")[1];

    trackTeamPlanCardClicked(domain, "in_app");
    trackUpgradeOptionClicked("send_request_to_admin");

    requestEnterprisePlanFromAdmin({
      workspaceDetails: organizationsData?.workspaces,
    })
      .then(() => {
        setIsLoading(false);
        trackEnterpriseRequestEvent(domain);
        setPostRequestMessage({
          status: "success",
          message: (
            <>
              Workspace {organizationsData?.workspaces?.length > 1 ? "admins have" : "admin has"} been notified. Please
              get in touch with them for further details.
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
              <span className="enterprise-admin-details">{enterpriseAdmin.adminEmail} for futher details.</span>.
            </>
          ),
        });
      });
  }, [organizationsData?.workspaces, requestEnterprisePlanFromAdmin]);

  const renderModalTitle = () => {
    if (!postRequestMessage) {
      return (
        <>
          {hasReachedLimit ? (
            <Typography.Title level={5}>
              {capitalize(getPrettyPlanNameFromId(user?.details?.planDetails?.planId)) || "Free"} plan limits reached!
            </Typography.Title>
          ) : (
            <Typography.Title level={5}>This feature is a part of our paid offering</Typography.Title>
          )}
        </>
      );
    }

    return null;
  };

  useEffect(() => {
    if (isOpen) {
      trackUpgradePopoverViewed("send_request", source);
    }
  }, [isOpen, source]);

  return (
    <>
      <Modal
        open={isOpen}
        onCancel={() => {
          setOpenPopup(false);
          setPostRequestMessage(null);
        }}
        footer={null}
        className="request-feature-modal"
        title={renderModalTitle()}
        maskStyle={{ backdropFilter: "blur(4px)", background: "none" }}
        closeIcon={<RQButton type="default" iconOnly icon={<CloseOutlined />} />}
        maskClosable={false}
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
              Your organization is currently subscribed to the Requestly Professional Plan, which is managed by{" "}
              <span className="enterprise-admin-details">
                {organizationsData?.workspaces?.map((workspace) => workspace.adminName)?.join(", ")}
              </span>
              . If you need a Requestly Professional subscription for yourself, send request to admin.
            </Typography.Text>
            <Row className="mt-16" justify="space-between" align="middle">
              <Col>
                <RQButton
                  type="link"
                  className="request-modal-link-btn"
                  disabled={isLoading}
                  onClick={() => {
                    trackUpgradeOptionClicked("use_for_free_now");
                    setOpenPopup(false);
                    onContinue();
                  }}
                >
                  Use for now
                </RQButton>
              </Col>
              <Col>
                <Space direction="horizontal" size={8}>
                  <RQButton
                    type="default"
                    className="request-modal-default-btn"
                    disabled={isLoading}
                    onClick={() => {
                      trackUpgradeOptionClicked("upgrade_yourself");
                      dispatch(
                        actions.toggleActiveModal({
                          modalName: "pricingModal",
                          newValue: true,
                          newProps: { selectedPlan: null },
                        })
                      );
                    }}
                  >
                    Upgrade yourself
                  </RQButton>
                  <RQButton
                    loading={isLoading}
                    type="primary"
                    icon={<HiOutlinePaperAirplane className="send-icon" />}
                    onClick={handleSendRequest}
                  >
                    Send request
                  </RQButton>
                </Space>
              </Col>
            </Row>
          </>
        )}
      </Modal>
    </>
  );
};
