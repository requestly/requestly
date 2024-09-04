import React, { useEffect, useState } from "react";
import { useMocksModalsContext } from "features/mocks/contexts/modals";
import { ExportMocksModal } from "./ExportMocksModal";

export const ExportMocksModalWrapper: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMockIds, setSelectedMockIds] = useState([]);
  const [onSuccess, setOnSuccess] = useState(() => () => {});

  const { setOpenShareMocksModalAction } = useMocksModalsContext();

  useEffect(() => {
    const openModal = (selectedMockIds: string[], onSuccess?: () => void) => {
      setIsOpen(true);
      setSelectedMockIds(selectedMockIds);
      setOnSuccess(() => onSuccess);
    };

    setOpenShareMocksModalAction(() => openModal);
  }, [setOpenShareMocksModalAction]);

  const onClose = () => {
    setIsOpen(false);
  };

  return isOpen ? (
    <ExportMocksModal isOpen={isOpen} closeModal={onClose} selectedMockIds={selectedMockIds} onSuccess={onSuccess} />
  ) : null;
};
