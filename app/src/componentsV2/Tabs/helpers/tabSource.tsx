import { CollectionView } from "features/apiClient/screens/apiClient/components/clientView/components/Collection/CollectionView";
import React from "react";

export abstract class AbstractTabSource {
  abstract component: NonNullable<React.ReactNode>;
  abstract metadata: Record<string, any>;

  abstract getSourceId(): string; // Identifier of the entity
  abstract getSourceName(): string;
  abstract render(): React.ReactNode;
  abstract getDefaultTitle(): string;
}

export class CollectionSourceView extends AbstractTabSource {
  component: NonNullable<React.ReactNode>;
  metadata: Record<string, any>;

  constructor(metadata: Record<string, any>) {
    super();
    this.component = <CollectionView collectionId={metadata.id} />;
    this.metadata = {
      id: metadata.id,
      name: this.constructor.name,
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
}
