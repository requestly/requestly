import React from "react";
import { useState } from "react";
import { RQButton } from "lib/design-system/components";
import { RQModal } from "lib/design-system/components";
import { toast } from "utils/Toast";
import { RQMockMetadataSchema } from "components/features/mocksV2/types";
import deleteIcon from "../../assets/delete.svg";
import { useMocksActionContext } from "features/mocks/contexts/actions";
import { isRecordMock } from "features/mocks/screens/mocksList/components/MocksList/components/MocksTable/utils";
import "./deleteRecordsModal.scss";

interface Props {
  visible: boolean;
  records: RQMockMetadataSchema[];
  toggleModalVisibility: (visible: boolean) => void;
  onSuccess?: () => void;
}

export const DeleteRecordsModal: React.FC<Props> = ({ visible, records, toggleModalVisibility, onSuccess }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteRecordsAction } = useMocksActionContext();
  const recordType = records.length === 1 ? (isRecordMock(records[0]) ? "mock" : "collection") : "records";

  const handleOnConfirm = () => {
    setIsDeleting(true);

    const onDeleted = () => {
      onSuccess?.();
      setIsDeleting(false);
      toggleModalVisibility(false);
      toast.info(`${recordType.toUpperCase()} deleted!`);
    };

    deleteRecordsAction(records, onDeleted);
  };

  const handleCancel = () => {
    toggleModalVisibility(false);
  };

  return (
    <RQModal open={visible} destroyOnClose={true} onCancel={handleCancel} className="delete-mock-modal">
      <img width={32} height={32} src={deleteIcon} alt="Delete collection" className="icon" />
      <div className="header">Delete this {recordType}?</div>
      <div className="description">
        This action will permanently delete this {recordType}. <br /> Are you sure you want to delete?
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
