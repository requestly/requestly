import React, { useMemo, useState } from "react";
import { RQModal } from "lib/design-system/components";
import { RQButton } from "lib/design-system-v2/components";
import { RQAPI } from "features/apiClient/types";
import { trackCollectionDeleted } from "modules/analytics/events/features/apiClient";
import "./deleteApiRecordModal.scss";
import { isEmpty } from "lodash";
import { deleteRecords } from "features/apiClient/slices/apiRecords/thunks";
import { toast } from "utils/Toast";
import { isApiCollection } from "../../../utils";
import { ApiClientFeatureContext, selectChildrenIds, useApiClientFeatureContext } from "features/apiClient/slices";
import { NativeError } from "errors/NativeError";
import { ErrorSeverity } from "errors/types";

interface DeleteApiRecordModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  getRecordsToDelete: () => {
    context: ApiClientFeatureContext | undefined;
    records: RQAPI.ApiClientRecord[];
  }[];
}

export const DeleteApiRecordModal: React.FC<DeleteApiRecordModalProps> = ({
  open,
  getRecordsToDelete,
  onClose,
  onSuccess,
}) => {
  const context = useApiClientFeatureContext();
  const recordsWithContext = useMemo(() => {
    return getRecordsToDelete();
  }, [getRecordsToDelete]);

  const records = useMemo(() => {
    return recordsWithContext.map(({ records }) => records).flat();
  }, [recordsWithContext]);

  const examplesCountInRequest = useMemo(() => {
    if (records.length !== 1 || records[0]?.type !== RQAPI.RecordType.API) return 0;
    const state = context.store.getState();
    return selectChildrenIds(state, records[0].id).length ?? 0;
  }, [records, context]);

  const [isDeleting, setIsDeleting] = useState(false);

  if (isEmpty(records)) {
    return null;
  }

  let apiRequestCount =
    records.length === 1 ? (isApiCollection(records[0]!) ? records[0]?.data?.children?.length : 1) : "";

  const handleDeleteApiRecord = async () => {
    try {
      recordsWithContext.forEach(async ({ context, records }) => {
        if (!context) return;

        const { dispatch } = context.store;
        const { apiClientRecordsRepository } = context.repositories;
        const result = await dispatch(
          deleteRecords({
            records,
            repository: apiClientRecordsRepository,
          }) as any
        ).unwrap();

        const { deletedCollectionRecords } = result;

        const isExampleCollection = deletedCollectionRecords.some((record) => !!record.isExample);
        trackCollectionDeleted(isExampleCollection ? "example" : "");
      });

      toast.success(
        records.length === 1
          ? records[0]?.type === RQAPI.RecordType.API
            ? "API request deleted"
            : records[0]?.type === RQAPI.RecordType.EXAMPLE_API
            ? "Example deleted"
            : "Collection deleted"
          : "Records Deleted"
      );
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error("Error while deleting!");

      throw NativeError.fromError(error).setShowBoundary(true).setSeverity(ErrorSeverity.ERROR);
    } finally {
      setIsDeleting(false);
    }
  };

  const header =
    records.length === 1
      ? records[0]?.type === RQAPI.RecordType.API
        ? "Delete API Request"
        : records[0]?.type === RQAPI.RecordType.EXAMPLE_API
        ? "Delete Example"
        : "Delete Collection"
      : "Delete Records";

  const description =
    records.length === 1
      ? records[0]?.type === RQAPI.RecordType.API
        ? `This action will permanently delete this API request ${
            examplesCountInRequest > 0 ? `and ${examplesCountInRequest} examples` : ""
          }. Are you sure you want to continue?`
        : records[0]?.type === RQAPI.RecordType.EXAMPLE_API
        ? "This action will permanently delete this example. Are you sure you want to continue?"
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
            ? records[0]?.type === RQAPI.RecordType.API
              ? "Delete API"
              : records[0]?.type === RQAPI.RecordType.EXAMPLE_API
              ? "Delete Example"
              : "Delete Collection"
            : "Delete Records"}
        </RQButton>
      </div>
    </RQModal>
  );
};
