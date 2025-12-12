import { NativeError } from "errors/NativeError";
import { ApiClientFeatureContext, WorkspaceId } from "./types";

export class ApiClientContextRegistry {
  private contexts: Map<WorkspaceId, ApiClientFeatureContext>;
  private lastUsedContext?: ApiClientFeatureContext;

  constructor() {
    this.contexts = new Map();
  }

  addContext(context: ApiClientFeatureContext) {
    this.contexts.set(context.workspaceId, context);
    this.lastUsedContext = context;
  }

  removeContext(id: WorkspaceId) {
    const context = this.contexts.get(id);
    if (!context) return;

    this.contexts.delete(id);

    if (this.lastUsedContext?.workspaceId === id) {
      this.lastUsedContext = undefined;
    }
  }

  setLastUsedContext(context?: ApiClientFeatureContext) {
    this.lastUsedContext = context;
  }

  getContext(id: WorkspaceId) {
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

  hasContext(id: WorkspaceId) {
    return this.contexts.has(id);
  }

  getAllContexts(): ApiClientFeatureContext[] {
    return Array.from(this.contexts.values());
  }
}

export const apiClientContextRegistry = new ApiClientContextRegistry();
