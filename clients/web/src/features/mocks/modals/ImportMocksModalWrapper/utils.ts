import { MockRecordType, RQMockSchema } from "components/features/mocksV2/types";
import { isCollection } from "features/mocks/screens/mocksList/components/MocksList/components/MocksTable/utils";

export const processMocksToImport = (uid: string, parsedRecords: RQMockSchema[]) => {
  const isValidRecords = parsedRecords?.every((record) => {
    return [MockRecordType.MOCK, MockRecordType.COLLECTION].includes(record?.recordType);
  });

  if (!isValidRecords) {
    throw new Error("Invalid records!");
  }

  const mocks: RQMockSchema[] = [];
  const collections: RQMockSchema[] = [];

  parsedRecords?.forEach((record) => {
    record.createdBy = uid || null;
    record.lastUpdatedBy = uid || null;
    record.ownerId = uid || null;

    if (isCollection(record)) {
      collections.push(record);
    } else {
      mocks.push(record);
    }
  });

  return {
    records: parsedRecords,
    mocks,
    collections,
    mocksCount: mocks.length,
    collectionsCount: collections.length,
    mockTypeToImport: mocks[0]?.type,
    success: true,
  };
};
