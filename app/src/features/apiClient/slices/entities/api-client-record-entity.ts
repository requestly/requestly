import { RQAPI } from "features/apiClient/types";
import { ApiClientRootState } from "../hooks/types";
import { ApiClientEntity } from "./base";
import { EntityNotFound, UpdateCommand } from "../types";
import { ApiClientEntityType } from "./types";
import { apiRecordsActions, selectRecordById } from "../apiRecords";

export abstract class ApiClientRecordEntity<T extends RQAPI.ApiClientRecord> extends ApiClientEntity<T> {
  private base = new (
    class extends ApiClientEntity<RQAPI.ApiClientRecord> {
      getEntityFromState(state: ApiClientRootState): RQAPI.ApiClientRecord {

        const record = selectRecordById(state, this.meta.id);
        if (!record) {
          throw new EntityNotFound(this.id, this.type);
        }
        return record;
      }

      dispatchCommand(command: UpdateCommand<RQAPI.ApiClientRecord>): void {
        this.dispatch(apiRecordsActions.applyPatch({ id: this.meta.id, command }));
      }

      getName(s: ApiClientRootState) {
        return this.getEntityFromState(s).name;
      }

      type: ApiClientEntityType;
    }
  )(this.dispatch, this.meta);


  getName(state: ApiClientRootState): string {
    return this.getEntityFromState(state).name;
  }

  getDescription(state: ApiClientRootState): string | undefined {
    return this.getEntityFromState(state).description;
  }

  getCollectionId(state: ApiClientRootState): string | null | undefined {
    return this.getEntityFromState(state).collectionId;
  }

  getAuth(state: ApiClientRootState): RQAPI.Auth | undefined {
    return this.getEntityFromState(state).data?.auth;
  }

  getScripts(state: ApiClientRootState): { preRequest?: string; postResponse?: string } | undefined {
    return this.getEntityFromState(state).data?.scripts;
  }

  getPreRequestScript(state: ApiClientRootState): string | undefined {
    return this.getScripts(state)?.preRequest;
  }

  getPostResponseScript(state: ApiClientRootState): string | undefined {
    return this.getScripts(state)?.postResponse;
  }

  setName(name: string): void {
    this.base.SET({ name });
  }

  setDescription(description: string): void {
    this.base.SET({ description });
  }

  setCollectionId(collectionId: string | null): void {
    this.base.SET({ collectionId });
  }

  deleteName(): void {
    this.base.DELETE({ name: null });
  }

  deleteDescription(): void {
    this.base.DELETE({ description: null });
  }

  setAuth(auth: RQAPI.Auth): void {
    this.base.SET({ data: { auth } });
  }

  deleteAuth(): void {
    this.base.DELETE({ data: { auth: null } });
  }

  setScripts(scripts: { preRequest?: string; postResponse?: string }): void {
    this.base.SET({ data: { scripts } });
  }

  setPreRequestScript(script: string): void {
    this.base.SET({ data: { scripts: { preRequest: script } } });
  }

  setPostResponseScript(script: string): void {
    this.base.SET({ data: { scripts: { postResponse: script } } });
  }
}
