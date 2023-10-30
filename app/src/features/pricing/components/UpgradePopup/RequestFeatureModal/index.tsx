import React from "react";
import Modal from "antd/lib/modal/Modal";
import { Col, Row, Space, Typography } from "antd";
import { RQButton } from "lib/design-system/components";
import { HiOutlinePaperAirplane } from "@react-icons/all-files/hi/HiOutlinePaperAirplane";
import { CloseOutlined } from "@ant-design/icons";
import "./index.scss";

export const RequestFeatureModal: React.FC = () => {
  return (
    <>
      <Modal
        open={true}
        footer={null}
        className="request-feature-modal"
        title="Send request to admin"
        closeIcon={<RQButton type="default" iconOnly icon={<CloseOutlined />} />}
        maskClosable={false}
      >
        <Typography.Text>
          Your organization is currently subscribed to the Requestly Professional Plan, which is managed by Sagar Soni.
          If you need a Requestly Professional subscription for yourself, just ask for it.
        </Typography.Text>
        <Row className="mt-16" justify="space-between" align="middle">
          <Col>
            <RQButton type="default" className="request-modal-default-btn">
              Use now for free
            </RQButton>
          </Col>
          <Col>
            <Space direction="horizontal" size={8}>
              <RQButton type="default" className="request-modal-default-btn">
                Upgrade yourself
              </RQButton>
              <RQButton type="primary" icon={<HiOutlinePaperAirplane className="send-icon" />}>
                Send request
              </RQButton>
            </Space>
          </Col>
        </Row>
      </Modal>
    </>
  );
};
