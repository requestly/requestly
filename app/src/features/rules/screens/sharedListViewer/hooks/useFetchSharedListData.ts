import { useEffect, useState } from "react";
import { fetchSharedListData, generateGroupwiseRulesMap } from "../utils";
import Logger from "../../../../../../../common/logger";
import { Group, Rule } from "types";

interface Props {
  sharedListId: string;
}

export const useFetchSharedListData = ({ sharedListId }: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [sharedListGroupsMap, setSharedListGroupsMap] = useState<Record<string, Group>>({});
  const [sharedListGroupwiseRulesMap, setSharedListGroupwiseRulesMap] = useState<Record<string, Rule[]>>({});
  const [sharedListGroups, setSharedListGroups] = useState<Group[]>([]);
  const [sharedListRules, setSharedListRules] = useState<Rule[]>([]);
  const [isSharedListPresent, setIsSharedListPresent] = useState(true);

  useEffect(() => {
    if (isLoading) {
      fetchSharedListData(sharedListId)
        .then((incomingData) => {
          if (incomingData) {
            setSharedListGroups(incomingData.groups || []);
            setSharedListRules(incomingData.rules || []);
            const groupwiseRulesMap = generateGroupwiseRulesMap(incomingData.rules);
            setSharedListGroupwiseRulesMap(groupwiseRulesMap);
            const groupsMap = incomingData.groups.reduce((map: Record<string, Group>, group: Group) => {
              map[group.id] = group;
              return map;
            }, {});
            setSharedListGroupsMap(groupsMap);
          }
        })
        .catch((e) => {
          Logger.log("Error in fetching shared list data", e);
          setIsSharedListPresent(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isLoading, sharedListId]);

  return {
    isLoading,
    sharedListGroupsMap,
    sharedListGroupwiseRulesMap,
    sharedListGroups,
    sharedListRules,
    isSharedListPresent,
  };
};
