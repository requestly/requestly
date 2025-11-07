import { getApiClientRecordsStore } from "features/apiClient/commands/store.utils";
import { BaseSnapshot, SnapshotForPostResponse, SnapshotForPreRequest } from "./snapshotTypes";
import { getScopedVariables, Scope } from "../variableResolver/variable-resolver";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { VariableData } from "features/apiClient/store/variables/types";
import { EnvironmentVariables, VariableScope } from "backend/environment/types";
import { RQAPI } from "features/apiClient/types";

export type ExecutionContext = BaseSnapshot & {
  request: SnapshotForPreRequest["request"];
  response: SnapshotForPostResponse["response"];
};

export class ScriptExecutionContext {
  private context: ExecutionContext;
  private isMutated = false;

  constructor(
    private readonly ctx: ApiClientFeatureContext,
    private readonly recordId: string,
    private readonly entry: RQAPI.HttpApiEntry,
    private readonly scopes: Scope[] = []
  ) {
    this.initializeContext();
  }

  private getVariablesByScope(recordId: string) {
    const parents = getApiClientRecordsStore(this.ctx).getState().getParentChain(recordId);
    const scopedVariables = getScopedVariables(parents, this.ctx.stores, this.scopes);

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

  private buildExecutionContext(): ExecutionContext {
    const variablesByScope = this.getVariablesByScope(this.recordId);
    const globalVariables = (variablesByScope[VariableScope.GLOBAL] || {}) as EnvironmentVariables;
    const collectionVariables = (variablesByScope[VariableScope.COLLECTION] || {}) as EnvironmentVariables;
    const environmentVariables = (variablesByScope[VariableScope.ENVIRONMENT] || {}) as EnvironmentVariables;
    const variables = variablesByScope[VariableScope.RUNTIME] || {};
    const iterationData = (variablesByScope[VariableScope.DATA_FILE] || {}) as EnvironmentVariables;

    console.log("!!!debug", "buildExecutionContext", { iterationData, variablesByScope });

    const baseSnapshot: BaseSnapshot = {
      global: globalVariables,
      collectionVariables,
      environment: environmentVariables,
      variables,
      iterationData,
    };

    return {
      ...baseSnapshot,
      request: this.entry.request,
      response: this.entry.response,
    };
  }

  private initializeContext() {
    this.context = this.buildExecutionContext();
    this.isMutated = false;
  }

  public updateContext(snapshot: ExecutionContext) {
    this.context.global = snapshot.global;
    this.context.collectionVariables = snapshot.collectionVariables;
    this.context.environment = snapshot.environment;
    this.context.variables = snapshot.variables;

    this.context.request = snapshot.request;
    if (snapshot.response) {
      this.context.response = snapshot.response;
    } else {
      this.context.response = null;
    }

    this.isMutated = true;
  }

  public getContext(): ExecutionContext {
    return this.context;
  }

  public getIsMutated(): boolean {
    return this.isMutated;
  }

  public resetIsMutated() {
    this.isMutated = false;
  }

  public setResponse(response: SnapshotForPostResponse["response"]) {
    this.context.response = response;
  }
}
