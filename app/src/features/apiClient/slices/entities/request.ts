import { KeyValuePair, RQAPI } from "features/apiClient/types";
import { ApiClientRootState } from "../hooks/types";
import { ApiClientEntity } from "./base";

export abstract class RequestEntity<T extends RQAPI.ApiRecord> extends ApiClientEntity<T> {
  getName(state: ApiClientRootState): string | undefined {
    return this.getFromState(state)?.name;
  }

  getDescription(state: ApiClientRootState): string | undefined {
    return this.getFromState(state)?.description;
  }

  getCollectionId(state: ApiClientRootState): string | null | undefined {
    return this.getFromState(state)?.collectionId;
  }

  getAuth(state: ApiClientRootState): RQAPI.Auth | undefined {
    return this.getFromState(state)?.data?.auth;
  }

  getScripts(state: ApiClientRootState): { preRequest?: string; postResponse?: string } | undefined {
    return this.getFromState(state)?.data?.scripts;
  }

  getPreRequestScript(state: ApiClientRootState): string | undefined {
    return this.getScripts(state)?.preRequest;
  }

  getPostResponseScript(state: ApiClientRootState): string | undefined {
    return this.getScripts(state)?.postResponse;
  }

  abstract getUrl(state: ApiClientRootState): string | undefined;

  abstract getHeaders(state: ApiClientRootState): KeyValuePair[] | undefined;

  setName(name: string): void {
    this.setCommon({ name });
  }

  setDescription(description: string): void {
    this.setCommon({ description });
  }

  setCollectionId(collectionId: string | null): void {
    this.setCommon({ collectionId });
  }

  deleteName(): void {
    this.deleteCommon({ name: null });
  }

  deleteDescription(): void {
    this.deleteCommon({ description: null });
  }

  setAuth(auth: RQAPI.Auth): void {
    this.setCommon({ data: { auth } });
  }

  deleteAuth(): void {
    this.deleteCommon({ data: { auth: null } });
  }

  setScripts(scripts: { preRequest?: string; postResponse?: string }): void {
    this.setCommon({ data: { scripts } });
  }

  setPreRequestScript(script: string): void {
    this.setCommon({ data: { scripts: { preRequest: script } } });
  }

  setPostResponseScript(script: string): void {
    this.setCommon({ data: { scripts: { postResponse: script } } });
  }
}
