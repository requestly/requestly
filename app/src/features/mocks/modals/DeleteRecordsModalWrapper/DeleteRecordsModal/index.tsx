import React, { useState, useCallback } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { RQButton } from "lib/design-system/components";
import { RQModal } from "lib/design-system/components";
import { toast } from "utils/Toast";
import { MockType, RQMockMetadataSchema } from "components/features/mocksV2/types";
import deleteIcon from "../../assets/delete.svg";
import { isRecordMock } from "features/mocks/screens/mocksList/components/MocksList/components/MocksTable/utils";
import * as FilesService from "../../../../../utils/files/FilesService";
import { trackDeleteMockEvent } from "modules/analytics/events/features/mocksV2";
import { deleteMock } from "backend/mocks/deleteMock";
import Logger from "../../../../../../../common/logger";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import "./deleteRecordsModal.scss";

interface Props {
  visible: boolean;
  records: RQMockMetadataSchema[];
  toggleModalVisibility: (visible: boolean) => void;
  onSuccess?: () => void;
}

export const DeleteRecordsModal: React.FC<Props> = ({ visible, records, toggleModalVisibility, onSuccess }) => {
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const workspace = useSelector(getCurrentlyActiveWorkspace);

  const [isDeleting, setIsDeleting] = useState(false);

  const deleteMockAction = useCallback(
    async (mock: RQMockMetadataSchema, onSuccess?: () => void) => {
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
        return deleteMock(uid, mock.id, workspace?.id)
          .then(() => {
            trackDeleteMockEvent(mock.id, mock?.type, mock?.fileType);
            onSuccess?.();
          })
          .catch((err) => {
            Logger.log("Error while deleting mock", err);
          });
      }
    },
    [uid, workspace?.id]
  );

  const deleteRecordsAction = useCallback((records: RQMockMetadataSchema[], onSuccess?: () => void) => {
    const allPromises: Promise<void>[] = [];

    records.forEach((record) => {
      allPromises.push(deleteMockAction(record));
    });

    Promise.allSettled(allPromises).then(() => {
      onSuccess?.();
    });
  }, []);

  const handleOnConfirm = () => {
    setIsDeleting(true);

    const onDeleted = () => {
      onSuccess?.();
      setIsDeleting(false);
      toggleModalVisibility(false);
      toast.info(`${recordType} deleted!`);
    };

    deleteRecordsAction(records, onDeleted);
  };

  const handleCancel = () => {
    toggleModalVisibility(false);
  };

  const recordType =
    records.length === 1
      ? isRecordMock(records[0])
        ? records[0]?.type === MockType.API
          ? "Mock"
          : "File"
        : "Collection"
      : "Records";

  return (
    <RQModal open={visible} destroyOnClose={true} onCancel={handleCancel} className="delete-mock-modal">
      <img width={32} height={32} src={deleteIcon} alt="Delete collection" className="icon" />
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
