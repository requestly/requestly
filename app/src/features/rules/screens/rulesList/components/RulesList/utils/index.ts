import { FilterType } from "componentsV2/ContentList/ContentListHeader";
import { RecordStatus, StorageRecord } from "features/rules/types/rules";

// FIXME: Performance Improvements
// TODO: REname
// TODO: Fix FilterType import
export const getFilteredRecords = (records: StorageRecord[], filterType: FilterType, searchValue: string) => {
  const filteredRecords = getQuickFilteredRecords(records, filterType);

  let searchFilteredRecords = filteredRecords;
  if (searchValue) {
    searchFilteredRecords = filteredRecords.filter((record) => {
      return record.name.toLowerCase().includes(searchValue.toLowerCase());
    });
  }

  console.log({ records, filteredRecords, searchFilteredRecords });
  return searchFilteredRecords;
};

const getQuickFilteredRecords = (records: StorageRecord[], filterType: FilterType) => {
  switch (filterType) {
    case "all":
      return records;
    case "pinned":
      return records.filter((record) => {
        return record.isFavourite;
      });
    case "active":
      return records.filter((record) => {
        return record.status === RecordStatus.ACTIVE;
      });
    default:
      return records;
  }
};
