import React, { useEffect, useState } from "react";
import { useMocksModalsContext } from "features/mocks/contexts/modals";
import { NewFileModal } from "./NewFileModal";

export const NewFileModalWrapper: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [collectionId, setCollectionId] = useState("");

  const { setOpenNewFileModalAction } = useMocksModalsContext();

  useEffect(() => {
    const openModal = (collectionId: string = "") => {
      setCollectionId(collectionId);
      setIsVisible(true);
    };

    setOpenNewFileModalAction(() => openModal);
  }, [setOpenNewFileModalAction]);

  const onClose = () => {
    setIsVisible(false);
  };

  return isVisible ? (
    <NewFileModal collectionId={collectionId} visible={isVisible} toggleModalVisiblity={onClose} />
  ) : null;
};
