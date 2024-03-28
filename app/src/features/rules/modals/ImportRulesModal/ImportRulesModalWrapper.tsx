import React, { useEffect, useState } from "react";
import { ImportRulesModal } from ".";
import { useRulesModalsContext } from "features/rules/context/modals";

interface Props {}

export const ImportRulesModalWrapper: React.FC<Props> = () => {
  const { setOpenImportRecordsModal } = useRulesModalsContext();

  const [isModalActive, setIsModalActive] = useState(false);

  useEffect(() => {
    const openModal = () => {
      setIsModalActive(true);
    };

    setOpenImportRecordsModal(() => openModal);
  }, [setOpenImportRecordsModal]);

  const onClose = () => {
    setIsModalActive(false);
  };

  return isModalActive ? <ImportRulesModal isOpen={isModalActive} toggle={onClose} /> : null;
};
