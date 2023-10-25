import React from "react";
import { Modal } from "antd";
import { PricingTable } from "features/pricing";
import "./index.scss";

const PricingModal: React.FC = () => {
  return (
    <Modal
      open={true}
      footer={null}
      width={1130}
      className="pricing-modal"
      maskStyle={{ backdropFilter: "blur(4px)", background: "none" }}
    >
      <PricingTable />
    </Modal>
  );
};

export default PricingModal;
