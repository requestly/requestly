import React from "react";
import { Modal } from "antd";
import { PostmanImporter } from "features/apiClient/screens/PostmanImporterView/components/PostmanImporter/PostmanImporter";

interface PostmanImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PostmanImporterModal: React.FC<PostmanImporterModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal open={isOpen} onCancel={onClose} footer={null} width={600}>
      <PostmanImporter onSuccess={onClose} />
    </Modal>
  );
};
