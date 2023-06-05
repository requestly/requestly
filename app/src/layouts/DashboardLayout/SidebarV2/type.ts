import React from "react";

export type PrimarySidebarItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  display?: boolean;
};
