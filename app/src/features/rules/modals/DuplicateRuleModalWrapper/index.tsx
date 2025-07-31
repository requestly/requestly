import React, { useEffect, useState } from "react";
import DuplicateRecordModal from "components/features/rules/DuplicateRuleModal";
import { useRulesModalsContext } from "features/rules/context/modals";
import { StorageRecord } from "@requestly/shared/types/entities/rules";

export const DuplicateRecordModalWrapper: React.FC = () => {
  const { setOpenDuplicateRecordModalAction } = useRulesModalsContext();

  const [isModalActive, setIdModalActive] = useState(false);
  const [recordToDuplicate, setRecordToDuplicate] = useState<StorageRecord | null>(null);

  useEffect(() => {
    const openModal = (record: StorageRecord) => {
      setRecordToDuplicate(record);
      setIdModalActive(true);
    };

    setOpenDuplicateRecordModalAction(() => openModal);
  }, [setOpenDuplicateRecordModalAction]);

  const onClose = () => {
    setRecordToDuplicate(null);
    setIdModalActive(false);
  };

  return isModalActive ? (
    <DuplicateRecordModal
      close={onClose}
      onDuplicate={onClose}
      isOpen={isModalActive}
      record={recordToDuplicate}
      analyticEventSource="rules_list"
    />
  ) : null;
};
