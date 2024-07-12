import { Modal } from "antd";
import React from "react";
import { ImportFromModheader } from "./ModheaderImporter";

interface ModalProps {
  isOpen: boolean;
  toggle: () => void;
  triggeredBy: string;
}

export const ImportFromModheaderModal: React.FC<ModalProps> = ({ isOpen, toggle, triggeredBy }) => {
  return (
    <Modal
      open={isOpen}
      centered
      onCancel={toggle}
      footer={null}
      className="import-from-modheader-modal custom-rq-modal"
      width={550}
    >
      <ImportFromModheader source={triggeredBy} callback={() => toggle()} />
    </Modal>
  );
};
