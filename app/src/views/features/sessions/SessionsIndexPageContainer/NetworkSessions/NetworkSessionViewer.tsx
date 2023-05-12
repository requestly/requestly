import React, { useCallback, useEffect, useMemo, useState } from "react";
// import { NetworkSessionRecord } from "./types"
import {
  convertHarJsonToRQLogs,
  createLogsHar,
} from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/converter";
import { redirectToSessionRecordingHome, redirectToTraffic } from "utils/RedirectionUtils";
import { useNavigate, useParams } from "react-router-dom";
import TrafficTable from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficTableV2";
import { Log } from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/types";
import PageLoader from "components/misc/PageLoader";
import { Button, Dropdown, Menu, Space, Typography } from "antd";
import { DeleteOutlined, DownloadOutlined, MoreOutlined } from "@ant-design/icons";

import "./networkSessions.scss";
import { confirmAndDeleteRecording } from "./NetworkSessionsList";
import { getRecording } from "./actions";
import { downloadHar } from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/utils";
import {
  ActionSource,
  trackDeleteNetworkSessionClicked,
  trackDownloadNetworkSessionClicked,
} from "modules/analytics/events/features/sessionRecording/networkSessions";

const NetworkSessionViewer: React.FC<{}> = () => {
  const { id } = useParams();
  const [recordedLogs, setRecordedLogs] = useState<Log[] | null>(null);
  const [sessionName, setSessionName] = useState("");

  const navigate = useNavigate();

  const fetchRecording = useCallback(async () => {
    const recording = await getRecording(id);
    setSessionName(recording.name);
    setRecordedLogs(convertHarJsonToRQLogs(recording.har));
  }, [id]);

  useEffect(() => {
    fetchRecording();
  }, [fetchRecording]);

  const renderLoader = () => <PageLoader message="Fetching session details..." />;
  const sessionActionsDropdownMenu = useMemo(
    () => (
      <Menu className="network-session-viewer-more-actions">
        <Menu.Item
          key="delete"
          className="more-action"
          onClick={() => {
            confirmAndDeleteRecording(id, () => {
              redirectToSessionRecordingHome(navigate);
            });
            trackDeleteNetworkSessionClicked(ActionSource.Preview);
          }}
        >
          <DeleteOutlined className="more-action-icon" /> Delete Session
        </Menu.Item>
        <Menu.Item
          key="download"
          className="more-action"
          disabled={!(!!recordedLogs && recordedLogs?.length !== 0)}
          onClick={() => {
            downloadHar(createLogsHar(recordedLogs), sessionName);
            trackDownloadNetworkSessionClicked(ActionSource.Preview);
          }}
        >
          <DownloadOutlined className="more-action-icon" /> Export as Har
        </Menu.Item>
      </Menu>
    ),
    [navigate, id, recordedLogs, sessionName]
  );

  return recordedLogs ? (
    <>
      <div className="network-session-viewer-page">
        <div className="network-session-viewer-header">
          <div
            style={{
              display: "flex",
              columnGap: "10px",
            }}
          >
            <Typography.Title level={3} className="network-session-recording-name">
              {sessionName}
            </Typography.Title>
          </div>
          <div className="session-viewer-actions">
            <Space>
              <Dropdown overlay={sessionActionsDropdownMenu} trigger={["click"]}>
                <Button icon={<MoreOutlined />} onClick={(e) => e.preventDefault()} />
              </Dropdown>
            </Space>
          </div>
        </div>
        {/* view */}
        <TrafficTable
          logs={recordedLogs}
          isStaticPreview={true}
          emptyCtaText="Capture Traffic in Network Inspector"
          emptyDesc="The har file you imported does not contain any network logs."
          emptyCtaAction={() => redirectToTraffic(navigate)}
          showDeviceSelector={undefined}
          deviceId={undefined}
          clearLogsCallback={undefined}
        />
      </div>
    </>
  ) : (
    renderLoader()
  );
};
export default NetworkSessionViewer;
