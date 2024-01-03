import React from "react";
import type { BaseButtonProps } from "antd/lib/button/button";
interface BulkActionBarAction extends BaseButtonProps {
  onClick: (selectedRows: any, clearSelection: () => void) => void;
  label: React.ReactNode | ((selectedRows: any) => string);
  isActionHidden?: (selectedRows: any) => boolean; // ability to hide action button based on selected rows
}

export interface BulkActionBarConfig {
  type: "default" | "custom";
  options: {
    clearSelectedRows?: () => void;
    infoText?: string | ((selectedRows: any) => string);
    actions?: BulkActionBarAction[];
  };
  // component?: ReactNode; // Future improvement: add custom component
}
