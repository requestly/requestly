import { Dispatch } from "@reduxjs/toolkit";
import { DeepPartialWithNull, DeleteMarker, EntityId, UpdateCommand } from "../types";

export interface UpdaterMeta {
  readonly id: EntityId;
}

export abstract class BaseUpdater<T extends object, K extends UpdaterMeta = UpdaterMeta> {
  constructor(protected readonly dispatch: Dispatch, protected readonly meta: K) {}

  protected abstract dispatchCommand(command: UpdateCommand<T>): void;

  protected SET(value: DeepPartialWithNull<T>): void {
    this.dispatchCommand({ type: "SET", value });
  }

  protected DELETE(marker: DeleteMarker<T>): void {
    this.dispatchCommand({ type: "DELETE", value: marker });
  }

  get id(): EntityId {
    return this.meta.id;
  }
}
