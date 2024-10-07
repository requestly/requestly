import React, { useState } from "react";
import { Input } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import { RQModal } from "lib/design-system/components";
import { toast } from "utils/Toast";
import { upsertApiRecord } from "backend/apiClient";
import { getUserAuthDetails } from "store/selectors";
import { useSelector } from "react-redux";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { RQAPI } from "features/apiClient/types";
import "./createOrUpdateCollectionModal.scss";

interface Props {
  id?: string;
  name?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onNewRecord: (record: RQAPI.Record) => void;
  onUpdateRecord: (record: RQAPI.Record) => void;
}

export const CreateOrUpdateCollectionModal: React.FC<Props> = ({
  id,
  name,
  isOpen,
  onClose,
  onSuccess,
  onNewRecord,
  onUpdateRecord,
}) => {
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const teamId = workspace?.id;

  const [isLoading, setIsLoading] = useState(false);
  const [collectionName, setCollectionName] = useState("");

  const handleSaveClick = async () => {
    setIsLoading(true);

    if (collectionName.length === 0) {
      toast.error("Please provide a name for a collection!");
      return;
    }

    // TODO: handle rename collection

    const record: Partial<RQAPI.CollectionRecord> = {
      type: RQAPI.RecordType.COLLECTION,
      data: { name: collectionName },
    };

    const result = await upsertApiRecord(uid, record, teamId);

    if (result.success) {
      console.log({ result });
      onNewRecord(result.data);
      toast.success("Collection created!");
    } else {
      toast.error("Something went wrong, create the collection again!");
    }

    setCollectionName("");
    setIsLoading(false);
    onSuccess?.();
    onClose();
  };

  return (
    <RQModal destroyOnClose open={isOpen} footer={null} onCancel={onClose} className="api-client-collection-modal">
      <div className="collection-modal-header">{name ? "Update Collection" : "New collection"}</div>
      <div className="collection-modal-content">
        <label className="collection-name-label">
          <span>Collection name</span>
          <Input
            required
            autoFocus
            value={collectionName}
            onChange={(e) => {
              setCollectionName(e.target.value);
            }}
          />
        </label>
      </div>
      <div className="collection-modal-actions">
        <RQButton onClick={onClose}>Cancel</RQButton>
        <RQButton type="primary" loading={isLoading} onClick={handleSaveClick} disabled={!collectionName}>
          Save
        </RQButton>
      </div>
    </RQModal>
  );
};
