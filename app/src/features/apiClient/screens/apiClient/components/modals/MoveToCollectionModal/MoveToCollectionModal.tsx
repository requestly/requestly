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
import {
  trackMoveRequestToCollectionFailed,
  trackMoveRequestToCollectionSuccessful,
} from "modules/analytics/events/features/apiClient";
import "./moveToCollectionModal.scss";

interface Props {
  recordToMove: RQAPI.Record;
  isOpen: boolean;
  onClose: () => void;
}

export const MoveToCollectionModal: React.FC<Props> = ({ isOpen, onClose, recordToMove }) => {
  const { apiRecordsList, onSaveRecord } = useApiClientContext();
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector(getUserAuthDetails);
  const team = useSelector(getCurrentlyActiveWorkspace);

  const collectionOptions = useMemo(() => {
    return apiRecordsList
      .filter((record) => record.type === RQAPI.RecordType.COLLECTION)
      .map((record) => ({
        label: record.name,
        value: record.id,
      }));
  }, [apiRecordsList]);

  const createNewCollection = useCallback(async () => {
    const collectionToBeCreated: Partial<RQAPI.CollectionRecord> = {
      collectionId: "",
      name: selectedCollection?.label,
      type: RQAPI.RecordType.COLLECTION,
      deleted: false,
      data: {
        variables: {},
      },
    };
    const newCollection = await upsertApiRecord(user?.details?.profile?.uid, collectionToBeCreated, team?.id);
    if (newCollection.success) {
      onSaveRecord(newCollection.data);
      return newCollection.data.id;
    } else {
      throw new Error("Failed to create a new collection");
    }
  }, [user?.details?.profile?.uid, team?.id, onSaveRecord, selectedCollection?.label]);

  const moveRecordToCollection = useCallback(
    async (collectionId: string, isNewCollection: boolean) => {
      const updatedRequest = { ...recordToMove, collectionId };
      const result = await upsertApiRecord(user?.details?.profile?.uid, updatedRequest, team?.id);
      if (result.success) {
        trackMoveRequestToCollectionSuccessful(isNewCollection ? "new_collection" : "existing_collection");
        toast.success("Request moved to collection successfully");
        onSaveRecord(result.data);
      } else {
        throw new Error("Failed to move request to collection");
      }
    },
    [user?.details?.profile?.uid, team?.id, onSaveRecord, recordToMove]
  );

  const handleRecordMove = useCallback(async () => {
    try {
      setIsLoading(true);
      const collectionId = selectedCollection?.__isNew__ ? await createNewCollection() : selectedCollection.value;

      if (collectionId) {
        await moveRecordToCollection(collectionId, selectedCollection?.__isNew__);
      }
    } catch (error) {
      console.error("Error moving request to collection:", error);
      toast.error(error.message);
      trackMoveRequestToCollectionFailed(selectedCollection?.__isNew__ ? "new_collection" : "existing_collection");
    } finally {
      setIsLoading(false);
      onClose();
    }
  }, [selectedCollection, onClose, createNewCollection, moveRecordToCollection]);

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
        filterOption={(option, inputValue) =>
          recordToMove.collectionId !== option.value && option.label.toLowerCase().includes(inputValue.toLowerCase())
        }
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
