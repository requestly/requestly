import React from "react";
import { Modal } from "antd";
import { IncentiveTasksList } from "../../components/IncentiveTasksList/IncentiveTasksList";
import "./incentiveTasksListModal.scss";

interface IncentiveTasksListModalProps {
  isOpen: boolean;
  toggle: () => void;
}

export const IncentiveTasksListModal: React.FC<IncentiveTasksListModalProps> = ({ isOpen, toggle }) => {
  return (
    <Modal
      width={760}
      open={isOpen}
      onCancel={toggle}
      className="custom-rq-modal incentive-tasks-modal"
      footer={null}
      centered
    >
      <IncentiveTasksList />
    </Modal>
  );
};
