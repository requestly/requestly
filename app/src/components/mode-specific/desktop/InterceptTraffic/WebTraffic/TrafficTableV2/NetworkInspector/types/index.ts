export interface TableColumn {
  id: string;
  title: string;
  dataIndex: string | string[];
  width?: string | number;
  render?: Function;
}
