import { Modal, notification } from "antd";
import CreatableReactSelect from "react-select/creatable";
import { RQAPI } from "features/apiClient/types";
import React, { useCallback, useMemo, useState } from "react";
import { toast } from "utils/Toast";
import { RQButton } from "lib/design-system/components";
import { trackMoveRequestToCollectionFailed, trackRequestMoved } from "modules/analytics/events/features/apiClient";
import "./moveToCollectionModal.scss";
import { Authorization } from "../../views/components/request/components/AuthorizationView/types/AuthConfig";
import * as Sentry from "@sentry/react";
import { useNewApiClientContext } from "features/apiClient/hooks/useNewApiClientContext";
import { useApiClientRepository } from "features/apiClient/helpers/modules/sync/useApiClientSyncRepo";
import { useContextId } from "features/apiClient/contexts/contextId.context";
import { getCollectionOptionsToMoveIn } from "features/apiClient/commands/utils";
import { moveRecords } from "features/apiClient/commands/records";
import { getApiClientFeatureContext } from "features/apiClient/commands/store.utils";

interface Props {
  recordsToMove: RQAPI.ApiClientRecord[];
  isOpen: boolean;
  onClose: () => void;
}

export const MoveToCollectionModal: React.FC<Props> = ({ isOpen, onClose, recordsToMove }) => {
  const { onSaveRecord } = useNewApiClientContext();
  const { apiClientRecordsRepository } = useApiClientRepository();
  const contextId = useContextId();

  const [selectedCollection, setSelectedCollection] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const collectionOptions = useMemo(() => {
    return getCollectionOptionsToMoveIn(contextId, recordsToMove);
  }, [contextId, recordsToMove]);

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

  // TODO: refactor into a command
  const moveRecordsToCollection = useCallback(
    async (recordsToMove: RQAPI.ApiClientRecord[], collectionId: string, isNewCollection: boolean) => {
      try {
        const context = getApiClientFeatureContext(contextId);
        await moveRecords(context, { collectionId, recordsToMove });

        trackRequestMoved(isNewCollection ? "new_collection" : "existing_collection");
        toast.success("Requests moved to collection successfully");
      } catch (error) {
        throw new Error("Failed to move some requests to collection");
      }
    },
    [contextId]
  );

  const handleRecordMove = useCallback(async () => {
    try {
      setIsLoading(true);
      const collectionId = selectedCollection?.__isNew__ ? await createNewCollection() : selectedCollection.value;

      if (collectionId) {
        await moveRecordsToCollection(recordsToMove, collectionId, selectedCollection?.__isNew__);
      }
    } catch (error) {
      notification.error({
        message: `Error moving records to collection`,
        description: error?.message,
        placement: "bottomRight",
      });

      Sentry.withScope((scope) => {
        scope.setTag("error_type", "api_client_move_to_collection");
        Sentry.captureException(error);
      });

      trackMoveRequestToCollectionFailed(selectedCollection?.__isNew__ ? "new_collection" : "existing_collection");
    } finally {
      setIsLoading(false);
      onClose();
    }
  }, [selectedCollection, recordsToMove, onClose, createNewCollection, moveRecordsToCollection]);

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
