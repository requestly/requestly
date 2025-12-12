import { isApiCollection } from "features/apiClient/screens/apiClient/utils";
import { RQAPI } from "features/apiClient/types";

export const updateRecordSelection = (
  record: RQAPI.ApiClientRecord,
  checked: boolean,
  prevSelectedRecords: Set<RQAPI.ApiClientRecord["id"]>
) => {
  const newSelectedRecords = new Set<RQAPI.ApiClientRecord["id"]>([...prevSelectedRecords]);
  const unselectedRecords = new Set<RQAPI.ApiClientRecord["id"]>();

  const queue = [record];
  while (queue.length) {
    const current = queue.pop();
    if (!current) continue;

    if (checked) {
      newSelectedRecords.add(current.id);
    } else {
      newSelectedRecords.delete(current.id);
      unselectedRecords.add(current.id);
    }

    if (isApiCollection(current) && current.data.children) {
      queue.push(...current.data.children);
    }
  }

  return { newSelectedRecords, unselectedRecords };
};
