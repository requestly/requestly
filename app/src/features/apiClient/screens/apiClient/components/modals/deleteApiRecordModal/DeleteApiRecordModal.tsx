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
import * as Sentry from "@sentry/react";
import { useTabActions } from "componentsV2/Tabs/slice";
import { ApiClientFeatureContext } from "features/apiClient/slices";

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
  const { closeTabByEntityId } = useTabActions();

  const recordsWithContext = useMemo(() => {
    return getRecordsToDelete();
  }, [getRecordsToDelete]);

  const records = useMemo(() => {
    return recordsWithContext.map(({ records }) => records).flat();
  }, [recordsWithContext]);

  const [isDeleting, setIsDeleting] = useState(false);

  if (isEmpty(records)) {
    return null;
  }

  let apiRequestCount =
    records.length === 1 ? (isApiCollection(records[0]) ? records[0]?.data?.children?.length : 1) : "";

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

        const { deletedApiRecords, deletedCollectionRecords } = result;

        const isExampleCollection = deletedCollectionRecords.some((record) => !!record.isExample);
        trackCollectionDeleted(isExampleCollection ? "example" : "");

        deletedApiRecords.forEach((r) => {
          closeTabByEntityId({ entityId: r.id });
        });

        deletedCollectionRecords.forEach((r) => {
          closeTabByEntityId({ entityId: r.id });
        });
      });

      // First delete records

      toast.success(
        records.length === 1
          ? records[0].type === RQAPI.RecordType.API
            ? "API request deleted"
            : "Collection deleted"
          : "Records Deleted"
      );
      onClose();
      onSuccess?.();
    } catch (error) {
      // const erroredResult = !recordDeletionResult.success ? recordDeletionResult : collectionsDeletionResult;
      // notification.error({
      //   message: `Error deleting ${records.length === 1 ? "record" : "records"}`,
      //   description: erroredResult?.message,
      //   placement: "bottomRight",
      // });

      Sentry.withScope((scope) => {
        scope.setTag("error_type", "api_client_record_deletion");
        Sentry.captureException(`Error deleting ${records.length === 1 ? "record" : "records"}`);
      });
    } finally {
      setIsDeleting(false);
    }
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
