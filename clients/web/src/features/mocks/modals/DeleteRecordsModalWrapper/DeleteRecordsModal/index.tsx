import React, { useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { RQButton } from "lib/design-system/components";
import { RQModal } from "lib/design-system/components";
import { toast } from "utils/Toast";
import { MockType, RQMockMetadataSchema } from "components/features/mocksV2/types";
import { isMock } from "features/mocks/screens/mocksList/components/MocksList/components/MocksTable/utils";
import * as FilesService from "../../../../../utils/files/FilesService";
import { trackDeleteMockEvent } from "modules/analytics/events/features/mocksV2";
import { deleteMock } from "backend/mocks/deleteMock";
import { LOGGER as Logger } from "@requestly/utils";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import "./deleteRecordsModal.scss";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";

interface Props {
  visible: boolean;
  records: RQMockMetadataSchema[];
  toggleModalVisibility: (visible: boolean) => void;
  onSuccess?: () => void;
}

export const DeleteRecordsModal: React.FC<Props> = ({ visible, records, toggleModalVisibility, onSuccess }) => {
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);

  const [isDeleting, setIsDeleting] = useState(false);

  const recordType =
    records.length === 1
      ? isMock(records[0])
        ? records[0]?.type === MockType.API
          ? "JSON file"
          : "JS/CSS file"
        : "Collection"
      : "Records";

  const deleteRecordAction = async (mock: RQMockMetadataSchema, onSuccess?: () => void) => {
    if (mock.isOldMock) {
      const functions = getFunctions();
      const deleteOldMock = httpsCallable(functions, "deleteMock");

      return deleteOldMock(mock.id).then((res: any) => {
        if (res?.data?.success) {
          if (mock.oldMockFilePath) {
            FilesService.deleteFileFromStorage(mock.oldMockFilePath);
          }
          trackDeleteMockEvent(mock.id, mock?.type, mock?.fileType);
          onSuccess?.();
        }
      });
    } else {
      return deleteMock(uid, mock.id, activeWorkspaceId)
        .then(() => {
          trackDeleteMockEvent(mock.id, mock?.type, mock?.fileType);
          onSuccess?.();
        })
        .catch((err) => {
          Logger.log("Error while deleting File", err);
        });
    }
  };

  const deleteRecordsAction = (records: RQMockMetadataSchema[]) => {
    const allPromises: Promise<void>[] = [];

    records.forEach((record) => {
      allPromises.push(deleteRecordAction(record));
    });

    return Promise.allSettled(allPromises);
  };

  const handleOnConfirm = () => {
    setIsDeleting(true);

    deleteRecordsAction(records).then(() => {
      onSuccess?.();
      setIsDeleting(false);
      toggleModalVisibility(false);
      toast.info(`${recordType} deleted!`);
    });
  };

  const handleCancel = () => {
    toggleModalVisibility(false);
  };

  return (
    <RQModal open={visible} destroyOnClose={true} onCancel={handleCancel} className="delete-mock-modal">
      <img width={32} height={32} src={"/assets/media/common/delete.svg"} alt="Delete collection" className="icon" />
      <div className="header">Delete {recordType.toLowerCase()}?</div>
      <div className="description">
        This action will permanently delete this {recordType.toLowerCase()}. <br /> Are you sure you want to delete?
      </div>
      <div className="actions">
        <RQButton block type="default" onClick={handleCancel}>
          Cancel
        </RQButton>
        <RQButton block danger type="primary" loading={isDeleting} disabled={isDeleting} onClick={handleOnConfirm}>
          Delete
        </RQButton>
      </div>
    </RQModal>
  );
};
