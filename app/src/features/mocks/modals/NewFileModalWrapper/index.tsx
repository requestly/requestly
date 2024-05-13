import React, { useEffect, useState } from "react";
import { useMocksModalsContext } from "features/mocks/contexts/modals";
import { NewFileModal } from "./NewFileModal";

export const NewFileModalWrapper: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const { setOpenNewFileModalAction } = useMocksModalsContext();

  useEffect(() => {
    const openModal = () => {
      setIsVisible(true);
    };

    setOpenNewFileModalAction(() => openModal);
  }, [setOpenNewFileModalAction]);

  const onClose = () => {
    setIsVisible(false);
  };

  return isVisible ? <NewFileModal visible={isVisible} toggleModalVisiblity={onClose} /> : null;
};
