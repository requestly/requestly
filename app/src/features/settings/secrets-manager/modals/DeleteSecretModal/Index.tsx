import React from "react";
import { RQModal } from "lib/design-system/components";
import { RQButton } from "lib/design-system-v2/components";
import "./index.scss";

interface DeleteSecretModalProps {
  open: boolean;
  onClose: () => void;
  onDelete?: () => void | Promise<void>;
  isLoading?: boolean;
  error?: string;
  secretAlias?: string;
}

const DeleteSecretModal: React.FC<DeleteSecretModalProps> = ({
  open,
  onClose,
  onDelete,
  isLoading = false,
  error,
  secretAlias,
}) => {
  const header = "Delete secret?";
  const description = `Are you sure you want to delete "${secretAlias}"? This action cannot be undone.`;

  return (
    <RQModal
      width={320}
      open={open}
      closable={false}
      maskClosable={false}
      destroyOnClose={true}
      className="delete-secret-modal"
      onCancel={onClose}
    >
      <img width={32} height={32} src={"/assets/media/common/delete.svg"} alt="Delete" className="icon" />
      <div className="header">{header}</div>
      <div className="description">{description}</div>
      {error && <div className="error-message">{error}</div>}

      <div className="actions">
        <RQButton block onClick={onClose} disabled={isLoading}>
          Cancel
        </RQButton>
        <RQButton block type="danger" onClick={onDelete} loading={isLoading} disabled={isLoading}>
          Delete
        </RQButton>
      </div>
    </RQModal>
  );
};

export default DeleteSecretModal;
