import { ReactNode } from "react";

interface BulkActionBarAction {
  text: ReactNode | ((selectedRows: any) => ReactNode);
  onClick: (selectedRows: any) => void;
}

// FIXME: Improve
export interface BulkActionBarConfig {
  type: "default" | "custom";
  options: {
    infoText?: ReactNode | ((selectedRows: any) => ReactNode);
    actions?: BulkActionBarAction[];
  };
  // component?: ReactNode; // custom
}

export interface FilterOption {
  text: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  // options: FilterOption[]; TODO: For further filtering
  onFilter: (value: any, data: any) => boolean;
}

export interface FilterHeaderConfig {
  search: boolean;
  quickFilters: string[]; // array of filter.key
  filters: FilterConfig[];
}
