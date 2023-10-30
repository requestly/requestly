import React, { useState, useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import Modal from "antd/lib/modal/Modal";
import { Col, Row, Space, Typography } from "antd";
import { RQButton } from "lib/design-system/components";
import { HiOutlinePaperAirplane } from "@react-icons/all-files/hi/HiOutlinePaperAirplane";
import { RiCloseCircleLine } from "@react-icons/all-files/ri/RiCloseCircleLine";
import { RiCheckboxCircleLine } from "@react-icons/all-files/ri/RiCheckboxCircleLine";
import { CloseOutlined } from "@ant-design/icons";
import { OrganizationsDetails } from "../types";
import { getFunctions, httpsCallable } from "firebase/functions";
import { trackEnterpriseRequestEvent } from "modules/analytics/events/misc/business/checkout";
import { actions } from "store";
import "./index.scss";

interface RequestFeatureModalProps {
  isOpen: boolean;
  organizationsData: OrganizationsDetails;
  toggleModal: () => void;
  onContinue?: () => void;
}

export const RequestFeatureModal: React.FC<RequestFeatureModalProps> = ({
  isOpen,
  organizationsData,
  toggleModal,
  onContinue,
}) => {
  const dispatch = useDispatch();
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
    requestEnterprisePlanFromAdmin({
      workspaceDetails: organizationsData?.workspaces,
    })
      .then(() => {
        setIsLoading(false);
        trackEnterpriseRequestEvent(domain);
        setPostRequestMessage({
          status: "success",
          message: (
            <Typography.Text>
              {enterpriseAdmin.adminName} has been notified. Please get in touch with them at{" "}
              <span className="enterprise-admin-details">{enterpriseAdmin.adminEmail} for futher details.</span>
            </Typography.Text>
          ),
        });
      })
      .catch((err) => {
        setIsLoading(false);
        setPostRequestMessage({
          status: "error",
          message: (
            <Typography.Text>
              Unable to send request, contact directly at{" "}
              <span className="enterprise-admin-details">{enterpriseAdmin.adminEmail} for futher details.</span>.
            </Typography.Text>
          ),
        });
      });
  }, [organizationsData?.workspaces, requestEnterprisePlanFromAdmin]);

  return (
    <>
      <Modal
        open={isOpen}
        onCancel={toggleModal}
        footer={null}
        className="request-feature-modal"
        title={!postRequestMessage && "Send request to admin"}
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
            <Typography.Text>{postRequestMessage.message}</Typography.Text>
            <RQButton type="primary" onClick={toggleModal}>
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
              . If you need a Requestly Professional subscription for yourself, just ask for it.
            </Typography.Text>
            <Row className="mt-16" justify="space-between" align="middle">
              <Col>
                <RQButton
                  type="default"
                  className="request-modal-default-btn"
                  disabled={isLoading}
                  onClick={() => {
                    toggleModal();
                    onContinue();
                  }}
                >
                  Use now for free
                </RQButton>
              </Col>
              <Col>
                <Space direction="horizontal" size={8}>
                  <RQButton
                    type="default"
                    className="request-modal-default-btn"
                    disabled={isLoading}
                    onClick={() =>
                      dispatch(
                        actions.toggleActiveModal({
                          modalName: "pricingModal",
                          newValue: true,
                          newProps: { selectedPlan: null },
                        })
                      )
                    }
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
