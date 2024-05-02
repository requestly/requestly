import { MockRecordType, RQMockMetadataSchema } from "components/features/mocksV2/types";

export const isRecordMock = (record: RQMockMetadataSchema) => {
  return !record.recordType || record.recordType === MockRecordType.MOCK;
};

export const isRecordMockCollection = (record: RQMockMetadataSchema) => {
  return record.recordType === MockRecordType.COLLECTION;
};

export const isMockInCollection = (mock: RQMockMetadataSchema) => {
  return !!mock.collectionId;
};

export const enhanceRecords = (
  filteredRecords: RQMockMetadataSchema[],
  allRecords: RQMockMetadataSchema[]
): RQMockMetadataSchema[] => {
  const allRecordsMap: { [id: string]: RQMockMetadataSchema } = {};
  const enhancedRecordsMap: { [id: string]: RQMockMetadataSchema } = {};

  allRecords.forEach((record) => {
    allRecordsMap[record.id] = record;
  });

  filteredRecords.forEach((record) => {
    enhancedRecordsMap[record.id] = record;
  });

  allRecords.forEach((record) => {
    // Add all the child mocks if collection exists
    if (enhancedRecordsMap[record.collectionId]) {
      enhancedRecordsMap[record.id] = record;
    }

    // Add the collection if child mock already present
    if (enhancedRecordsMap[record.id] && record.collectionId && !enhancedRecordsMap[record.collectionId]) {
      enhancedRecordsMap[record.collectionId] = allRecordsMap[record.collectionId];
    }
  });

  return Object.values(enhancedRecordsMap);
};

export const recordsToContentTableDataAdapter = (records: RQMockMetadataSchema[]) => {
  const mockCollections: {
    [id: RQMockMetadataSchema["id"]]: RQMockMetadataSchema & { children: RQMockMetadataSchema[] };
  } = {};

  records.forEach((record) => {
    if (isRecordMockCollection(record)) {
      mockCollections[record.id] = { ...record, children: [] };
    }
  });

  const otherRecords: RQMockMetadataSchema[] = [];

  records.forEach((record) => {
    if (isMockInCollection(record)) {
      if (mockCollections[record.collectionId]) {
        mockCollections[record.collectionId].children.push(record);
      }
    } else if (!isRecordMockCollection(record)) {
      otherRecords.push(record);
    }
  });

  const filteredRecords = [...Object.values(mockCollections), ...otherRecords];

  return filteredRecords;
};
