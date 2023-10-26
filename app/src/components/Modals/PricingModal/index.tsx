import React, { useState } from "react";
import { Col, Modal, Row, Switch, Typography } from "antd";
import { PricingTable, UpgradeWorkspaceMenu, PRICING } from "features/pricing";
import { CloseOutlined } from "@ant-design/icons";
import APP_CONSTANTS from "config/constants";
import "./index.scss";
import { RQButton } from "lib/design-system/components";

const PRIVATE_WORKSPACE = {
  name: APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE,
  id: "private_workspace",
  accessCount: 1,
};

const PricingModal: React.FC = () => {
  const [workspaceToUpgrade, setWorkspaceToUpgrade] = useState(PRIVATE_WORKSPACE);
  const [duration, setDuration] = useState(PRICING.DURATION.ANNUALLY);

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
      <Row className="pricing-modal-wrapper">
        <Col span={24} className="display-row-center">
          <Typography.Title level={3} className="pricing-modal-title">
            Upgrade your plan for unlimited active rules
          </Typography.Title>
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
        <PricingTable workspaceToUpgrade={workspaceToUpgrade} duration={duration} />
      </Row>
    </Modal>
  );
};

export default PricingModal;
