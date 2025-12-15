import { RQAPI } from "features/apiClient/types";
import { UpdateCommand, DeepPartial, DeepPartialWithNull } from "../types";
import { ApiClientRootState } from "../hooks/types";
import { EntityType, EntityMeta, SerializedEntity, EntityDispatch } from "./types";

type CommonEditableFields = Pick<RQAPI.RecordMetadata, "name" | "description" | "collectionId"> & {
  data?: {
    auth?: RQAPI.Auth;
    scripts?: {
      preRequest?: string;
      postResponse?: string;
    };
  };
};

export abstract class ApiClientEntity<T extends RQAPI.ApiClientRecord> {
  abstract readonly type: EntityType;

  constructor(protected readonly dispatch: EntityDispatch, public readonly meta: EntityMeta) {}

  protected abstract dispatchCommand(command: UpdateCommand<T>): void;

  abstract getFromState(state: ApiClientRootState): T | undefined;

  serialize(): SerializedEntity {
    return { id: this.meta.id, type: this.type };
  }

  get id(): string {
    return this.meta.id;
  }

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
}
