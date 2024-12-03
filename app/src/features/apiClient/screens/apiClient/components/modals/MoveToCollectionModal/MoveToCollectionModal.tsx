import { Modal } from "antd";
import CreatableReactSelect from "react-select/creatable";
import { useApiClientContext } from "features/apiClient/contexts";
import { RQAPI } from "features/apiClient/types";
import React, { useCallback, useMemo, useState } from "react";
import { upsertApiRecord } from "backend/apiClient";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { toast } from "utils/Toast";
import { RQButton } from "lib/design-system/components";
import { redirectToRequest } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import "./moveToCollectionModal.scss";

interface Props {
  recordToMove: RQAPI.Record;
  isOpen: boolean;
  onClose: () => void;
}

export const MoveToCollectionModal: React.FC<Props> = ({ isOpen, onClose, recordToMove }) => {
  const navigate = useNavigate();
  const { apiClientRecords, onSaveRecord } = useApiClientContext();
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector(getUserAuthDetails);
  const teamId = useSelector(getCurrentlyActiveWorkspace);

  const collectionOptions = useMemo(() => {
    return apiClientRecords
      .filter((record) => record.type === RQAPI.RecordType.COLLECTION)
      .map((record) => ({
        label: record.name,
        value: record.id,
      }));
  }, [apiClientRecords]);

  const handleRecordMove = useCallback(async () => {
    setIsLoading(true);
    if (selectedCollection?.__isNew__) {
      //create new collection and move request to it
      const collectionToBeCreated: Partial<RQAPI.CollectionRecord> = {
        collectionId: "",
        name: selectedCollection.label,
        type: RQAPI.RecordType.COLLECTION,
        deleted: false,
        data: {},
      };
      setIsLoading(true);
      const newCollection = await upsertApiRecord(user?.details?.profile?.uid, collectionToBeCreated, teamId);
      if (newCollection.success) {
        onSaveRecord(newCollection.data);
        const updatedRequest = { ...recordToMove, collectionId: newCollection.data.id };
        const result = await upsertApiRecord(user?.details?.profile?.uid, updatedRequest, teamId);
        if (result.success) {
          toast.success("Request moved to collection successfully");
          onSaveRecord(result.data);
          redirectToRequest(navigate, result.data.id);
        } else {
          toast.error("Failed to move request to collection");
        }
      } else {
        toast.error("Failed to create a new collection");
      }
      setIsLoading(false);
      onClose();
    } else {
      //move request to existing collection
      const updatedRequest = { ...recordToMove, collectionId: selectedCollection.value };
      const result = await upsertApiRecord(user.details?.profile?.uid, updatedRequest, teamId);
      setIsLoading(false);
      if (result.success) {
        toast.success("Request moved to collection successfully");
        onSaveRecord(result.data);
        redirectToRequest(navigate, result.data.id);
      } else {
        toast.error("Failed to move request to collection");
      }
      onClose();
    }
  }, [user?.details?.profile?.uid, teamId, onSaveRecord, recordToMove, selectedCollection, onClose, navigate]);

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title="Move to Collection"
      className="custom-rq-modal"
      footer={
        <RQButton type="primary" disabled={!selectedCollection} loading={isLoading} onClick={handleRecordMove}>
          {selectedCollection?.__isNew__ ? "Create collection and Move" : "Move"}
        </RQButton>
      }
    >
      <CreatableReactSelect
        isMulti={false}
        className="select-collection-group"
        classNamePrefix="select-collection-group"
        options={collectionOptions}
        filterOption={(option) => option.value !== selectedCollection?.value}
        placeholder="Select or type collection name"
        theme={(theme) => ({
          ...theme,
          borderRadius: 4,
          colors: {
            ...theme.colors,
            primary: "#ffffff19",
            primary25: "#282828",
            neutral0: "#1a1a1a",
          },
        })}
        value={selectedCollection}
        onChange={(newSelectedOption) => setSelectedCollection(newSelectedOption)}
      />
    </Modal>
  );
};
