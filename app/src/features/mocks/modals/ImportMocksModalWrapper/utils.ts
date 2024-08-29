import { MockRecordType, RQMockSchema } from "components/features/mocksV2/types";
import { isRecordMockCollection } from "features/mocks/screens/mocksList/components/MocksList/components/MocksTable/utils";

export const processMocksToImport = (uid: string, parsedRecords: RQMockSchema[]) => {
  try {
    const isValidRecords = parsedRecords?.every((record) => {
      return [MockRecordType.MOCK, MockRecordType.COLLECTION].includes(record?.recordType);
    });

    if (!isValidRecords) {
      return { records: [], mocks: [], collections: [], mocksCount: 0, collectionsCount: 0, success: false };
    }

    const mocks: RQMockSchema[] = [];
    const collections: RQMockSchema[] = [];

    parsedRecords?.forEach((record) => {
      record.createdBy = uid || null;
      record.lastUpdatedBy = uid || null;
      record.ownerId = uid || null;

      if (isRecordMockCollection(record)) {
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
      success: true,
    };
  } catch (error) {
    // NOOP
  }
};
