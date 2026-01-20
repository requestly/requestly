import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { BaseStorageClient } from "./clients/base";
import ExtensionStorageClient from "./clients/extensions";
import DesktopStorageClient from "./clients/desktop";
import Logger from "lib/logger";

let clientStorageService: BaseStorageClient = new BaseStorageClient();

const initClientStorageService = (appMode: string) => {
  Logger.log("[initClientStorageService]", { appMode });
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
