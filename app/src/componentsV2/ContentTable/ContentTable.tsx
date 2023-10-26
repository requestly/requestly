import { ReactElement, useEffect, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { Table } from "antd";
import { BulkActionBarConfig, FilterConfig, FilterHeaderConfig } from "./types";
import BulkActionBar from "./components/BulkActionBar/BulkActionBar";
import FilterHeader from "./components/FilterHeader/FilterHeader";

export interface ContentTableProps<DataType> {
  columns: ColumnsType<DataType>;
  data: DataType[];
  bulkActionBarConfig?: BulkActionBarConfig;
  filterHeaderConfig?: FilterHeaderConfig
}

// Contains common design and colors for app
const ContentTable = <DataType,>({ columns, data, bulkActionBarConfig, filterHeaderConfig }: ContentTableProps<DataType>): ReactElement => {
  // Fetch ContentTableProps
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRowsData, setSelectedRowsData] = useState<DataType[]>([]);
  
  const [filters, setFilters] = useState<{[key:string]: any[]}>({})

  const [filteredRowsData, setFilteredRowsData] = useState(data);

  // useEffect(() => {
  //   // Search Filter
  //   let finalRowsData = data;

  //   filterHeaderConfig?.filters.forEach((filterConfig) => {
  //     console.log(filters[filterConfig.key]);
  //     if (filters[filterConfig.key]) {
  //       finalRowsData = finalRowsData.filter((row) => filterConfig.onFilter(filters[filterConfig.key] || "", row))
  //     }
  //   })

  //   setFilteredRowsData([...finalRowsData]);
  // }, [filters, data, filterHeaderConfig])

  return (
    <>
      {bulkActionBarConfig && <BulkActionBar config={bulkActionBarConfig} selectedRows={selectedRowsData} />}
      {/* TODO */}
      {/* <FilterHeader config={filterHeaderConfig} filters={filters} setFilters={setFilters} /> */}
      <Table
        // @ts-ignore
        columns={columns}
        // @ts-ignore
        dataSource={filteredRowsData}
        pagination={false}
        rowSelection={{
          selectedRowKeys,
          onChange: (selectedRowKeys, selectedRows) => {
            console.log({selectedRowKeys});
            setSelectedRowKeys(selectedRowKeys);
            // @ts-ignore
            setSelectedRowsData(selectedRows);
          },
        }}
      />
    </>
  );
};

export default ContentTable;
