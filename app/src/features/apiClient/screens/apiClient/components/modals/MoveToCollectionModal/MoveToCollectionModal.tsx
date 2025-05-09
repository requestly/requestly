import { Modal } from "antd";
import CreatableReactSelect from "react-select/creatable";
import { useApiClientContext } from "features/apiClient/contexts";
import { RQAPI } from "features/apiClient/types";
import React, { useCallback, useMemo, useState } from "react";
import { toast } from "utils/Toast";
import { RQButton } from "lib/design-system/components";
import { trackMoveRequestToCollectionFailed, trackRequestMoved } from "modules/analytics/events/features/apiClient";
import "./moveToCollectionModal.scss";
import { isApiCollection } from "../../../utils";
import { head, isEmpty, omit } from "lodash";
import { Authorization } from "../../clientView/components/request/components/AuthorizationView/types/AuthConfig";
import * as Sentry from "@sentry/react";

interface Props {
  recordsToMove: RQAPI.Record[];
  isOpen: boolean;
  onClose: () => void;
}

export const MoveToCollectionModal: React.FC<Props> = ({ isOpen, onClose, recordsToMove }) => {
  const {
    apiClientRecords,
    onSaveRecord,
    onSaveBulkRecords,
    apiClientRecordsRepository,
    forceRefreshApiClientRecords,
  } = useApiClientContext();
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const collectionOptions = useMemo(() => {
    const exclusions = new Set();

    for (const record of recordsToMove) {
      const stack = [record];
      record.collectionId && exclusions.add(record.collectionId);
      while (stack.length) {
        const current = stack.pop();
        exclusions.add(current.id);

        if (isApiCollection(current) && !isEmpty(current.data?.children)) {
          stack.push(...current.data.children);
        }
      }
    }

    return apiClientRecords
      .filter((record) => isApiCollection(record) && !exclusions.has(record.id))
      .map((record) => ({
        label: record.name,
        value: record.id,
      }));
  }, [apiClientRecords, recordsToMove]);

  const createNewCollection = useCallback(async () => {
    const collectionToBeCreated: Partial<RQAPI.CollectionRecord> = {
      collectionId: "",
      name: selectedCollection?.label,
      type: RQAPI.RecordType.COLLECTION,
      deleted: false,
      data: {
        variables: {},
        auth: {
          currentAuthType: Authorization.Type.NO_AUTH,
          authConfigStore: {},
        },
      },
    };
    const newCollection = await apiClientRecordsRepository.createCollection(collectionToBeCreated);
    if (newCollection.success) {
      onSaveRecord(newCollection.data, "open");
      return newCollection.data.id;
    } else {
      throw new Error("Failed to create a new collection");
    }
  }, [onSaveRecord, selectedCollection?.label, apiClientRecordsRepository]);

  const moveRecordsToCollection = useCallback(
    async (collectionId: string, isNewCollection: boolean) => {
      const updatedRequests = recordsToMove.map((record) =>
        isApiCollection(record)
          ? { ...record, collectionId, data: omit(record.data, "children") }
          : { ...record, collectionId }
      );

      // TODO: use apiClient interface
      try {
        const result = await apiClientRecordsRepository.moveAPIEntities(updatedRequests, collectionId);

        trackRequestMoved(isNewCollection ? "new_collection" : "existing_collection");
        toast.success("Requests moved to collection successfully");
        result.length === 1 ? onSaveRecord(head(result), "open") : onSaveBulkRecords(result);
        forceRefreshApiClientRecords();
      } catch (error) {
        console.error("Error moving records: ", error);
        throw new Error("Failed to move some requests to collection");
      }
    },
    [onSaveRecord, recordsToMove, onSaveBulkRecords, apiClientRecordsRepository, forceRefreshApiClientRecords]
  );

  const handleRecordMove = useCallback(async () => {
    try {
      setIsLoading(true);
      const collectionId = selectedCollection?.__isNew__ ? await createNewCollection() : selectedCollection.value;

      if (collectionId) {
        await moveRecordsToCollection(collectionId, selectedCollection?.__isNew__);
      }
    } catch (error) {
      console.error("Error moving request to collection:", error);
      toast.error(error.message || "Error moving records to collection");
      Sentry.withScope((scope) => {
        scope.setTag("error_type", "api_client_move_to_collection");
        Sentry.captureException(error);
      });
      trackMoveRequestToCollectionFailed(selectedCollection?.__isNew__ ? "new_collection" : "existing_collection");
    } finally {
      setIsLoading(false);
      onClose();
    }
  }, [selectedCollection, onClose, createNewCollection, moveRecordsToCollection]);

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
        filterOption={(option, inputValue) => option.label.toLowerCase().includes(inputValue.toLowerCase())}
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
