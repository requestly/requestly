import React from "react";

export abstract class AbstractTabSource {
  abstract component: NonNullable<React.ReactNode>;
  abstract metadata: Record<string, any>;

  abstract getId(): string;
  abstract render(): React.ReactNode;
  abstract getTitle(): string;
}
