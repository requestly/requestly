import DesktopHelper from "./DesktopHelper";
import ExtensionHelper from "../utils/ExtensionHelper";
// CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

export const getStorageHelper = (appMode) => {
  switch (appMode) {
    case GLOBAL_CONSTANTS.APP_MODES.EXTENSION:
      return ExtensionHelper;

    case GLOBAL_CONSTANTS.APP_MODES.DESKTOP:
      return DesktopHelper;

    default:
      return ExtensionHelper;
  }
};
