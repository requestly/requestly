import React from "react";
import { RQModal } from "lib/design-system/components";
import { RQButton } from "lib/design-system-v2/components";
import "./deleteAllRuntimeVariables.scss";

interface DeleteAllRuntimeVariablesModalProps {
  open: boolean;
  onClose: () => void;
  onClickDelete: () => void;
}

export const DeleteAllRuntimeVariablesModal: React.FC<DeleteAllRuntimeVariablesModalProps> = ({
  open,
  onClose,
  onClickDelete,
}) => {
  const header = "Delete all variables?";

  const description =
    "This action will delete all runtime variables across the entire application. This cannot be undone. Are you sure you want to proceed?";

  return (
    <RQModal
      width={320}
      open={open}
      closable={false}
      maskClosable={false}
      destroyOnClose={true}
      className="delete-runtime-variables-record-modal"
    >
      <div className="delete-runtime-info">
        <img width={32} height={32} src={"/assets/media/common/delete.svg"} alt="Delete" className="icon" />
        <div className="header">{header}</div>
      </div>

      <div className="description">{description}</div>

      <div className="actions">
        <RQButton block onClick={onClose}>
          Cancel
        </RQButton>
        <RQButton block type="danger" onClick={onClickDelete}>
          Delete
        </RQButton>
      </div>
    </RQModal>
  );
};
