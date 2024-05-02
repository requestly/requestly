import React from "react";
import { Modal } from "antd";
import RuleBuilder from "../../../../../../components/features/rules/RuleBuilder";
import { Rule } from "types";

interface SharedListViewerModalProps {
  rule: Rule;
  isOpen: boolean;
  toggle: () => void;
}

export const SharedListViewerModal: React.FC<SharedListViewerModalProps> = ({ rule, isOpen, toggle }) => {
  if (!rule) {
    return <span></span>;
  }
  return (
    <Modal
      className="modal-dialog-centered max-width-80-percent "
      open={isOpen}
      onCancel={toggle}
      footer={null}
      title={`${rule.name} (Preview Mode)`}
      width="80%"
    >
      <RuleBuilder rule={rule} isSharedListViewRule={true} />
    </Modal>
  );
};
