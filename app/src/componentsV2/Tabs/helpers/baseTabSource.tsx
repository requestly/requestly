import React from "react";
import { AbstractTabSource } from "./tabSource";
import { TabSourceMetadata } from "../types";
import { NativeError } from "errors/NativeError";
import { WorkspaceProvider } from "features/apiClient/common/WorkspaceProvider";

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
    const workspaceId = this.metadata.context?.id;

    if (workspaceId === undefined) {
      return this.component;
    }

    return <WorkspaceProvider children={this.component} workspaceId={workspaceId} />;
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
