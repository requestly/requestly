import { Dispatch } from "@reduxjs/toolkit";
import { EntityId, UpdateCommand } from "../types";

export interface UpdaterMeta {
  id: EntityId;
}

export abstract class BaseUpdater<T> {
  constructor(protected dispatch: Dispatch, protected meta: UpdaterMeta) {}

  protected abstract dispatchCommand(command: UpdateCommand<T>): void;

  get id(): EntityId {
    return this.meta.id;
  }
}
