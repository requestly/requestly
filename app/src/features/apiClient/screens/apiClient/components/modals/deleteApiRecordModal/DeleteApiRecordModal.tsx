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

  // TODO: handle single api request deletion - update the modal message too
  let apiRequestCount = isApiCollection(record) ? record.data.children.length : 1;

  const handleDeleteApiRecord = async () => {
    setIsDeleting(true);

    const recordIds: string[] = [];

    recordIds.push(record.id);
    if (isApiCollection(record)) {
      record.data.children.forEach((request) => {
        recordIds.push(request.id);
      });
    }

    const result = await deleteApiRecords(uid, recordIds, teamId);
    onDeleteRecords(recordIds);

    if (result.success) {
      trackCollectionDeleted();
      toast.success("Collection deleted!");
      onClose();
      onSuccess?.();

      // TODO: add analytics
    }

    setIsDeleting(false);
  };

  return (
    <RQModal
      width={320}
      open={open}
      closable={false}
      maskClosable={false}
      destroyOnClose={true}
      className="delete-api-record-modal"
    >
      <img width={32} height={32} src={deleteIcon} alt="Delete collection" className="icon" />
      <div className="header">Delete collection</div>
      <div className="description">
        This action will permanently delete the entire <br /> collection and its {apiRequestCount} requests. Are you
        sure <br />
        you want to continue?
      </div>

      <div className="actions">
        <RQButton block onClick={onClose}>
          Cancel
        </RQButton>
        <RQButton block type="danger" loading={isDeleting} onClick={handleDeleteApiRecord}>
          Delete collection
        </RQButton>
      </div>
    </RQModal>
  );
};
