import PATHS from "config/constants/sub/paths";
import { DraftRequestContainer } from "features/apiClient/screens/apiClient/components/clientView/components/DraftRequestContainer";
import React from "react";
import { updateUrlPath } from "../utils";

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

export class DraftRequestContainerSource extends AbstractTabSource {
  component: NonNullable<React.ReactNode>;
  metadata: Record<string, any>;
  urlPath = `${PATHS.API_CLIENT.ABSOLUTE}/request/new`;

  constructor(metadata: Record<string, any>) {
    super();
    this.component = <DraftRequestContainer />;
    this.metadata = {
      id: metadata.id,
      name: "Neww Request",
      title: metadata.title,
    };
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
