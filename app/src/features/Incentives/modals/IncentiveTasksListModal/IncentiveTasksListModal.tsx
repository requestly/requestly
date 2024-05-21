import React from "react";
import { Modal } from "antd";
import { IncentiveTasksList } from "../../components/IncentiveTasksList/IncentiveTasksList";
import "./incentiveTasksListModal.scss";

interface IncentiveTasksListModalProps {
  isOpen: boolean;
  toggleModal: () => void;
}

export const IncentiveTasksListModal: React.FC<IncentiveTasksListModalProps> = ({ isOpen, toggleModal }) => {
  return (
    <Modal
      width={760}
      open={isOpen}
      onCancel={toggleModal}
      className="custom-rq-modal incentive-tasks-modal"
      footer={null}
      centered
    >
      <IncentiveTasksList />
    </Modal>
  );
};
