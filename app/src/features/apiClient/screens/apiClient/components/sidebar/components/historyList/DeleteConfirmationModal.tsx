import React from 'react';
import { Modal, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import './DeleteConfirmationModal.scss';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  isDeleting,
  onConfirm,
  onCancel,
}) => (
  <Modal
    open={isOpen}
    title={
      <div className="delete-modal-title">
        <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
        {title}
      </div>
    }
    onOk={onConfirm}
    onCancel={onCancel}
    okText="Delete"
    cancelText="Cancel"
    okButtonProps={{
      danger: true,
      loading: isDeleting,
      style: { backgroundColor: '#ff4d4f' },
    }}
    cancelButtonProps={{ disabled: isDeleting }}
    className="delete-confirmation-modal"
    width={400}
    centered
  >
    <Typography.Text>{message}</Typography.Text>
  </Modal>
);

export default DeleteConfirmationModal;

