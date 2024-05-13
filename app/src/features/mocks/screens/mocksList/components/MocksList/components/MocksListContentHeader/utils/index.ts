import { MockTableHeaderFilter, RQMockMetadataSchema } from "components/features/mocksV2/types";

const getQuickFilteredRecords = (records: RQMockMetadataSchema[], filterType: MockTableHeaderFilter) => {
  switch (filterType) {
    case "all": {
      return records;
    }
    case "starred": {
      return records.filter((record) => record.isFavourite);
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
