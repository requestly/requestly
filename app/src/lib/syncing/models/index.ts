import { StorageEntity } from "@requestly/shared/types/entities";
import { SyncModel } from "../syncEngine/models";

export class StorageModel<T extends StorageEntity> {
  static onUpdateHook: (storageModels: StorageModel<any>[]) => void = () => {
    console.log("onUpdateHook");
  };

  static onDeleteHook: (storageModels: StorageModel<any>[]) => void = () => {
    console.log("onDeleteHook");
  };

  _data: T;

  get data(): T {
    return this._data;
  }

  /** Do not use this. Use .create() **/
  constructor(data: T, workspaceId: string) {
    this._data = data;
    console.log(workspaceId);
    // Was leading to reset in inherited class
    // this.initSyncModels(data, workspaceId);
  }

  initSyncModels(data: T, workspaceId: string) {
    console.debug(data, workspaceId);
  }

  async save() {
    StorageModel.onUpdateHook?.([this]);
  }

  /** Override **/
  delete() {
    StorageModel.onDeleteHook?.([this]);
  }

  update(data: T, workspaceId: string) {
    console.debug("update", data, workspaceId);
    data.updatedAt = Date.now();
    this.initSyncModels(data, workspaceId);
  }

  /** Can have multiple syncModels too as params*/
  /** Override **/
  static createFromSyncModels(syncModel: SyncModel<any>) {
    console.debug(syncModel);
  }

  /** Override **/
  static subscribe(callback: (storageModels: StorageModel<any>[]) => void) {
    console.debug(callback);
  }

  static create<T extends StorageEntity>(data: T, workspaceId: string) {
    console.debug("create", data, workspaceId);
    const instance = new this(data, workspaceId);
    return instance;
  }

  static registerOnUpdateHook(callback: (storageModels: StorageModel<any>[]) => void) {
    StorageModel.onUpdateHook = callback;
  }

  static registerOnDeleteHook(callback: (storageModels: StorageModel<any>[]) => void) {
    StorageModel.onDeleteHook = callback;
  }
}
