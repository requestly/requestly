import React, { useState } from "react";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useSelector } from "react-redux";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { toast } from "utils/Toast";
import { RQModal } from "lib/design-system/components";
import { RQButton } from "lib/design-system-v2/components";
import { RQAPI } from "features/apiClient/types";
import { isApiCollection } from "../../../utils";
import { deleteApiRecords } from "backend/apiClient";
import { useApiClientContext } from "features/apiClient/contexts";
import { trackCollectionDeleted } from "modules/analytics/events/features/apiClient";
import "./deleteApiRecordModal.scss";

interface DeleteApiRecordModalProps {
  open: boolean;
  record: RQAPI.Record;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DeleteApiRecordModal: React.FC<DeleteApiRecordModalProps> = ({ open, record, onClose, onSuccess }) => {
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const teamId = workspace?.id;
  const { onDeleteRecords } = useApiClientContext();

  const [isDeleting, setIsDeleting] = useState(false);

  if (!record) {
    return null;
  }

  let apiRequestCount = isApiCollection(record) ? record.data.children.length : 1;

  const collectAllRecordIds = (record: RQAPI.Record): string[] => {
    const recordIds: string[] = [record.id];

    if (isApiCollection(record) && record.data.children) {
      record.data.children.forEach((child) => {
        recordIds.push(...collectAllRecordIds(child));
      });
    }
    return recordIds;
  };

  const handleDeleteApiRecord = async () => {
    setIsDeleting(true);

    const recordIds = collectAllRecordIds(record);
    const result = await deleteApiRecords(uid, recordIds, teamId);
    onDeleteRecords(recordIds);

    if (result.success) {
      trackCollectionDeleted();
      toast.success(record.type === RQAPI.RecordType.API ? "API request deleted" : "Collection deleted");
      onClose();
      onSuccess?.();

      // TODO: add analytics
    }

    setIsDeleting(false);
  };

  const header = record.type === RQAPI.RecordType.API ? "Delete API Request" : "Delete Collection";
  const description =
    record.type === RQAPI.RecordType.API
      ? `This action will permanently delete this API request. Are you sure you want to continue?`
      : `This action will permanently delete the entire collection and its ${apiRequestCount} requests. Are you sure you want to continue?`;

  return (
    <RQModal
      width={320}
      open={open}
      closable={false}
      maskClosable={false}
      destroyOnClose={true}
      className="delete-api-record-modal"
    >
      <img width={32} height={32} src={"/media/common/delete.svg"} alt="Delete" className="icon" />
      <div className="header">{header}</div>
      <div className="description">{description}</div>

      <div className="actions">
        <RQButton block onClick={onClose}>
          Cancel
        </RQButton>
        <RQButton block type="danger" loading={isDeleting} onClick={handleDeleteApiRecord}>
          {record.type === RQAPI.RecordType.API ? "Delete API" : "Delete collection"}
        </RQButton>
      </div>
    </RQModal>
  );
};
