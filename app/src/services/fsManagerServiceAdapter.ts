// import { isFeatureCompatible } from "utils/CompatibilityUtils";
import BackgroundServiceAdapter, { rpc } from "./DesktopBackgroundService";
// import FEATURES from "config/constants/sub/features";
export class FsManagerServiceAdapter extends BackgroundServiceAdapter {
  static NAMESPACE = "local_sync";
  constructor() {
    super(FsManagerServiceAdapter.NAMESPACE);
    // if (!isFeatureCompatible(FEATURES.LOCAL_FILE_SYNC)) {
    //   throw new Error("LocalFileSync is not supported in the current version of the app");
    // }
  }

  async build(rootPath: string) {
    return this.invokeProcedureInBG("build", rootPath) as Promise<void>;
  }

	async getAllRecords() {
		return this.invokeProcedureInBG("getAllRecords") as Promise<any>;
	}

	async getRecord(id: string) {
		return this.invokeProcedureInBG("getRecord", id) as Promise<any>;
	}
}

class FsManagerServiceAdapterProvider {
  private service: FsManagerServiceAdapter;

  async get(rootPath: string) {
    if (this.service) {
      return this.service;
    }

    const service = new FsManagerServiceAdapter();
    await service.build(rootPath);
    this.service = service;

    return service;
  }
}

export const fsManagerServiceAdapterProvider = new FsManagerServiceAdapterProvider();
export function createWorkspaceFolder(path: string) {
	return rpc(FsManagerServiceAdapter.NAMESPACE, "createWorkspaceFolder", path);
}
