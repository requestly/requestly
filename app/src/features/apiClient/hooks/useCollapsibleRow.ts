import { useCallback, useEffect, useState } from "react";
import { isEmpty } from "lodash";
import { RQAPI } from "features/apiClient/types";
import { sessionStorage } from "utils/sessionStorage";
import { SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY } from "features/apiClient/constants";

interface UseCollapsibleRowParams {
  recordId: RQAPI.ApiClientRecord["id"];
  expandedRecordIds: string[];
  setExpandedRecordIds?: (keys: RQAPI.ApiClientRecord["id"][]) => void;
}

export const useCollapsibleRow = ({ recordId, expandedRecordIds, setExpandedRecordIds }: UseCollapsibleRowParams) => {
  const [activeKey, setActiveKey] = useState<string | undefined>(
    expandedRecordIds?.includes(recordId) ? recordId : undefined
  );

  useEffect(() => {
    setActiveKey(expandedRecordIds?.includes(recordId) ? recordId : undefined);
  }, [expandedRecordIds, recordId]);

  const updateExpandedRecordIds = useCallback(
    (newExpandedIds: RQAPI.ApiClientRecord["id"][]) => {
      setExpandedRecordIds?.(newExpandedIds);
      isEmpty(newExpandedIds)
        ? sessionStorage.removeItem(SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY)
        : sessionStorage.setItem(SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY, newExpandedIds);
    },
    [setExpandedRecordIds]
  );

  const collapseChangeHandler = useCallback(
    (keys: RQAPI.ApiClientRecord["id"][]) => {
      let activeKeysCopy = [...expandedRecordIds];
      if (isEmpty(keys)) {
        activeKeysCopy = activeKeysCopy.filter((key) => key !== recordId);
      } else if (!activeKeysCopy.includes(recordId)) {
        activeKeysCopy.push(recordId);
      }
      updateExpandedRecordIds(activeKeysCopy);
    },
    [recordId, expandedRecordIds, updateExpandedRecordIds]
  );

  return {
    activeKey,
    setActiveKey,
    updateExpandedRecordIds,
    collapseChangeHandler,
  };
};
