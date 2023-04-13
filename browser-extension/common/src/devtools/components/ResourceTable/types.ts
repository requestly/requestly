import { ReactNode } from "react";

export interface Column<ResourceType> {
  key: string;
  header: string;
  width?: number; // percentage
  render: (resource: ResourceType) => ReactNode;
}

export interface DetailsTab<ResourceType> {
  key: string;
  label: string;
  render: (resource: ResourceType) => ReactNode;
}
