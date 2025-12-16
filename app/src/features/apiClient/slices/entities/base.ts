import { UpdateCommand, DeepPartial, DeepPartialWithNull } from "../types";
import { ApiClientRootState } from "../hooks/types";
import { ApiClientEntityType, EntityDispatch } from "./types";

export type ApiClientEntityMeta = {
  id: string,
}

export abstract class ApiClientEntity<T, M extends ApiClientEntityMeta = ApiClientEntityMeta> {
  abstract readonly type: ApiClientEntityType;

  constructor(protected readonly dispatch: EntityDispatch, public readonly meta: M) {}

  abstract dispatchCommand(command: UpdateCommand<T>): void;

  abstract getEntityFromState(state: ApiClientRootState): T;

  abstract getName(state: ApiClientRootState): string;

  get id(): string {
    return this.meta.id;
  }

  SET(value: DeepPartial<T>): void {
    this.dispatchCommand({ type: "SET", value });
  }

  DELETE(value: DeepPartialWithNull<T>): void {
    this.dispatchCommand({ type: "DELETE", value });
  }
}
