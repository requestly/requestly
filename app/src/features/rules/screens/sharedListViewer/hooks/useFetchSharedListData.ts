import { useEffect, useState } from "react";
import { fetchSharedListData } from "../utils";
import Logger from "../../../../../../../common/logger";
import { recordsToContentTableDataAdapter } from "../../rulesList/components/RulesList/components/RulesTable/utils";

interface Props {
  sharedListId: string;
}

export const useFetchSharedListData = ({ sharedListId }: Props) => {
  const [isLoading, setIsLoading] = useState(true);

  const [sharedListRecords, setSharedListRecords] = useState([]);

  useEffect(() => {
    if (isLoading) {
      fetchSharedListData(sharedListId)
        .then((incomingData) => {
          if (incomingData) {
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
    sharedListRecords,
  };
};
