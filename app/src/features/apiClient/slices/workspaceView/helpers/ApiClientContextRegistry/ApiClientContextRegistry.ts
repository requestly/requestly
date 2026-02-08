import { NativeError } from "errors/NativeError";
import { ApiClientFeatureContext } from "./types";

type ContextVersion = number & { readonly __tag: unique symbol };

export class InvalidContextVersionError extends NativeError {
  constructor() {
    super("Invalid context version");
  }
}

export class ApiClientContextRegistry {
  private contexts: Map<ApiClientFeatureContext["workspaceId"], ApiClientFeatureContext>;
  private lastUsedContext?: ApiClientFeatureContext;
  /**
   * Context version for tracking stale context updates
   */
  private version: ContextVersion = 0 as ContextVersion;

  constructor() {
    this.contexts = new Map();
  }

  getVersion() {
    return this.version;
  }

  private incrementVersion() {
    this.version++;
  }

  addContext(context: ApiClientFeatureContext, newVersion: ContextVersion) {
    if (this.version > newVersion) {
      throw new InvalidContextVersionError().addContext({ oldVersion: this.version, newVersion });
    }

    this.contexts.set(context.workspaceId, context);
    this.lastUsedContext = context;
    this.incrementVersion();
  }

  removeContext(id: ApiClientFeatureContext["workspaceId"]) {
    const context = this.contexts.get(id);
    if (!context) return;

    this.contexts.delete(id);
    this.incrementVersion();

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
    this.incrementVersion();
  }

  hasContext(id: ApiClientFeatureContext["workspaceId"]) {
    return this.contexts.has(id);
  }

  getAllContexts(): ApiClientFeatureContext[] {
    return Array.from(this.contexts.values());
  }
}

export const apiClientContextRegistry = new ApiClientContextRegistry();
