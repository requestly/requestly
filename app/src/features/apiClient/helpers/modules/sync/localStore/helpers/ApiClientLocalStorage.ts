import { EnvironmentMap } from "backend/environment/types";
import { RQAPI } from "features/apiClient/types";

type ApiClientLocalStorageMetadata = { version: number; storageKey: string };

type ApiClientLocalStorageRecords = {
  apis: RQAPI.Record[];
  environments: EnvironmentMap;
  metadata: {
    isSynced: boolean;
  };
};

export class ApiClientLocalStorage {
  private static instance: ApiClientLocalStorage = null;
  private readonly metadata: ApiClientLocalStorageMetadata;
  private static readonly DEFAULT_STATE: ApiClientLocalStorageRecords = {
    apis: [],
    environments: {},
    metadata: { isSynced: false },
  };

  constructor(metadata: ApiClientLocalStorageMetadata) {
    this.metadata = metadata;

    const isInitialized = !!this.getRecords();

    if (isInitialized) {
      return;
    }

    localStorage.setItem(this.getStorageKey(), JSON.stringify(ApiClientLocalStorage.DEFAULT_STATE));
  }

  public static init(metadata: ApiClientLocalStorageMetadata) {
    if (!ApiClientLocalStorage.instance) {
      ApiClientLocalStorage.instance = new ApiClientLocalStorage(metadata);
    }
  }

  public static getInstance(): ApiClientLocalStorage {
    if (!ApiClientLocalStorage.instance) {
      return;
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

  public resetRecords(): void {
    this.setRecords({ ...ApiClientLocalStorage.DEFAULT_STATE });
  }

  public isSynced(): boolean {
    const records = this.getRecords();
    return records.metadata.isSynced;
  }
}
