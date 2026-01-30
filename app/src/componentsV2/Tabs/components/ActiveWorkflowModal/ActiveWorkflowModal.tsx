import React from "react";
import { Modal } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import "./activeWorkflowModal.scss";

interface ActiveWorkflowModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ActiveWorkflowModal: React.FC<ActiveWorkflowModalProps> = ({ open, onCancel, onConfirm }) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      maskClosable={false}
      destroyOnClose
      style={{ top: 80 }}
      width={600}
      className="active-workflow-modal-root"
    >
      <div className="active-workflow-modal">
        <h3 className="active-workflow-modal-title">Collection is still running</h3>
        <p className="active-workflow-modal-description">
          Leaving now will stop the run and discard remaining results.
        </p>
        <div className="active-workflow-modal-footer">
          <RQButton type="secondary" onClick={onCancel}>
            Continue running
          </RQButton>
          <RQButton type="danger" onClick={onConfirm}>
            Stop and leave
          </RQButton>
        </div>
      </div>
    </Modal>
  );
};
