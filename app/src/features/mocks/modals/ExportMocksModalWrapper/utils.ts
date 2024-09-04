import { RQMockSchema } from "components/features/mocksV2/types";
import { isMock } from "features/mocks/screens/mocksList/components/MocksList/components/MocksTable/utils";

export const prepareMocksToExport = (mocks: RQMockSchema[]) => {
  let mocksCount = 0;
  let collectionsCount = 0;

  const mocksToExport = mocks.map((mock) => {
    mock.createdBy = null;
    mock.lastUpdatedBy = null;
    mock.ownerId = null;
    mock.createdTs = null;
    mock.updatedTs = null;

    if (isMock(mock)) {
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
};
