import Logger from "lib/logger";
import { clientStorageService } from "..";
import { SessionRecordingConfig } from "features/sessionBook";

class ClientSessionRecordingStorageService {
  async saveSessionRecordingConfig(config: SessionRecordingConfig) {
    Logger.log("[ClientSessionRecordingStorageService] saveSessionRecordingConfig", config);
    return clientStorageService.saveStorageObject({ sessionRecordingConfig: config });
  }

  async getSessionRecordingConfig(): Promise<SessionRecordingConfig | undefined> {
    Logger.log("[ClientSessionRecordingStorageService] getSessionRecordingConfig");
    const config = await clientStorageService.getStorageObject("sessionRecordingConfig");
    Logger.log("[ClientSessionRecordingStorageService] getSessionRecordingConfig", { config });
    return config;
  }
}

const clientSessionRecordingStorageService = new ClientSessionRecordingStorageService();
export default clientSessionRecordingStorageService;
