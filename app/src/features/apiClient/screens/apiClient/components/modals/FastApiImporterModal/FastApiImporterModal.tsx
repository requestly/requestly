import React from "react";
import { Modal } from "antd";
import { FastApiImporter } from "features/apiClient/screens/FastApiImporterView/components/FastApiImporter/FastApiImporter";

interface FastApiImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FastApiImporterModal: React.FC<FastApiImporterModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal open={isOpen} onCancel={onClose} footer={null} width={600}>
      <FastApiImporter onSuccess={onClose} />
    </Modal>
  );
};
