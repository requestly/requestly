import React, { useEffect, useMemo, useState } from "react";
import DeleteRulesModal from "components/features/rules/DeleteRulesModal";
import { useRulesModalsContext } from "features/rules/context/modals";
import { StorageRecord } from "@requestly/shared/types/entities/rules";

interface Props {}

export const DeleteRecordsModalWrapper: React.FC<Props> = () => {
  const { setOpenDeleteRecordsModalAction } = useRulesModalsContext();

  const [isModalActive, setIsModalActive] = useState(false);
  const [records, setRecords] = useState<StorageRecord[] | null>([]);
  const [onSuccess, setOnSuccess] = useState<() => void>(() => {});

  useEffect(() => {
    const openModal = (records: StorageRecord[], onSuccess: Function) => {
      setRecords(records);
      setIsModalActive(true);
      setOnSuccess(() => onSuccess);
    };

    setOpenDeleteRecordsModalAction(() => openModal);
  }, [setOpenDeleteRecordsModalAction]);

  const onClose = () => {
    setRecords(null);
    setIsModalActive(false);
  };

  // FIXME: use isRule and isGroup
  const rulesToDelete = useMemo(() => records?.filter((row) => !row.id?.startsWith("Group")), [records]);
  const selectedGroupIds = useMemo(() => records?.map((row) => row.id)?.filter((id) => id?.startsWith("Group")), [
    records,
  ]);

  return isModalActive ? (
    <DeleteRulesModal
      toggle={onClose}
      rulesToDelete={rulesToDelete}
      groupIdsToDelete={selectedGroupIds}
      clearSearch={() => {}} // FIXME
      isOpen={isModalActive}
      analyticEventSource="rules_list"
      ruleDeletedCallback={onSuccess}
    />
  ) : null;
};
