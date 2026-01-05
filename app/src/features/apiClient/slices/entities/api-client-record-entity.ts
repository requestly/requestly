import type { RQAPI } from "features/apiClient/types";
import type { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry/types";
import { ApiClientEntity, ApiClientEntityMeta } from "./base";
import type { UpdateCommand, DeepPartial, DeepPartialWithNull } from "../types";
import { apiRecordsActions } from "../apiRecords";

export abstract class ApiClientRecordEntity<T extends RQAPI.ApiClientRecord, M extends ApiClientEntityMeta = ApiClientEntityMeta> extends ApiClientEntity<T, M> {
  dispatchCommand(command: UpdateCommand<T>): void {
    this.dispatch(apiRecordsActions.applyPatch({ id: this.meta.id, command }));
  }

  override dispatchUnsafePatch(patcher: (state: T) => void): void {
    this.dispatch(apiRecordsActions.unsafePatch({ id: this.meta.id, patcher }));
  }

  protected SETCOMMON(value: DeepPartial<RQAPI.ApiClientRecord>): void {
    const command = { type: "SET" as const, value };
    this.dispatchCommand(command as UpdateCommand<T>);
  }

  protected DELETECOMMON(value: DeepPartialWithNull<RQAPI.ApiClientRecord>): void {
    const command = { type: "DELETE" as const, value };
    this.dispatchCommand(command as UpdateCommand<T>);
  }

  upsert(params: T): void {
      this.dispatch(apiRecordsActions.upsertRecord(params));
  }

  getName(state: ApiClientStoreState): string {
    return this.getEntityFromState(state).name;
  }

  getDescription(state: ApiClientStoreState): string | undefined {
    return this.getEntityFromState(state).description;
  }

  getCollectionId(state: ApiClientStoreState): string | null | undefined {
    return this.getEntityFromState(state).collectionId;
  }

  getAuth(state: ApiClientStoreState): RQAPI.Auth | undefined {
    return this.getEntityFromState(state).data?.auth;
  }

  getScripts(state: ApiClientStoreState): { preRequest?: string; postResponse?: string } | undefined {
    return this.getEntityFromState(state).data?.scripts;
  }

  getPreRequestScript(state: ApiClientStoreState): string | undefined {
    return this.getScripts(state)?.preRequest;
  }

  getPostResponseScript(state: ApiClientStoreState): string | undefined {
    return this.getScripts(state)?.postResponse;
  }

  setName(name: string): void {
    this.SETCOMMON({ name });
  }

  setDescription(description: string): void {
    this.SETCOMMON({ description });
  }

  setCollectionId(collectionId: string | null): void {
    this.SETCOMMON({ collectionId });
  }

  deleteName(): void {
    this.DELETECOMMON({ name: null });
  }

  deleteDescription(): void {
    this.DELETECOMMON({ description: null });
  }

  setAuth(auth: RQAPI.Auth): void {
    this.SETCOMMON({ data: { auth } });
  }

  deleteAuth(): void {
    this.DELETECOMMON({ data: { auth: null } });
  }

  setScripts(scripts: { preRequest?: string; postResponse?: string }): void {
    this.SETCOMMON({ data: { scripts } });
  }

  setPreRequestScript(script: string): void {
    this.SETCOMMON({ data: { scripts: { preRequest: script } } });
  }

  setPostResponseScript(script: string): void {
    this.SETCOMMON({ data: { scripts: { postResponse: script } } });
  }
}
