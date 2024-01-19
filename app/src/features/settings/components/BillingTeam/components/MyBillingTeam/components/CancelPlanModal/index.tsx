import React, { useState } from "react";
import { Col, Input, Modal, Row } from "antd";
import { RQButton } from "lib/design-system/components";
import "./index.scss";

interface Props {
  isOpen: boolean;
  closeModal: () => void;
}

export const CancelPlanModal: React.FC<Props> = ({ isOpen, closeModal }) => {
  const [reason, setReason] = useState("");

  return (
    <Modal
      width={600}
      open={isOpen}
      onCancel={closeModal}
      title="Send request to cancel your plan"
      className="cancel-plan-modal"
      footer={
        <Row className="w-full" justify="space-between" align="middle">
          <RQButton type="default" onClick={closeModal}>
            Close
          </RQButton>
          <RQButton type="primary" danger>
            Send cancellation request
          </RQButton>
        </Row>
      }
    >
      <Col className="cancel-plan-modal-description">
        Once cancelled, your professional plan stays active until Wednesday, Dec 23, 2023. After that, all premium
        features won't be accessible to you. We highly recommend you to export your rules/data before cancelling.
      </Col>
      <Col className="mt-16">
        <label className="text-bold text-white">Please let us know the reason for plan cancellation (Optional)</label>
        <Input.TextArea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="cancel-plan-modal-textarea"
          style={{ height: 80, resize: "none" }}
        />
      </Col>
    </Modal>
  );
};
