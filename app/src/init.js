import PSMH from "./config/PageScriptMessageHandler";
import StorageServiceWrapper from "./utils/StorageServiceWrapper";

//Initialize StorageService
export const StorageService = (appMode) => {
  return new StorageServiceWrapper({
    appMode: appMode,
  });
};

//Initialize PageScriptMessageHandler
PSMH.init();
