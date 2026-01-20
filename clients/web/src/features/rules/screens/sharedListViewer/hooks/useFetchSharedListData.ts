import { useEffect, useMemo, useState } from "react";
import { fetchSharedListData } from "../../sharedLists/utils";
import { LOGGER as Logger } from "@requestly/utils";
import { Group, Rule } from "@requestly/shared/types/entities/rules";

interface Props {
  sharedListId: string;
}
// nsr: generally curious, why do we need a hook for this fetching? why not just a function?
export const useFetchSharedListData = ({ sharedListId }: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [sharedListGroups, setSharedListGroups] = useState<Group[]>([]);
  const [sharedListRules, setSharedListRules] = useState<Rule[]>([]);
  const [isSharedListPresent, setIsSharedListPresent] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);

  const sharedListRecordsMap = useMemo(() => {
    const records = [...sharedListGroups, ...sharedListRules];
    return records.reduce((acc: Record<string, Group | Rule>, record: Group | Rule) => {
      acc[record.id] = record;
      return acc;
    }, {});
  }, [sharedListGroups, sharedListRules]);

  useEffect(() => {
    setIsLoading(true);
    fetchSharedListData(sharedListId)
      .then((data) => {
        if (data) {
          setSharedListGroups(data.groups || []);
          setSharedListRules(data.rules || []);

          if (data?.deleted) {
            setIsDeleted(true);
          }
        }
      })
      .catch((e) => {
        Logger.log("Error in fetching shared list data", e);
        setIsSharedListPresent(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [sharedListId]);

  return {
    isLoading,
    sharedListGroups,
    sharedListRules,
    sharedListRecordsMap,
    isSharedListPresent,
    isDeleted,
  };
};
