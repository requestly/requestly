import { MockRecordType, RQMockMetadataSchema } from "components/features/mocksV2/types";
import { MockTableRecord } from "../types";

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

    // Add collection if child mock present
    if (record.collectionId && !enhancedRecordsMap[record.collectionId]) {
      enhancedRecordsMap[record.collectionId] = allRecordsMap[record.collectionId];
    } // Add all the child mocks if collection
    else if (isRecordMockCollection(record)) {
      allRecords
        .filter((mockRecord) => isRecordMock(mockRecord) && record.id === mockRecord.collectionId)
        .forEach((record) => {
          enhancedRecordsMap[record.id] = record;
        });
    }
  });

  return Object.values(enhancedRecordsMap);
};

export const recordsToContentTableDataAdapter = (records: RQMockMetadataSchema[]) => {
  const mockCollections: {
    [id: RQMockMetadataSchema["id"]]: MockTableRecord;
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

export const normalizeRecord = (tableRecord: MockTableRecord): RQMockMetadataSchema => {
  if (isRecordMockCollection(tableRecord)) {
    const _tableRecord = {
      ...tableRecord,
    };

    delete _tableRecord.children;
    return _tableRecord as RQMockMetadataSchema;
  }
  return tableRecord as RQMockMetadataSchema;
};

export const normalizeRecords = (tableRecords: MockTableRecord[]): RQMockMetadataSchema[] => {
  return tableRecords.map(normalizeRecord);
};
