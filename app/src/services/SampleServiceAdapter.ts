// import { isFeatureCompatible } from "utils/CompatibilityUtils";
import BackgroundServiceAdapter from "./DesktopBackgroundService";
// import FEATURES from "config/constants/sub/features";

const SERVICE_NAMESPACE = "test";

export class SampleService extends BackgroundServiceAdapter {
  constructor() {
    super(SERVICE_NAMESPACE);
    // if (!isFeatureCompatible(FEATURES.LOCAL_FILE_SYNC)) {
    //   throw new Error("LocalFileSync is not supported in the current version of the app");
    // }
  }

  async build(baseBuilder: number) {
    console.log("DBG: build called from adapter");
    // this.instance = new TestClass(base, this.sendServiceEvent.bind(this));
    return this.invokeProcedureInBG("build", baseBuilder) as Promise<void>;
  }

  // type imposed for args (expected to mirror background method defination)
  add = (addToBase: number) => {
    /* Any Extra Processing in UI for this method */

    return this.invokeProcedureInBG("add", addToBase) as Promise<{ typesImposedForResponse: any }>;
  };

  multiply = (multiplyWithBase: number) => {
    return this.invokeProcedureInBG("multiply", multiplyWithBase);
  };
}

class SampleServiceProvider {
  service: SampleService;

  async get(arg: number) {
    if (this.service) {
      return this.service;
    }

    const service = new SampleService();
    await service.build(arg);
    this.service = service;

    return service;
  }
}

export const sampleSerivceProvider = new SampleServiceProvider();
