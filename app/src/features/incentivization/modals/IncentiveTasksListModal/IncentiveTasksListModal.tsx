import React, { useEffect } from "react";
import { Modal } from "antd";
import { IncentiveTasksList } from "../../components/IncentiveTasksList/IncentiveTasksList";
import { trackIncentivizationChecklistModalViewed } from "features/incentivization/analytics";
import "./incentiveTasksListModal.scss";

interface IncentiveTasksListModalProps {
  isOpen: boolean;
  toggle: () => void;
  source: string;
}

export const IncentiveTasksListModal: React.FC<IncentiveTasksListModalProps> = ({ isOpen, toggle, source }) => {
  useEffect(() => {
    if (isOpen) {
      trackIncentivizationChecklistModalViewed(source);
    }
  }, [source, isOpen]);

  return (
    <Modal
      width={760}
      open={isOpen}
      onCancel={toggle}
      className="custom-rq-modal incentive-tasks-modal"
      footer={null}
      centered
    >
      <IncentiveTasksList source={source} />
    </Modal>
  );
};
