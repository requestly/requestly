import React from "react";
import type { BaseButtonProps } from "antd/lib/button/button";
interface BulkActionBarAction<DataType> extends BaseButtonProps {
  onClick: (selectedRows: DataType[], clearSelection: () => void) => void;
  label: React.ReactNode | ((selectedRows: any) => string);
  isActionHidden?: (selectedRows: DataType[]) => boolean; // ability to hide action button based on selected rows
}

export interface BulkActionBarConfig<DataType> {
  type: "default" | "custom";
  options: {
    clearSelectedRows?: () => void;
    infoText?: string | ((selectedRows: DataType[]) => string);
    actions?: BulkActionBarAction<DataType>[];
  };
  // component?: ReactNode; // Future improvement: add custom component
}
