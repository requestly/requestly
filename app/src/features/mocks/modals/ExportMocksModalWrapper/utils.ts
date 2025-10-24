import { RQMockSchema } from "components/features/mocksV2/types";
import { isMock } from "features/mocks/screens/mocksList/components/MocksList/components/MocksTable/utils";
import { getFormattedDate } from "utils/DateTimeUtils";

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

  const fileName = mocks.length === 1 ? `${mocks[0].name}` : `requestly_mocks_export_${getFormattedDate("DD_MM_YYYY")}`;

  return {
    fileName,
    mocksCount,
    collectionsCount,
    fileContent: JSON.stringify(mocksToExport, null, 2),
  };
};
