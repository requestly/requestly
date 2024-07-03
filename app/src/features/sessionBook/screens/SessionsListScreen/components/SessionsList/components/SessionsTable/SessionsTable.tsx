import React from "react";
import { useSelector } from "react-redux";
import { Empty } from "antd";
import { ContentListTable } from "componentsV2/ContentList";
import { useSessionsTableColumns } from "./hooks/useSessionsTableColumns";
import { getIsAppBannerVisible } from "store/selectors";
import "./sessionsTable.scss";

interface SessionsTableProps {
  sessions: any[];
}

export const SessionsTable: React.FC<SessionsTableProps> = ({ sessions }) => {
  const columns = useSessionsTableColumns();
  const isAppBannerVisible = useSelector(getIsAppBannerVisible);

  return (
    <div className="sessions-table-container">
      <ContentListTable
        id="sessions-table"
        size="small"
        columns={columns}
        data={sessions}
        locale={{
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Session found" />,
        }}
        scroll={isAppBannerVisible ? { y: "calc(100vh - 232px - 48px)" } : undefined}
        // 232px is the height of the content header + top header + footer, 48px is the height of the app banner
      />
    </div>
  );
};
