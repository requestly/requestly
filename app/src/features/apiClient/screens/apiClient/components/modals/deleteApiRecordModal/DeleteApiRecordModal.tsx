import React, { useState } from "react";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useSelector } from "react-redux";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { toast } from "utils/Toast";
import { RQModal } from "lib/design-system/components";
import deleteIcon from "../../../../../assets/delete.svg";
import { RQButton } from "lib/design-system-v2/components";
import { RQAPI } from "features/apiClient/types";
import { isApiCollection } from "../../../utils";
import { deleteApiRecords } from "backend/apiClient";
import { useApiClientContext } from "features/apiClient/contexts";
import { trackCollectionDeleted } from "modules/analytics/events/features/apiClient";
import "./deleteApiRecordModal.scss";
import { isEmpty } from "lodash";

interface DeleteApiRecordModalProps {
  open: boolean;
  records: RQAPI.Record[];
  onClose: () => void;
  onSuccess?: () => void;
}

export const DeleteApiRecordModal: React.FC<DeleteApiRecordModalProps> = ({ open, records, onClose, onSuccess }) => {
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const teamId = workspace?.id;
  const { onDeleteRecords } = useApiClientContext();

  const [isDeleting, setIsDeleting] = useState(false);
  if (isEmpty(records)) {
    return null;
  }

  let apiRequestCount = records.length === 1 ? (isApiCollection(records[0]) ? records[0].data.children.length : 1) : "";

  const getAllIdsToDelete = () => {
    const idsToBeDeleted: string[] = [];
    const stack: RQAPI.Record[] = [...records];

    while (stack.length) {
      const record = stack.pop()!;
      idsToBeDeleted.push(record.id);

      if (isApiCollection(record) && record.data.children) {
        stack.push(...record.data.children);
      }
    }

    return idsToBeDeleted;
  };

  const handleDeleteApiRecord = async () => {
    setIsDeleting(true);

    const recordIds = getAllIdsToDelete();
    console.log(recordIds, "ids");

    const result = await deleteApiRecords(uid, recordIds, teamId);
    onDeleteRecords(recordIds);

    if (result.success) {
      trackCollectionDeleted();
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
      <img width={32} height={32} src={deleteIcon} alt="Delete" className="icon" />
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
