import { EnvironmentMap } from "backend/environment/types";
import { RQAPI } from "features/apiClient/types";

type ApiClientLocalStorageMetadata = { version: number; storageKey: string };

type ApiClientLocalStorageRecords = {
  apis: RQAPI.Record[];
  environments: EnvironmentMap;
};

export class ApiClientLocalStorage {
  private static instance: ApiClientLocalStorage = null;
  private readonly metadata: ApiClientLocalStorageMetadata;
  private static readonly DEFAULT_STATE: ApiClientLocalStorageRecords = { apis: [], environments: {} };

  constructor(metadata: ApiClientLocalStorageMetadata) {
    this.metadata = metadata;

    const isInitialized = this.getRecords();

    if (isInitialized) {
      return;
    }

    localStorage.setItem(this.getStorageKey(), JSON.stringify(ApiClientLocalStorage.DEFAULT_STATE));
  }

  public static getInstance(metadata: ApiClientLocalStorageMetadata): ApiClientLocalStorage {
    if (!ApiClientLocalStorage.instance) {
      ApiClientLocalStorage.instance = new ApiClientLocalStorage(metadata);
    }

    return ApiClientLocalStorage.instance;
  }

  private getVersion() {
    return this.metadata.version;
  }

  private getStorageKey() {
    return `${this.metadata.storageKey}:v${this.getVersion()}`;
  }

  public getRecords(): ApiClientLocalStorageRecords {
    return JSON.parse(localStorage.getItem(this.getStorageKey()));
  }

  public setRecords(records: ApiClientLocalStorageRecords): void {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(records));
  }

  public clearRecords(): void {
    localStorage.removeItem(this.getStorageKey());
  }
}
