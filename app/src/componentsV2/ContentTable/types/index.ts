import React from "react";
import type { BaseButtonProps } from "antd/lib/button/button";
interface BulkActionBarAction {
  danger?: boolean;
  onClick: (selectedRows: any) => void;
  actionType?: BaseButtonProps["type"];
  label: React.ReactNode | ((selectedRows: any) => string);
}

export interface BulkActionBarConfig {
  type: "default" | "custom";
  options: {
    getSelectedRowsData?: (selectedRowsData: any) => void;
    infoText?: string | ((selectedRows: any) => string);
    actions?: BulkActionBarAction[];
  };
  // component?: ReactNode; // Future improvement: add custom component
}
