import React, { useEffect, useState } from "react";
import { DeleteRecordsModal } from "./DeleteRecordsModal";
import { RQMockMetadataSchema } from "components/features/mocksV2/types";
import { useMocksModalsContext } from "features/mocks/contexts/modals";

export const DeleteRecordsModalWrapper: React.FC<{ forceRender: () => void }> = ({ forceRender }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [records, setRecords] = useState<RQMockMetadataSchema[]>([]);
  const [onSuccess, setOnSuccess] = useState(() => () => {});

  const { setOpenDeleteRecordsModalAction } = useMocksModalsContext();

  useEffect(() => {
    const openModal = (records: RQMockMetadataSchema[], onSuccess = () => {}) => {
      setIsVisible(true);
      setRecords(records);
      setOnSuccess(() => onSuccess);
    };

    setOpenDeleteRecordsModalAction(() => openModal);
  }, [setOpenDeleteRecordsModalAction]);

  const onClose = () => {
    setIsVisible(false);
    setRecords([]);
  };

  return (
    <DeleteRecordsModal
      records={records}
      visible={isVisible}
      toggleModalVisibility={onClose}
      onSuccess={() => {
        forceRender();
        onSuccess?.();
      }}
    />
  );
};
