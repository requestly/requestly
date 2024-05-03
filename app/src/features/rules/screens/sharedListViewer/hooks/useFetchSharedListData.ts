import { useEffect, useMemo, useState } from "react";
import { fetchSharedListData } from "../../sharedLists/utils";
import Logger from "../../../../../../../common/logger";
import { Group, Rule } from "types";

interface Props {
  sharedListId: string;
}

export const useFetchSharedListData = ({ sharedListId }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sharedListGroups, setSharedListGroups] = useState<Group[]>([]);
  const [sharedListRules, setSharedListRules] = useState<Rule[]>([]);
  const [isSharedListPresent, setIsSharedListPresent] = useState(true);

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
  };
};
