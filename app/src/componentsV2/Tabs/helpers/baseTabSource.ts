import React from "react";
import { AbstractTabSource } from "./tabSource";

export class BaseTabSource implements AbstractTabSource {
  component: NonNullable<React.ReactNode>;
  metadata: Record<string, any>;
  urlPath: string;

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
}
