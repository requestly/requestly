import PSMH from "./config/PageScriptMessageHandler";
import StorageServiceWrapper from "./utils/StorageServiceWrapper";

//Initialize StorageService
export const StorageService = (appMode) => {
  return new StorageServiceWrapper({
    cacheRecords: false,
    appMode: appMode,
  });
};

//Initialize PageScriptMessageHandler
PSMH.init();
