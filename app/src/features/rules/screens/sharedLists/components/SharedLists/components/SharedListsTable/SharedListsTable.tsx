import React, { useMemo } from "react";
import { Empty } from "antd";
import { ContentListTable } from "componentsV2/ContentList";
import { useSharedListsTableColumns } from "./hooks/useSharedListsTableColumns";
import { SharedList } from "../../types";
import "./sharedListsTable.scss";

interface SharedListsTableProps {
  sharedLists: SharedList[];
  searchValue: string;
}

export const SharedListsTable: React.FC<SharedListsTableProps> = ({ sharedLists, searchValue }) => {
  const tableColumns = useSharedListsTableColumns();

  const filteredSharedLists = useMemo(() => {
    return sharedLists.filter((sharedList) => sharedList.listName.toLowerCase().includes(searchValue.toLowerCase()));
  }, [sharedLists, searchValue]);

  return (
    <div className="sharedlists-table-container">
      <ContentListTable
        id="sharedlists-table"
        size="small"
        columns={tableColumns}
        data={filteredSharedLists}
        locale={{
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Templates found" />,
        }}
        scroll={{ y: `calc(100vh - 232px)` }}
      />
    </div>
  );
};
