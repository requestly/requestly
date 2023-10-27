interface BulkActionBarAction {
  text: string | ((selectedRows: any) => string);
  onClick: (selectedRows: any) => void;
}

export interface BulkActionBarConfig {
  type: "default" | "custom";
  options: {
    infoText?: string | ((selectedRows: any) => string);
    actions?: BulkActionBarAction[];
  };
  // component?: ReactNode; // Future improvement: add custom component
}
