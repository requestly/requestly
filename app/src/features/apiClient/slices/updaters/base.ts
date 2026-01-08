import { Dispatch } from "@reduxjs/toolkit";
import { DeepPartial, DeepPartialWithNull, EntityId, UpdateCommand } from "../types";
import { RQAPI } from "@requestly/shared/types/entities/apiClient";

export interface UpdaterMeta {
  readonly id: EntityId;
}

export type CommonEditableFields = Pick<RQAPI.RecordMetadata, "name" | "description" | "collectionId"> & {
  data: Pick<RQAPI.ApiEntryMetaData, "auth" | "scripts">;
};

export abstract class BaseUpdater<T extends RQAPI.ApiClientRecord, K extends UpdaterMeta = UpdaterMeta> {
  constructor(protected readonly dispatch: Dispatch, protected readonly meta: K) {}

  protected abstract dispatchCommand(command: UpdateCommand<T>): void;

  protected SET(value: DeepPartial<T>): void {
    this.dispatchCommand({ type: "SET", value });
  }

  protected DELETE(value: DeepPartialWithNull<T>): void {
    this.dispatchCommand({ type: "DELETE", value });
  }

  protected setCommon(value: DeepPartial<CommonEditableFields>): void {
    this.dispatchCommand({ type: "SET", value: value as DeepPartial<T> });
  }

  protected deleteCommon(value: DeepPartialWithNull<CommonEditableFields>): void {
    this.dispatchCommand({ type: "DELETE", value: value as DeepPartialWithNull<T> });
  }

  get id(): EntityId {
    return this.meta.id;
  }
}
