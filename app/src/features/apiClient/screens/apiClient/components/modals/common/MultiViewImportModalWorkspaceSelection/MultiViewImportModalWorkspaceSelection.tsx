import React, { useCallback } from "react";
import { Alert } from "antd";
import { useImportModalContext } from "../../../sidebar/components/apiClientSidebarHeader/contexts/importModal.context";
import { MoveIntoWorkspaceSelect } from "../../MoveToCollectionModal/MoveToCollectionModal";
import { RQButton } from "lib/design-system-v2/components";
import "./multiViewImportModalWorkspaceSelection.scss";

interface MultiViewImportModalWorkspaceSelectionProps {
  isImporting: boolean;
  onClose?: () => void;
  onImportClick: () => void;
}

export const MultiViewImportModalWorkspaceSelection: React.FC<MultiViewImportModalWorkspaceSelectionProps> = ({
  isImporting,
  onClose,
  onImportClick,
}) => {
  const { setImportModalContext } = useImportModalContext();

  const handleWorkspaceSelect = useCallback(
    (w: { label: string; value: string }) => {
      setImportModalContext(w.value);
    },
    [setImportModalContext]
  );

  return (
    <div className="multi-view-import-modal-success-container">
      <Alert showIcon type="success" message="Data has been parsed and is ready to import" />

      <label>
        <div>Select a workspace to import the data</div>
        <MoveIntoWorkspaceSelect onWorkspaceSelect={handleWorkspaceSelect} />
      </label>

      <div className="actions">
        {onClose ? (
          <RQButton onClick={onClose} loading={isImporting}>
            Cancel
          </RQButton>
        ) : null}

        <RQButton type="primary" onClick={onImportClick} loading={isImporting}>
          Import
        </RQButton>
      </div>
    </div>
  );
};
