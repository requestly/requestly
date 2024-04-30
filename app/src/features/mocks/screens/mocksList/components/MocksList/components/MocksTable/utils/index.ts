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
