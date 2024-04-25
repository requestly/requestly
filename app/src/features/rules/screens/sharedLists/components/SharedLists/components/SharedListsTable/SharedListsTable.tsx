import React from "react";
import { SharedList } from "../../types";
import { ContentListTable } from "componentsV2/ContentList";
import { Empty } from "antd";
import "./sharedListsTable.scss";
import { useSharedListsTableColumns } from "./hooks/useSharedListsTableColumns";

interface SharedListsTableProps {
  sharedLists: SharedList[];
}

export const SharedListsTable: React.FC<SharedListsTableProps> = ({ sharedLists }) => {
  const tableColumns = useSharedListsTableColumns();

  return (
    <div className="sharedlists-table-container">
      <ContentListTable
        id="sharedlists-table"
        size="small"
        columns={tableColumns}
        data={sharedLists}
        locale={{
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Templates found" />,
        }}
        scroll={{ y: `calc(100vh - 232px)` }}
      />
    </div>
  );
};
