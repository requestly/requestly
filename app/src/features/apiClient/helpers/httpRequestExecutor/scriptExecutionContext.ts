import { getScopedVariables, Scope, ScopedVariables } from "../variableResolver/variable-resolver";
import { EnvironmentVariables, VariableScope } from "backend/environment/types";
import { RQAPI } from "features/apiClient/types";
import { isEmpty } from "lodash";
import { ApiClientFeatureContext } from "features/apiClient/slices";
import { reduxStore } from "store";
import { VariableData } from "@requestly/shared/types/entities/apiClient";

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
  private context: ExecutionContext = {} as any;
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
        const builtContext = this.buildExecutionContext();
        Object.assign(this.context, builtContext);
      }
    } else {
      this.context = this.buildExecutionContext();
    }

    this.context.request = entry.request;
    this.context.response = entry.response ?? null;

    const variablesByScope = this.convertScopedVariablesToRecord(this.getScopedVariables(recordId));

    // Override iterationData with scopedVariables
    // Currently only overriding iterationData because all other scopes are handled during initial context build from context but
    // iterationData needs to be updated from scope
    this.context.iterationData = (variablesByScope[VariableScope.DATA_FILE] || {}) as EnvironmentVariables;

    this.isMutated = false;
  }

  private getScopedVariables(recordId: string) {
    return getScopedVariables(this.ctx.store.getState(), reduxStore.getState().runtimeVariables.entity.variables, recordId, {scopes: this.scopes});

  }

  private convertScopedVariablesToRecord(scopedVariables: ScopedVariables) {
    return Object.keys(scopedVariables).reduce((acc, key) => {
      const [variableData, variableSource] = scopedVariables[key]!;
      acc[variableSource.scope] = acc[variableSource.scope] || {};
      acc[variableSource.scope]![key] = variableData;
      return acc;
    }, {} as Record<string, Record<string, VariableData>>);
  }

  private getVariablesByScope(recordId: string) {
    return this.convertScopedVariablesToRecord(this.getScopedVariables(recordId));
  }

  private buildExecutionContext(): ExecutionContext {
    const variablesByScope = this.getVariablesByScope(this.recordId);
    const globalVariables = (variablesByScope[VariableScope.GLOBAL] || {}) as EnvironmentVariables;
    const collectionVariables = (variablesByScope[VariableScope.COLLECTION] || {}) as EnvironmentVariables;
    const environmentVariables = (variablesByScope[VariableScope.ENVIRONMENT] || {}) as EnvironmentVariables;
    const variables = (variablesByScope[VariableScope.RUNTIME] || {}) as EnvironmentVariables;
    const iterationData = (variablesByScope[VariableScope.DATA_FILE] || {}) as EnvironmentVariables;

    const baseExecutionContext: BaseExecutionContext = {
      global: globalVariables,
      collectionVariables,
      environment: environmentVariables,
      variables,
      iterationData,
    };

    return {
      ...baseExecutionContext,
      request: this.entry.request,
      response: this.entry.response,
    };
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
