import React from "react";
import { Modal } from "antd";
import { IncentiveTasksList } from "../IncentiveTasksList/IncentiveTasksList";

interface IncentiveTasksListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IncentiveTasksListModal: React.FC<IncentiveTasksListModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal width={760} open={isOpen} onCancel={onClose} className="custom-rq-modal" footer={null}>
      <IncentiveTasksList />
    </Modal>
  );
};
