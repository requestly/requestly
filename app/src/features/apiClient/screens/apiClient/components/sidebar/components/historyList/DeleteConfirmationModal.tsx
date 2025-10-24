import React from 'react';
import { Modal, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import './DeleteConfirmationModal.scss';

interface DeleteConfirmationModalProps {
  visible: boolean;
  type: 'single' | 'date';
  dateLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  visible,
  type,
  dateLabel,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const title = type === 'single' ? 'Delete History Item?' : `Delete history for ${dateLabel}?`;
  
  const message =
    type === 'single'
      ? 'Are you sure you want to delete this history item? This action cannot be undone.'
      : `Are you sure you want to delete all history items for "${dateLabel}"? This action cannot be undone.`;

  return (
    <Modal
      open={visible}
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
        loading,
        style: { backgroundColor: '#ff4d4f' }
      }}
      cancelButtonProps={{ disabled: loading }}
      className="delete-confirmation-modal"
      width={400}
      centered
    >
      <Typography.Text>{message}</Typography.Text>
    </Modal>
  );
};
