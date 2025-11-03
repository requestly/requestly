import { getApiClientRecordsStore } from "../../commands/store.utils";
import { ApiClientFeatureContext } from "../../store/apiClientFeatureContext/apiClientFeatureContext.store";
import { RQAPI } from "../../types";
import { BaseSnapshot, SnapshotForPostResponse, SnapshotForPreRequest } from "./snapshotTypes";
import { APIClientWorkloadManager } from "../modules/scriptsV2/workloadManager/APIClientWorkloadManager";
import { getScopedVariables } from "../variableResolver/variable-resolver";
import { VariableData } from "features/apiClient/store/variables/types";
import { EnvironmentVariables, VariableScope } from "backend/environment/types";
import {
  PostResponseScriptWorkload,
  PreRequestScriptWorkload,
} from "../modules/scriptsV2/workloadManager/workLoadTypes";

export class HttpRequestScriptExecutionService {
  private snapshot: BaseSnapshot;
  constructor(private ctx: ApiClientFeatureContext, private workloadManager: APIClientWorkloadManager) {
    this.resetSnapshot();
  }

  private getVariablesByScope(recordId: string) {
    const parents = getApiClientRecordsStore(this.ctx).getState().getParentChain(recordId);
    const scopedVariables = getScopedVariables(parents, this.ctx.stores);

    const variablesByScope: Record<string, Record<string, VariableData>> = Array.from(scopedVariables).reduce(
      (acc, [key, [variableData, variableSource]]) => {
        acc[variableSource.scope] = acc[variableSource.scope] || {};
        acc[variableSource.scope][key] = variableData;
        return acc;
      },
      {} as Record<string, Record<string, VariableData>>
    );

    return variablesByScope;
  }

  private resetSnapshot() {
    this.snapshot = {
      global: {},
      collectionVariables: {},
      environment: {},
      variables: {},
    };
  }

  private setSnapshot(snapshot: BaseSnapshot) {
    this.snapshot.global = snapshot.global;
    this.snapshot.collectionVariables = snapshot.collectionVariables;
    this.snapshot.environment = snapshot.environment;
    this.snapshot.variables = snapshot.variables;
  }

  private buildPreRequestSnapshot(entry: RQAPI.HttpApiEntry): SnapshotForPreRequest {
    const snapshot = this.getSnapshot();

    return {
      ...snapshot,
      request: entry.request,
    };
  }

  private buildPostResponseSnapshot(entry: RQAPI.HttpApiEntry): SnapshotForPostResponse {
    const response = entry.response;
    if (!response) {
      throw new Error("Can not build post response snapshot without response!");
    }

    const snapshot = this.getSnapshot();
    return {
      ...snapshot,
      request: entry.request,
      response,
    };
  }

  public buildBaseSnapshot(recordId: string) {
    const varibalesByScope = this.getVariablesByScope(recordId);
    const globalVariables = (varibalesByScope[VariableScope.GLOBAL] || {}) as EnvironmentVariables;
    const collectionVariables = (varibalesByScope[VariableScope.COLLECTION] || {}) as EnvironmentVariables;
    const environmentVariables = (varibalesByScope[VariableScope.ENVIRONMENT] || {}) as EnvironmentVariables;
    const variables = varibalesByScope[VariableScope.RUNTIME] || {};

    const baseSnapshot: BaseSnapshot = {
      global: globalVariables,
      collectionVariables,
      environment: environmentVariables,
      variables,
    };

    this.setSnapshot(baseSnapshot);
  }

  getSnapshot(): BaseSnapshot {
    return this.snapshot;
  }

  async executePreRequestScript(entry: RQAPI.HttpApiEntry, abortController: AbortController) {
    return this.workloadManager.execute(
      new PreRequestScriptWorkload(
        entry.scripts?.preRequest,
        this.buildPreRequestSnapshot(entry),
        (snapshot: SnapshotForPreRequest) => {
          this.setSnapshot(snapshot);
        }
      ),
      abortController.signal
    );
  }

  async executePostResponseScript(entry: RQAPI.HttpApiEntry, abortController: AbortController) {
    return this.workloadManager.execute(
      new PostResponseScriptWorkload(
        entry.scripts?.postResponse,
        this.buildPostResponseSnapshot(entry),
        (snapshot: SnapshotForPostResponse) => {
          this.setSnapshot(snapshot);
        }
      ),
      abortController.signal
    );
  }
}
