import React from "react";

export abstract class AbstractTabSource {
  abstract component: NonNullable<React.ReactNode>;
  abstract metadata: Record<string, any>;

  abstract getId(): string; // Identifier of the entity
  abstract render(): React.ReactNode;
  abstract getDefaultTitle(): string;
}
