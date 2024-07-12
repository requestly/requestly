import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Empty } from "antd";
import { ContentListTable } from "componentsV2/ContentList";
import { useSessionsTableColumns } from "./hooks/useSessionsTableColumns";
import { getIsAppBannerVisible } from "store/selectors";
import ShareRecordingModal from "views/features/sessions/ShareRecordingModal";
import { SessionRecordingMetadata } from "features/sessionBook/types";
import "./sessionsTable.scss";

interface SessionsTableProps {
  sessions: SessionRecordingMetadata[];
  handleForceRender: () => void;
}

export const SessionsTable: React.FC<SessionsTableProps> = ({ sessions, handleForceRender }) => {
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [sharingRecordId, setSharingRecordId] = useState("");
  const [selectedRowVisibility, setSelectedRowVisibility] = useState("");

  const columns = useSessionsTableColumns({
    setIsShareModalVisible,
    setSharingRecordId,
    setSelectedRowVisibility,
    handleForceRender,
  });
  const isAppBannerVisible = useSelector(getIsAppBannerVisible);

  return (
    <>
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
      {isShareModalVisible ? (
        <ShareRecordingModal
          isVisible={isShareModalVisible}
          setVisible={setIsShareModalVisible}
          recordingId={sharingRecordId}
          currentVisibility={selectedRowVisibility}
          onVisibilityChange={handleForceRender}
        />
      ) : null}
    </>
  );
};
