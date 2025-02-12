import { isFeatureCompatible } from "utils/CompatibilityUtils";
import BackgroundServiceAdapter, { Singleton } from "./DesktopBackgroundService";
import FEATURES from "config/constants/sub/features";

// type FILE_SERVICE_METHODS = 'test' | 'anyOtherMethod'; // not required, but can be specified
const SERVICE_NAMESPACE = "fs";

export class LocalFileSync extends BackgroundServiceAdapter {
  constructor() {
    super(SERVICE_NAMESPACE);
    if (!isFeatureCompatible(FEATURES.LOCAL_FILE_SYNC)) {
      throw new Error("LocalFileSync is not supported in the current version of the app");
    }
  }

  // type imposed for args (expected to mirror background method defination)
  test = (arg1: { foo: string }, arg2: { bar: string }) => {
    /* Any Extra Processing in UI for this method */

    return this.invokeProcedureInBG("test", arg1, arg2) as Promise<{ typesImposedForResponse: any }>;
  };

  notImplementedInBG = (shouldAlwaysThrowError: any) => {
    return this.invokeProcedureInBG("notImplementedInBG", shouldAlwaysThrowError);
  };
}

// incase the service is stateful and shared across multiple components use following singleton template to avoid inconsistencies
export class LocalFileSyncProvider extends Singleton {
  static instance: LocalFileSync;

  static getInstance() {
    if (!LocalFileSyncProvider.instance) {
      LocalFileSyncProvider.instance = new LocalFileSync();
    }

    return LocalFileSyncProvider.instance;
  }
}
