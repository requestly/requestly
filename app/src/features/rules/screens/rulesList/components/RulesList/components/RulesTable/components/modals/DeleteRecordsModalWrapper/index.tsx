import React, { useEffect, useMemo, useState } from "react";
import { useRulesContext } from "../../../../../context";
import DeleteRulesModal from "components/features/rules/DeleteRulesModal";
import { StorageRecord } from "features/rules/types/rules";

interface Props {}

export const DeleteRecordsModalWrapper: React.FC<Props> = () => {
  const { setDeleteRecordsAction } = useRulesContext();

  const [isModalActive, setIsModalActive] = useState(false);
  const [records, setRecords] = useState<StorageRecord[]>([]);
  const [onSuccess, setOnSuccess] = useState<() => void>(() => {});

  useEffect(() => {
    const deleteRecords = (records: StorageRecord[], onSuccess: Function) => {
      setRecords(records);
      setIsModalActive(true);
      setOnSuccess(() => onSuccess);
    };

    setDeleteRecordsAction(() => deleteRecords);
  }, [setDeleteRecordsAction]);

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
