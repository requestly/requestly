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

export const mocksToContentTableDataAdapter = (mocks: RQMockMetadataSchema[]) => {
  const mockCollections: {
    [id: RQMockMetadataSchema["id"]]: RQMockMetadataSchema & { children: RQMockMetadataSchema[] };
  } = {};

  mocks.forEach((mock) => {
    if (isRecordMockCollection(mock)) {
      mockCollections[mock.id] = { ...mock, children: [] };
    }
  });

  const otherMocks: RQMockMetadataSchema[] = [];

  mocks.forEach((mock) => {
    if (isMockInCollection(mock)) {
      if (mockCollections[mock.collectionId]) {
        mockCollections[mock.collectionId].children.push(mock);
      }
    } else if (!isRecordMockCollection(mock)) {
      otherMocks.push(mock);
    }
  });

  const filteredMocks = [...Object.values(mockCollections), ...otherMocks];

  return filteredMocks;
};
