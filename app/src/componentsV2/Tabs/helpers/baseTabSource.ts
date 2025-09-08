import React from "react";
import { AbstractTabSource } from "./tabSource";
import { TabSourceMetadata } from "../types";
import { ContextId } from "features/apiClient/contexts/contextId.context";
import { NativeError } from "errors/NativeError";

export class BaseTabSource implements AbstractTabSource {
  component: NonNullable<React.ReactNode>;
  metadata: TabSourceMetadata;
  urlPath: string;
  icon: React.ReactNode;
  type = this.constructor.name;

  getSourceId(): string {
    return this.metadata.id;
  }

  getSourceName(): string {
    return this.metadata.name;
  }

  render(): React.ReactNode {
    const contextId = this.metadata.context?.id;
    if (contextId) {
      return ContextId({
        children: this.component,
        id: contextId,
      });
    }
    return this.component;
  }

  getDefaultTitle(): string {
    return this.metadata.title;
  }

  getUrlPath(): string {
    return this.urlPath;
  }

  getIcon(): React.ReactNode {
    return this.icon;
  }

  getIsNewTab(): boolean {
    return this.metadata.isNewTab ?? false;
  }

  getIsValidTab(ctx: unknown): boolean {
    throw new NativeError("getIsValidTab is not implemented!").addContext({
      ctx,
      metadata: this.metadata,
      sourceType: this.type,
    });
  }
}
