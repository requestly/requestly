import { ContentListTable } from "componentsV2/ContentList";
import { useSessionsTableColumns } from "./hooks/useSessionsTableColumns";
import { Empty } from "antd";
import { useSelector } from "react-redux";
import { getIsAppBannerVisible } from "store/selectors";
import React from "react";

interface SessionsTableProps {
  sessions: any[];
}

export const SessionsTable: React.FC<SessionsTableProps> = ({ sessions }) => {
  const columns = useSessionsTableColumns();
  const isAppBannerVisible = useSelector(getIsAppBannerVisible);

  return (
    <div className="sharedlists-table-container">
      <ContentListTable
        id="sharedlists-table"
        size="small"
        columns={columns}
        data={sessions}
        locale={{
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Shared list found" />,
        }}
        scroll={isAppBannerVisible ? { y: "calc(100vh - 232px - 48px)" } : undefined}
        // 232px is the height of the content header + top header + footer, 48px is the height of the app banner
      />
    </div>
  );
};
