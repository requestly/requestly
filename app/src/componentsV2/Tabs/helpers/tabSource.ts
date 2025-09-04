import React from "react";
import { TabSourceMetadata } from "../types";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";

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
  abstract getIsValidTab(): boolean;
  abstract getTabContext(): ApiClientFeatureContext;
}
