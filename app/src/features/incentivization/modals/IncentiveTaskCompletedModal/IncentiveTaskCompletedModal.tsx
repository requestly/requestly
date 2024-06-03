import React from "react";
import { Modal } from "antd";
import { RQButton } from "lib/design-system/components";
import giftIcon from "./assets/gift.svg";
import "./incentiveTaskCompletedModal.scss";

interface IncentiveTaskCompletedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IncentiveTaskCompletedModal: React.FC<IncentiveTaskCompletedModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal width={368} open={isOpen} onCancel={onClose} className="custom-rq-modal task-completed-modal" footer={null}>
      <div className="task-completed-modal-body">
        {/* TODO: REPLACE WITH DIFFERENT ASSEST */}
        <img src={giftIcon} alt="gift" />
        <div className="task-completed-modal-title">Congratulations!</div>
        <div className="task-completed-modal-subtitle">You earned $25 on creating your first rule.</div>
        <div className="task-completed-modal-description">
          Unlock an additional $105 worth of free credits by completing these 6 steps.
        </div>
        <div className="task-completed-actions-container">
          <RQButton type="primary">Complete now</RQButton>
          <RQButton type="default" onClick={onClose}>
            Remind me later
          </RQButton>
        </div>
      </div>
    </Modal>
  );
};
