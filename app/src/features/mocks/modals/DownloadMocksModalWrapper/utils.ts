import { RQMockSchema } from "components/features/mocksV2/types";
import { isRecordMock } from "features/mocks/screens/mocksList/components/MocksList/components/MocksTable/utils";

export const prepareMocksToExport = (mocks: RQMockSchema[]) => {
  try {
    let mocksCount = 0;
    let collectionsCount = 0;

    const mocksToExport = mocks.map((mock) => {
      mock.createdBy = null;
      mock.lastUpdatedBy = null;
      mock.ownerId = null;

      if (isRecordMock(mock)) {
        mocksCount += 1;
        mock.storagePath = null;
        mock.responses?.forEach((response) => {
          response.filePath = null;
        });
      } else {
        collectionsCount += 1;
      }

      return mock;
    });

    return {
      mocksCount,
      collectionsCount,
      fileContent: JSON.stringify(mocksToExport, null, 2),
    };
  } catch (error) {
    // NOOP
  }
};
