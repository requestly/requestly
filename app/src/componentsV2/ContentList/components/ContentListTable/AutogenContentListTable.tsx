import { ReactElement } from "react";
import type { ColumnsType } from "antd/es/table";
import { Table, TableProps } from "antd";
import "./contentListTable.scss";

export interface ContentListTableProps<DataType> extends TableProps<DataType> {
  id: string;
  columns: ColumnsType<DataType>;
  data: DataType[];
  rowKey?: string; // Primary Key of the Table Row Data. Use for selection of row. Defaults to 'key'
  customRowClassName?: (record: DataType) => string;
  locale: TableProps<DataType>["locale"];
  showHeader?: boolean;
  bordered?: boolean;
}

const AutogenContentListTable = <DataType extends { [key: string]: any }>({
  id,
  columns,
  data,
  rowKey = "key",
  locale,
  className = "",
  bordered = false,
  showHeader = true,
}: ContentListTableProps<DataType>): ReactElement => {
  return (
    <div className="rq-content-list-table-container">
      <Table
        id={id}
        className={`rq-content-list-table ${className}`}
        rowKey={rowKey}
        columns={columns}
        dataSource={data}
        pagination={false} // Disable pagination for simplicity
        locale={locale}
        bordered={bordered}
        showHeader={showHeader}
      />
    </div>
  );
};

export default AutogenContentListTable;
