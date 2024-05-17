import React from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { Modal, Spin } from "antd";
import "./index.scss";

interface ActionLoadingModalProps {
  title: string;
  message?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ActionLoadingModal: React.FC<ActionLoadingModalProps> = ({ isOpen, onClose, title, message }) => {
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      width={350}
      closable={false}
      maskClosable={false}
      footer={null}
      centered
      className="custom-rq-modal action-loading-modal"
    >
      <div className="loading-modal-title-wrapper">
        <Spin indicator={<LoadingOutlined className="loading-modal-spinner" spin />} />
        <div className="loading-modal-title">{title}</div>
      </div>
      {message && <div className="loading-modal-message">{message}</div>}
    </Modal>
  );
};
