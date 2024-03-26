import React, { useEffect, useState } from "react";
import { useRulesContext } from "../../../../../context";
import { ImportRulesModal } from ".";

interface Props {}

export const ImportRulesModalWrapper: React.FC<Props> = () => {
  const { setImportRecordsAction } = useRulesContext();

  const [isModalActive, setIsModalActive] = useState(false);

  useEffect(() => {
    const importRecords = () => {
      setIsModalActive(true);
    };

    setImportRecordsAction(() => importRecords);
  }, [setImportRecordsAction]);

  const onClose = () => {
    setIsModalActive(false);
  };

  return isModalActive ? <ImportRulesModal isOpen={isModalActive} toggle={onClose} /> : null;
};
