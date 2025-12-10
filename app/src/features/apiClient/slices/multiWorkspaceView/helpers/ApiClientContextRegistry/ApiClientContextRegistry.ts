import { NativeError } from "errors/NativeError";
import { ApiClientContext, ContextId } from "./types";

class ApiClientContextRegistry {
  private contexts: Map<ContextId, ApiClientContext>;
  private lastUsedContext?: ApiClientContext;

  constructor() {
    this.contexts = new Map();
  }

  addContext(context: ApiClientContext) {
    this.contexts.set(context.id, context);
    this.lastUsedContext = context;
  }

  removeContext(id: ContextId) {
    const context = this.contexts.get(id);
    if (!context) return;

    this.contexts.delete(id);

    if (this.lastUsedContext?.id === id) {
      this.lastUsedContext = undefined;
    }
  }

  setLastUsedContext(context?: ApiClientContext) {
    this.lastUsedContext = context;
  }

  getContext(id: ContextId) {
    return this.contexts.get(id);
  }

  getSingleViewContext() {
    if (this.contexts.size !== 1) {
      throw new NativeError("Context does not exist in single mode");
    }

    return this.contexts.values().next().value as ApiClientContext;
  }

  getLastUsedContext() {
    if (this.lastUsedContext) {
      return this.lastUsedContext;
    }

    if (this.contexts.size) {
      const topContext = this.contexts.values().next().value as ApiClientContext;
      this.lastUsedContext = topContext;
      return topContext;
    }
  }

  clearAll() {
    this.contexts.clear();
    this.lastUsedContext = undefined;
  }

  hasContext(id: ContextId) {
    return this.contexts.has(id);
  }
}

export const apiClientContextRegistry = new ApiClientContextRegistry();
