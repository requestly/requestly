import React from "react";
import { Modal } from "antd";
import { PostmanImporter } from "features/apiClient/screens/PostmanImporterView/components/PostmanImporter/PostmanImporter";

interface PostmanImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PostmanImporterModal: React.FC<PostmanImporterModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal open={isOpen} onCancel={onClose} footer={null} width={490}>
      <PostmanImporter onSuccess={onClose} onCancel={onClose} />
    </Modal>
  );
};
