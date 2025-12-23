import { RQAPI } from "features/apiClient/types";
import type { UpdateCommand, DeepPartial, DeepPartialWithNull } from "../types";
import type { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry/types";
import type { ApiClientEntityType, EntityDispatch } from "./types";

export type ApiClientEntityMeta = {
  id: string;
};

export abstract class ApiClientEntity<T, M extends ApiClientEntityMeta = ApiClientEntityMeta> {
  abstract readonly type: ApiClientEntityType;

  constructor(protected readonly dispatch: EntityDispatch, public readonly meta: M) {}

  abstract dispatchCommand(command: UpdateCommand<T>): void;
  abstract dispatchUnsafePatch(params: (patch: T) => void): void;

  abstract getEntityFromState(state: ApiClientStoreState): T;

  abstract getName(state: ApiClientStoreState): string;

  get id(): string {
    return this.meta.id;
  }

  unsafePatch(patcher: (patch: T) => void) {
    this.dispatchUnsafePatch(patcher);
  }

  SET(value: DeepPartial<T>): void {
    this.dispatchCommand({ type: "SET", value });
  }

  DELETE(value: DeepPartialWithNull<T>): void {
    this.dispatchCommand({ type: "DELETE", value });
  }

  protected SETCOMMON(value: DeepPartial<RQAPI.ApiClientRecord>): void {
    const command = { type: "SET" as const, value };
    this.dispatchCommand(command as UpdateCommand<T>);
  }

  protected DELETECOMMON(value: DeepPartialWithNull<RQAPI.ApiClientRecord>): void {
    const command = { type: "DELETE" as const, value };
    this.dispatchCommand(command as UpdateCommand<T>);
  }
}
