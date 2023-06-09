import React from "react";

export interface PrimarySidebarItem extends Record<string, unknown> {
  id?: number | string;
  path: string;
  title: React.ReactNode;
  icon: React.ReactNode;
  display?: boolean;
}
