import React, { useEffect, useState } from "react";
import { DownloadMocksModal } from "./DownloadMocksModal";
import { useMocksModalsContext } from "features/mocks/contexts/modals";

export const DownloadMocksModalWrapper: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMockIds, setSelectedMockIds] = useState([]);

  const { setOpenShareMocksModalAction } = useMocksModalsContext();

  useEffect(() => {
    const openModal = (selectedMockIds: string[]) => {
      setIsOpen(true);
      setSelectedMockIds(selectedMockIds);
    };

    setOpenShareMocksModalAction(() => openModal);
  }, [setOpenShareMocksModalAction]);

  const onClose = () => {
    setIsOpen(false);
    setSelectedMockIds([]);
  };

  return isOpen ? <DownloadMocksModal isOpen={isOpen} toggleModal={onClose} selectedMockIds={selectedMockIds} /> : null;
};
