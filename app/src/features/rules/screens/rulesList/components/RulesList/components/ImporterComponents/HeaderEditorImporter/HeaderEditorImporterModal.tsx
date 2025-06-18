import { Modal } from "antd";
import React from "react";

import { HeaderEditorImporter } from "./HeaderEditorImporterComponent";

interface ModalProps {
  isOpen: boolean;
  toggle: () => void;
  triggeredBy: string;
}

export const HeaderEditorImporterModal: React.FC<ModalProps> = ({ isOpen, toggle }) => {
  return (
    <Modal
      open={isOpen}
      centered
      onCancel={toggle}
      footer={null}
      className="header-editor-importer-modal custom-rq-modal"
      width={550}
    >
      <HeaderEditorImporter />
    </Modal>
  );
};
