import React, { useState } from "react";
import { toast } from "utils/Toast";
import { RQModal } from "lib/design-system/components";
import { RQButton } from "lib/design-system-v2/components";
import { RQAPI } from "features/apiClient/types";
import { isApiCollection, isApiRequest } from "../../../utils";
import { useApiClientContext } from "features/apiClient/contexts";
import { trackCollectionDeleted } from "modules/analytics/events/features/apiClient";
import "./deleteApiRecordModal.scss";
import { isEmpty, partition } from "lodash";
import * as Sentry from "@sentry/react";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";

interface DeleteApiRecordModalProps {
  open: boolean;
  records: RQAPI.Record[];
  onClose: () => void;
  onSuccess?: () => void;
}

export const DeleteApiRecordModal: React.FC<DeleteApiRecordModalProps> = ({ open, records, onClose, onSuccess }) => {
  const { onDeleteRecords, apiClientRecordsRepository } = useApiClientContext();
  const closeTabBySource = useTabServiceWithSelector((state) => state.closeTabBySource);

  const [isDeleting, setIsDeleting] = useState(false);
  if (isEmpty(records)) {
    return null;
  }

  let apiRequestCount = records.length === 1 ? (isApiCollection(records[0]) ? records[0].data.children.length : 1) : "";

  const getAllRecordsToDelete = () => {
    const recordsToBeDeleted: RQAPI.Record[] = [];
    const stack: RQAPI.Record[] = [...records];

    while (stack.length) {
      const record = stack.pop()!;
      recordsToBeDeleted.push(record);
      if (isApiCollection(record) && record.data.children) {
        stack.push(...record.data.children);
      }
    }

    return recordsToBeDeleted;
  };

  const handleDeleteApiRecord = async () => {
    const recordsToBeDeleted = getAllRecordsToDelete();
    if (!recordsToBeDeleted.length) {
      toast.error("Please select atleast one entity you want to delete.");
      return;
    }

    setIsDeleting(true);
    const [apiRecords, collectionRecords] = partition(recordsToBeDeleted, isApiRequest);
    const apiRecordIds = apiRecords.map((record) => record.id);
    const collectionRecordIds = collectionRecords.map((record) => record.id);

    // First delete records
    const recordDeletionResult = await apiClientRecordsRepository.deleteRecords(apiRecordIds);

    // Then delete collections
    const collectionsDeletionResult = await apiClientRecordsRepository.deleteCollections(collectionRecordIds);

    // Check if both deletions were successful
    if (recordDeletionResult.success && collectionsDeletionResult.success) {
      onDeleteRecords([...apiRecordIds, ...collectionRecordIds]);
      trackCollectionDeleted();

      apiRecordIds.forEach((recordId) => {
        closeTabBySource(recordId, "request", true);
      });

      collectionRecordIds.forEach((recordId) => {
        closeTabBySource(recordId, "collection", true);
      });

      toast.success(
        records.length === 1
          ? records[0].type === RQAPI.RecordType.API
            ? "API request deleted"
            : "Collection deleted"
          : "Records Deleted"
      );
      onClose();
      onSuccess?.();

      // TODO: add analytics
    } else {
      const erroredResult = !recordDeletionResult.success ? recordDeletionResult : collectionsDeletionResult;
      toast.error(erroredResult.message || `Error deleting ${records.length === 1 ? "record" : "records"}`);
      Sentry.withScope((scope) => {
        scope.setTag("error_type", "api_client_record_deletion");
        Sentry.captureException(
          erroredResult.message || `Error deleting ${records.length === 1 ? "record" : "records"}`
        );
      });
    }

    setIsDeleting(false);
  };

  const header =
    records.length === 1
      ? records[0].type === RQAPI.RecordType.API
        ? "Delete API Request"
        : "Delete Collection"
      : "Delete Records";

  const description =
    records.length === 1
      ? records[0].type === RQAPI.RecordType.API
        ? `This action will permanently delete this API request. Are you sure you want to continue?`
        : `This action will permanently delete the entire collection and its ${apiRequestCount} requests. Are you sure you want to continue?`
      : "This action will permanently delete the selected Collections, APIs, and their associated requests. Are you sure you want to proceed?";

  return (
    <RQModal
      width={320}
      open={open}
      closable={false}
      maskClosable={false}
      destroyOnClose={true}
      className="delete-api-record-modal"
    >
      <img width={32} height={32} src={"/assets/media/common/delete.svg"} alt="Delete" className="icon" />
      <div className="header">{header}</div>
      <div className="description">{description}</div>

      <div className="actions">
        <RQButton block onClick={onClose}>
          Cancel
        </RQButton>
        <RQButton block type="danger" loading={isDeleting} onClick={handleDeleteApiRecord}>
          {records.length === 1
            ? records[0].type === RQAPI.RecordType.API
              ? "Delete API"
              : "Delete collection"
            : "Delete Records"}
        </RQButton>
      </div>
    </RQModal>
  );
};
