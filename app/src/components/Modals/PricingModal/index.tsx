import React from "react";
import { Modal, Row } from "antd";
import { PricingTable } from "features/pricing";
import "./index.scss";

const PricingModal: React.FC = () => {
  return (
    <Modal
      centered
      open={true}
      footer={null}
      width={1130}
      className="pricing-modal"
      maskStyle={{ backdropFilter: "blur(4px)", background: "none" }}
    >
      <Row className="pricing-modal-wrapper">
        <div className="pricing-modal-inset-shadow"></div>
        <PricingTable />
      </Row>
    </Modal>
  );
};

export default PricingModal;
