import React, { useEffect, useState } from "react";
import { ImportRulesModal } from ".";
import { useRulesModalsContext } from "features/rules/context/modals";

interface Props {}

export const ImportRulesModalWrapper: React.FC<Props> = () => {
  const { setOpenImportRecordsModalAction } = useRulesModalsContext();

  const [isModalActive, setIsModalActive] = useState(false);

  useEffect(() => {
    const openModal = () => {
      setIsModalActive(true);
    };

    setOpenImportRecordsModalAction(() => openModal);
  }, [setOpenImportRecordsModalAction]);

  const onClose = () => {
    setIsModalActive(false);
  };

  return isModalActive ? <ImportRulesModal isOpen={isModalActive} toggle={onClose} /> : null;
};
