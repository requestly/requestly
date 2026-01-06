import { getApiClientRecordsStore } from "features/apiClient/commands/store.utils";
import { getScopedVariables, Scope, ScopedVariables } from "../variableResolver/variable-resolver";
// import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { VariableData } from "features/apiClient/store/variables/types";
import { EnvironmentVariables, VariableScope } from "backend/environment/types";
import { RQAPI } from "features/apiClient/types";
import { isEmpty } from "lodash";
import { ApiClientFeatureContext } from "features/apiClient/slices";
import { reduxStore } from "store";

export type BaseExecutionContext = {
  global: EnvironmentVariables;
  collectionVariables: EnvironmentVariables;
  environment: EnvironmentVariables;
  variables: EnvironmentVariables;
  iterationData: EnvironmentVariables;
};

export type ExecutionContext = BaseExecutionContext & {
  request: RQAPI.Request;
  response: RQAPI.Response;
};

export class ScriptExecutionContext {
  private context: ExecutionContext;
  private isMutated = false;

  constructor(
    private readonly ctx: ApiClientFeatureContext,
    private readonly recordId: string,
    private readonly entry: RQAPI.HttpApiEntry,
    private readonly scopes: Scope[] = [],
    initialExecutionContext?: ExecutionContext
  ) {
    // If initialExecutionContext is provided, use it and mutate it in place
    // Otherwise, build a new context
    if (initialExecutionContext) {
      this.context = initialExecutionContext;
      // Fill in the initial context if it's empty
      if (isEmpty(initialExecutionContext)) {
        // const builtContext = this.buildExecutionContext();
        // Object.assign(this.context, builtContext);
      }
    } else {
      // this.context = this.buildExecutionContext();
    }

    this.context.request = entry.request;
    this.context.response = entry.response ?? null;

    const scopedVariables = getScopedVariables(this.ctx.store.getState(), reduxStore.getState().runtimeVariables.entity.variables, recordId, {scopes: this.scopes});
    // const scopedVariables = getScopedVariables([], this.ctx.stores, this.scopes);
    const variablesByScope = this.convertScopedVariablesToRecord(scopedVariables);

    // Override iterationData with scopedVariables
    // Currently only overriding iterationData because all other scopes are handled during initial context build from context but
    // iterationData needs to be updated from scope
    // this.context.iterationData = (variablesByScope[VariableScope.DATA_FILE] || {}) as EnvironmentVariables;

    this.isMutated = false;
  }

  private convertScopedVariablesToRecord(scopedVariables: ScopedVariables) {
    // return Array.from(scopedVariables).reduce((acc, [key, [variableData, variableSource]]) => {
    //   acc[variableSource.scope] = acc[variableSource.scope] || {};
    //   acc[variableSource.scope][key] = variableData;
    //   return acc;
    // }, {} as Record<string, Record<string, VariableData>>);
  }

  private getVariablesByScope(recordId: string) {
    // const parents = getApiClientRecordsStore(this.ctx).getState().getParentChain(recordId);
    // const scopedVariables = getScopedVariables(parents, this.ctx.stores, this.scopes);
    // return this.convertScopedVariablesToRecord(scopedVariables);
  }

  private buildExecutionContext(): ExecutionContext {
    throw new Error('aaa');
    // const variablesByScope = this.getVariablesByScope(this.recordId);
    // const globalVariables = (variablesByScope[VariableScope.GLOBAL] || {}) as EnvironmentVariables;
    // const collectionVariables = (variablesByScope[VariableScope.COLLECTION] || {}) as EnvironmentVariables;
    // const environmentVariables = (variablesByScope[VariableScope.ENVIRONMENT] || {}) as EnvironmentVariables;
    // const variables = variablesByScope[VariableScope.RUNTIME] || {};
    // const iterationData = (variablesByScope[VariableScope.DATA_FILE] || {}) as EnvironmentVariables;

    // const baseExecutionContext: BaseExecutionContext = {
    //   global: globalVariables,
    //   collectionVariables,
    //   environment: environmentVariables,
    //   variables,
    //   iterationData,
    // };

    // return {
    //   ...baseExecutionContext,
    //   request: this.entry.request,
    //   response: this.entry.response,
    // };
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

  public getBaseContext(): BaseExecutionContext {
    return {
      global: this.context.global,
      collectionVariables: this.context.collectionVariables,
      environment: this.context.environment,
      variables: this.context.variables,
      iterationData: this.context.iterationData,
    };
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

  public setResponse(response: ExecutionContext["response"]) {
    this.context.response = response;
  }

  public setRequest(request: ExecutionContext["request"]) {
    this.context.request = request;
  }
}
