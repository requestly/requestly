import React from "react";

export abstract class AbstractTabSource {
  abstract component: NonNullable<React.ReactNode>;
  abstract metadata: Record<string, any>;
  abstract urlPath: string;

  abstract getSourceId(): string; // Identifier of the entity
  abstract getSourceName(): string;
  abstract render(): React.ReactNode;
  abstract getDefaultTitle(): string;
  abstract getUrlPath(): string;
}
