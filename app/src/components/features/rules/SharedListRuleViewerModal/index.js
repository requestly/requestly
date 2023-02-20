import React from "react";
import { Modal } from "antd";
import RuleBuilder from "../RuleBuilder";

const SharedListViewerModal = ({ rule, isOpen, toggle }) => {
  if (!rule) {
    return <span></span>;
  }
  return (
    <Modal
      className="modal-dialog-centered max-width-80-percent "
      visible={isOpen}
      onCancel={toggle}
      footer={null}
      title={`${rule.name} (Preview Mode)`}
      width="80%"
    >
      <RuleBuilder rule={rule} isSharedListViewRule={true} />
    </Modal>
  );
};

export default SharedListViewerModal;
