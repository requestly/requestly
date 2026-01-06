import { NativeError } from "errors/NativeError";
import { ApiClientFeatureContext } from "./types";

export class ApiClientContextRegistry {
  private contexts: Map<ApiClientFeatureContext["workspaceId"], ApiClientFeatureContext>;
  private lastUsedContext?: ApiClientFeatureContext;

  constructor() {
    this.contexts = new Map();
  }

  addContext(context: ApiClientFeatureContext) {
    this.contexts.set(context.workspaceId, context);
    this.lastUsedContext = context;
  }

  removeContext(id: ApiClientFeatureContext["workspaceId"]) {
    const context = this.contexts.get(id);
    if (!context) return;

    this.contexts.delete(id);

    if (this.lastUsedContext?.workspaceId === id) {
      this.lastUsedContext = undefined;
    }
  }

  setLastUsedContext(id: ApiClientFeatureContext["workspaceId"]) {
    const context = this.contexts.get(id);

    if (!context) {
      throw new NativeError("Could not find context!").addContext({ id });
    }

    this.lastUsedContext = context;
  }

  getContext(id: ApiClientFeatureContext["workspaceId"]) {
    return this.contexts.get(id);
  }

  getSingleViewContext() {
    if (this.contexts.size !== 1) {
      throw new NativeError("Context does not exist in single mode");
    }

    return this.contexts.values().next().value as ApiClientFeatureContext;
  }

  getLastUsedContext() {
    if (this.lastUsedContext) {
      return this.lastUsedContext;
    }

    if (this.contexts.size) {
      const topContext = this.contexts.values().next().value as ApiClientFeatureContext;
      this.lastUsedContext = topContext;
      return topContext;
    }
  }

  clearAll() {
    this.contexts.clear();
    this.lastUsedContext = undefined;
  }

  hasContext(id: ApiClientFeatureContext["workspaceId"]) {
    return this.contexts.has(id);
  }

  getAllContexts(): ApiClientFeatureContext[] {
    return Array.from(this.contexts.values());
  }
}

export const apiClientContextRegistry = new ApiClientContextRegistry();
