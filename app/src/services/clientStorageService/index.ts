import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { BaseStorageClient } from "./clients/base";
import ExtensionStorageClient from "./clients/extensions";
import DesktopStorageClient from "./clients/desktop";

let clientStorageService: BaseStorageClient = new BaseStorageClient();

const initClientStorageService = (appMode: string) => {
  switch (appMode) {
    case GLOBAL_CONSTANTS.APP_MODES.EXTENSION:
      clientStorageService = new ExtensionStorageClient();
      break;

    case GLOBAL_CONSTANTS.APP_MODES.DESKTOP:
      clientStorageService = new DesktopStorageClient();
      break;

    default:
      clientStorageService = new BaseStorageClient();
      break;
  }
};

export { clientStorageService, initClientStorageService };
