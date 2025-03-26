import React from "react";
import PATHS from "config/constants/sub/paths";
import { ApiClientEmptyView } from "features/apiClient/screens/apiClient/components/clientView/components/ApiClientEmptyView/ApiClientEmptyView";

export abstract class AbstractTabSource {
  abstract component: NonNullable<React.ReactNode>;
  abstract metadata: Record<string, any>;
  abstract urlPath: string;

  abstract getSourceId(): string; // Identifier of the entity
  abstract getSourceName(): string;
  abstract render(): React.ReactNode;
  abstract getDefaultTitle(): string;
  abstract getUrlPath(): string;
  abstract setUrlPath(path: string): void;
  abstract updateUrl(): void;
}

const updateUrlPath = (path: string) => {
  window.history.pushState({}, "", path);
};

// NOTE: JUST FOR TESTING PURPOSE, REMOVE AFTER VIEWS ARE MERGED
export class ApiClientEmptyViewSource extends AbstractTabSource {
  component: NonNullable<React.ReactNode>;
  metadata: Record<string, any>;
  urlPath = `${PATHS.API_CLIENT.ABSOLUTE}/request/new`;

  constructor(metadata: Record<string, any>) {
    super();
    this.component = <ApiClientEmptyView />;
    this.metadata = {
      id: metadata.id,
      name: "New Request",
      title: metadata.title,
    };
  }

  static create(metadata: Record<string, any>): ApiClientEmptyViewSource {
    return new ApiClientEmptyViewSource(metadata);
  }

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

  setUrlPath(path: string) {
    this.urlPath = path;
  }

  updateUrl() {
    updateUrlPath(this.urlPath);
  }
}
