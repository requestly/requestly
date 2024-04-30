import { MockTableHeaderFilter, RQMockMetadataSchema } from "components/features/mocksV2/types";
import { isRecordMock, isRecordMockCollection } from "../../MocksTable/utils";

export const getQuickFilteredRecords = (records: RQMockMetadataSchema[], filterType: MockTableHeaderFilter) => {
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
