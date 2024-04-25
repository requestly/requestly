import React from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { RQButton } from "lib/design-system/components";
import { RQModal } from "lib/design-system/components";
import Logger from "lib/logger";
import { toast } from "utils/Toast";
import { getFunctions, httpsCallable } from "firebase/functions";
import * as FilesService from "../../../../utils/files/FilesService";
import { deleteMock } from "backend/mocks/deleteMock";
import { trackDeleteMockEvent } from "modules/analytics/events/features/mocksV2";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { RQMockMetadataSchema } from "components/features/mocksV2/types";
import deleteIcon from "../assets/delete.svg";
import "./deleteMockModal.scss";

interface Props {
  visible: boolean;
  mock: RQMockMetadataSchema;
  toggleModalVisibility: (visible: boolean) => void;
  onSuccess: () => void;
}

export const DeleteMockModal: React.FC<Props> = ({ visible, mock, toggleModalVisibility, onSuccess }) => {
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOnConfirm = () => {
    setIsDeleting(true);
    if (mock.isOldMock) {
      const functions = getFunctions();
      const deleteMock = httpsCallable(functions, "deleteMock");
      deleteMock(mock.id).then((res: any) => {
        if (res?.data?.success) {
          setIsDeleting(false);
          toggleModalVisibility(false);
          toast.info("Mock deleted");
          // delete the object from storage
          if (mock.oldMockFilePath) {
            FilesService.deleteFileFromStorage(mock.oldMockFilePath);
          }
          onSuccess();
        } else {
          toast.error("Mock cannot be deleted. Try again.");
        }
      });
    } else {
      deleteMock(uid, mock.id, workspace?.id)
        .then(() => {
          trackDeleteMockEvent(mock.id, mock.type, mock.fileType);
          onSuccess();
          setIsDeleting(false);
          toggleModalVisibility(false);
          toast.success(`Mock Deleted. Id=${mock.id}`);
        })
        .catch((err) => {
          Logger.log("Error while deleting mock", err);
        });
    }
  };

  const handleCancel = () => {
    toggleModalVisibility(false);
  };

  return (
    <RQModal open={visible} destroyOnClose={true} onCancel={handleCancel} className="delete-mock-modal">
      <img width={32} height={32} src={deleteIcon} alt="Delete collection" className="icon" />
      <div className="header">Delete this mock?</div>
      <div className="description">
        This action will permanently delete this mock. <br /> Are you sure you want to delete?
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
