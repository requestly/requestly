import Logger from "lib/logger";
import { clientStorageService } from "..";
import { SessionRecordingConfig } from "features/sessionBook";

class ClientSessionRecordingStorageService {
  async saveSessionRecordingConfig(config: SessionRecordingConfig) {
    Logger.log("[ClientSessionRecordingStorageService] saveSessionRecordingConfig", config);
    return clientStorageService.saveStorageObject({ sessionRecordingConfig: config });
  }

  async getSessionRecordingConfig(): Promise<SessionRecordingConfig> {
    Logger.log("[ClientSessionRecordingStorageService] getSessionRecordingConfig");
    const superObject = await clientStorageService.getStorageSuperObject();
    const config = superObject?.["sessionRecordingConfig"];
    Logger.log("[ClientSessionRecordingStorageService] getSessionRecordingConfig", { config });
    return config;
  }
}

const clientSessionRecordingStorageService = new ClientSessionRecordingStorageService();
export default clientSessionRecordingStorageService;
