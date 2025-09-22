import { getApiClientRecordsStore } from "../../commands/store.utils";
import { ApiClientFeatureContext } from "../../store/apiClientFeatureContext/apiClientFeatureContext.store";
import { RQAPI } from "../../types";
import { BaseSnapshot, SnapshotForPostResponse, SnapshotForPreRequest } from "./snapshotTypes";
import { APIClientWorkloadManager } from "../modules/scriptsV2/workloadManager/APIClientWorkloadManager";
import {
  PostResponseScriptWorkload,
  PreRequestScriptWorkload,
} from "../modules/scriptsV2/workload-manager/workLoadTypes";
import { getScopedVariables } from "../variableResolver/variable-resolver";
import { VariableData } from "features/apiClient/store/variables/types";
import { EnvironmentVariables, VariableScope } from "backend/environment/types";

export class HttpRequestScriptExecutionService {
  constructor(private ctx: ApiClientFeatureContext, private workloadManager: APIClientWorkloadManager) {}

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

  private buildBaseSnapshot(recordId: string): BaseSnapshot {
    const varibalesByScope = this.getVariablesByScope(recordId);
    const globalVariables = (varibalesByScope[VariableScope.GLOBAL] || {}) as EnvironmentVariables;
    const collectionVariables = (varibalesByScope[VariableScope.COLLECTION] || {}) as EnvironmentVariables;
    const environmentVariables = (varibalesByScope[VariableScope.ENVIRONMENT] || {}) as EnvironmentVariables;
    const variables = varibalesByScope[VariableScope.RUNTIME] || {};

    return {
      global: globalVariables,
      collectionVariables,
      environment: environmentVariables,
      variables,
    };
  }

  private buildPreRequestSnapshot(recordId: string, entry: RQAPI.HttpApiEntry): SnapshotForPreRequest {
    return {
      ...this.buildBaseSnapshot(recordId),
      request: entry.request,
    };
  }

  private buildPostResponseSnapshot(recordId: string, entry: RQAPI.HttpApiEntry): SnapshotForPostResponse {
    const response = entry.response;
    if (!response) {
      throw new Error("Can not build post response snapshot without response!");
    }
    return {
      ...this.buildBaseSnapshot(recordId),
      request: entry.request,
      response,
    };
  }

  async executePreRequestScript(
    recordId: string,
    entry: RQAPI.HttpApiEntry,
    callback: (state: any) => Promise<void>,
    abortController: AbortController
  ) {
    return this.workloadManager.execute(
      new PreRequestScriptWorkload(entry.scripts?.preRequest, this.buildPreRequestSnapshot(recordId, entry), callback),
      abortController.signal
    );
  }

  async executePostResponseScript(
    recordId: string,
    entry: RQAPI.HttpApiEntry,
    callback: (state: any) => Promise<void>,
    abortController: AbortController
  ) {
    return this.workloadManager.execute(
      new PostResponseScriptWorkload(
        entry.scripts?.postResponse,
        this.buildPostResponseSnapshot(recordId, entry),
        callback
      ),
      abortController.signal
    );
  }
}
