import React from "react";
import type { BaseButtonProps } from "antd/lib/button/button";

interface BulkActionBarActionButton<DataType> extends BaseButtonProps {
  onClick: (selectedRows: DataType[]) => void;
  label: React.ReactNode | ((selectedRows: any) => string);
  hidden?: boolean | ((selectedRows: DataType[]) => boolean); // ability to hide action button based on selected rows
}

export interface BulkActionBarConfig<DataType> {
  options: {
    infoText?: string | ((selectedRows: DataType[]) => string);
    actionButtons?: BulkActionBarActionButton<DataType>[];
  };
}
