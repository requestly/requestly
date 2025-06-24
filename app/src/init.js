import StorageServiceWrapper from "./utils/StorageServiceWrapper";

//Initialize StorageService
export const StorageService = (appMode) => {
  return new StorageServiceWrapper({
    appMode: appMode,
  });
};
