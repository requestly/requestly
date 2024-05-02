import { useEffect, useState } from "react";
import { fetchSharedListData } from "../utils";
import Logger from "../../../../../../../common/logger";
import { recordsToContentTableDataAdapter } from "../../rulesList/components/RulesList/components/RulesTable/utils";
import { Group, Rule } from "types";

interface Props {
  sharedListId: string;
}

export const useFetchSharedListData = ({ sharedListId }: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [sharedListGroupsMap, setSharedListGroupsMap] = useState<Record<string, Group>>({});
  const [sharedListGroupwiseRulesMap, setSharedListGroupwiseRulesMap] = useState<Record<string, Rule[]>>({});
  const [sharedListRecords, setSharedListRecords] = useState([]);

  useEffect(() => {
    if (isLoading) {
      fetchSharedListData(sharedListId)
        .then((incomingData) => {
          if (incomingData) {
            const groupwiseRulesMap = incomingData.rules.reduce(
              (map: Record<string, Rule[]>, rule: Rule) => {
                const { groupId } = rule;
                const groupKey = groupId || "ungrouped";
                if (!map[groupKey]) {
                  map[groupKey] = [];
                }
                map[groupKey].push(rule);
                return map;
              },
              {
                ungrouped: [],
              }
            );
            setSharedListGroupwiseRulesMap(groupwiseRulesMap);
            const groupsMap = incomingData.groups.reduce((map: Record<string, Group>, group: Group) => {
              map[group.id] = group;
              return map;
            }, {});
            setSharedListGroupsMap(groupsMap);
            const records = recordsToContentTableDataAdapter([...incomingData.rules, ...incomingData.groups]);
            setSharedListRecords(records);
          }
        })
        .catch((e) => {
          Logger.log("Error in fetching shared list data", e);
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
    sharedListRecords,
  };
};
