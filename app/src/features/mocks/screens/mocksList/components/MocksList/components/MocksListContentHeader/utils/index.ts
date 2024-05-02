import { MockTableHeaderFilter, RQMockMetadataSchema } from "components/features/mocksV2/types";
import { isRecordMock, isRecordMockCollection } from "../../MocksTable/utils";

const getQuickFilteredRecords = (records: RQMockMetadataSchema[], filterType: MockTableHeaderFilter) => {
  switch (filterType) {
    case "all": {
      return records;
    }
    case "starred": {
      const starredMocksCollectionIds: Set<string> = new Set();

      records.forEach((record) => {
        if (isRecordMock(record) && record.isFavourite && record.collectionId) {
          starredMocksCollectionIds.add(record.collectionId);
        }
      });

      return records.filter((record) => {
        return isRecordMockCollection(record) ? starredMocksCollectionIds.has(record.id) : record.isFavourite;
      });
    }
    default: {
      return records;
    }
  }
};

const getSearchedRecords = (searchValue: string, mockRecords: RQMockMetadataSchema[]) => {
  if (!searchValue) {
    return mockRecords;
  }

  const searchedMocks = mockRecords.filter((mock: RQMockMetadataSchema) => {
    return mock.name.toLowerCase().includes(searchValue.toLowerCase());
  });
  return searchedMocks;
};

export const getFilteredRecords = (
  searchValue: string,
  filterType: MockTableHeaderFilter,
  records: RQMockMetadataSchema[]
) => {
  const filteredRecords = getQuickFilteredRecords(records, filterType);
  const searchedRecords = getSearchedRecords(searchValue, filteredRecords);
  return searchedRecords;
};
