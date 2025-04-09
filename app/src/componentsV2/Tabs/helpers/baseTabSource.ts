import React from "react";
import { AbstractTabSource } from "./tabSource";
import { TabSourceMetadata } from "../types";

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
}
