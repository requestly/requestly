import React from "react";

export type FilterType = "all" | "pinned" | "active" | string;

export type Filter = {
  key: FilterType;
  label: React.ReactNode;
  onClick: () => void;
};
