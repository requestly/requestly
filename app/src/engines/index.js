import DesktopHelper from "./DesktopHelper";
import ExtensionHelper from "../utils/ExtensionHelper";
import RemoteHelper from "engines/RemoteHelper";
// CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

export const getStorageHelper = (appMode) => {
  switch (appMode) {
    case GLOBAL_CONSTANTS.APP_MODES.EXTENSION:
      return ExtensionHelper;

    case GLOBAL_CONSTANTS.APP_MODES.DESKTOP:
      return DesktopHelper;

    case GLOBAL_CONSTANTS.APP_MODES.REMOTE:
      return RemoteHelper;

    default:
      return RemoteHelper;
  }
};
