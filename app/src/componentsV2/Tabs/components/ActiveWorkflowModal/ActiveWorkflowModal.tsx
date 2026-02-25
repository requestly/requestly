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
  const header = <div className="active-workflow-modal-title">Collection is still running</div>;

  const footer = (
    <div className="active-workflow-modal-footer">
      <RQButton type="secondary" onClick={onCancel}>
        Continue running
      </RQButton>
      <RQButton type="danger" onClick={onConfirm}>
        Stop and leave
      </RQButton>
    </div>
  );

  return (
    <Modal
      open={open}
      title={header}
      onCancel={onCancel}
      footer={footer}
      maskClosable={false}
      destroyOnClose
      style={{ top: 80 }}
      width={480}
      className="active-workflow-modal-root"
    >
      <p className="active-workflow-modal-description">Leaving now will stop the run and discard remaining results.</p>
    </Modal>
  );
};
