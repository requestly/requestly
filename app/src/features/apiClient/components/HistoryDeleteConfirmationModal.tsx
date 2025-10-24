import React from "react";
import { Button, Modal } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

interface HistoryDeleteConfirmationModalProps {
  isOpen: boolean;
  toggle: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  isDeleting?: boolean;
}

const HistoryDeleteConfirmationModal: React.FC<HistoryDeleteConfirmationModalProps> = ({
  isOpen,
  toggle,
  onConfirm,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this history item?",
  isDeleting = false,
}) => {
  const handleConfirm = () => {
    onConfirm();
    toggle();
  };

  return (
    <Modal
      className="modal-dialog-centered modal-danger"
      open={isOpen}
      onCancel={!isDeleting ? toggle : undefined}
      footer={null}
      title={title}
      width="40%"
    >
      <div className="modal-body">
        <div className="py-3 text-center">
          <h3 className="heading">{message}</h3>
        </div>
      </div>
      <div className="modal-footer" style={{ textAlign: "right" }}>
        <Button
          style={{ marginRight: "1rem" }}
          onClick={toggle}
          className="btn-white ml-auto"
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button
          danger
          type="primary"
          icon={<DeleteOutlined />}
          onClick={handleConfirm}
          loading={isDeleting}
          disabled={isDeleting}
        >
          Delete
        </Button>
      </div>
    </Modal>
  );
};

export default HistoryDeleteConfirmationModal;
