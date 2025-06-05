import React from "react";
import { TabSourceMetadata } from "../types";

export abstract class AbstractTabSource {
  abstract component: NonNullable<React.ReactNode>;
  abstract metadata: TabSourceMetadata;
  abstract urlPath: string;
  abstract type: string;
  abstract icon: React.ReactNode;

  abstract getSourceId(): string; // Identifier of the entity
  abstract getSourceName(): string;
  abstract render(): React.ReactNode;
  abstract getDefaultTitle(): string;
  abstract getUrlPath(): string;
  abstract getIcon(): React.ReactNode;
  abstract getIsNewTab(): boolean;
}
