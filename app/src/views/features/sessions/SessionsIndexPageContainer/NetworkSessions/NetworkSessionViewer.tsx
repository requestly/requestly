import React, { useCallback, useEffect, useState } from "react";
import {
  convertHarJsonToRQLogs,
  createLogsHar,
} from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/converter";
import { redirectToSessionRecordingHome, redirectToTraffic } from "utils/RedirectionUtils";
import { useNavigate, useParams } from "react-router-dom";
import TrafficTable from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficTableV2";
import { Log } from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/types";
import PageLoader from "components/misc/PageLoader";
import { Button, Space, Typography } from "antd";
import { DeleteOutlined, DownloadOutlined } from "@ant-design/icons";

import "./networkSessions.scss";
import { confirmAndDeleteRecording } from "./NetworkSessionsList";
import { getNetworkSession } from "./actions";
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
    const recording = await getNetworkSession(id);
    setSessionName(recording.name);
    setRecordedLogs(convertHarJsonToRQLogs(recording.har));
  }, [id]);

  useEffect(() => {
    fetchRecording();
  }, [fetchRecording]);

  const renderLoader = () => <PageLoader message="Fetching session details..." />;

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
              <Button
                icon={<DeleteOutlined />}
                onClick={() => {
                  confirmAndDeleteRecording(id, () => {
                    redirectToSessionRecordingHome(navigate);
                  });
                  trackDeleteNetworkSessionClicked(ActionSource.Preview);
                }}
              >
                Delete session
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => {
                  downloadHar(createLogsHar(recordedLogs), sessionName);
                  trackDownloadNetworkSessionClicked(ActionSource.Preview);
                }}
              >
                Export as HAR
              </Button>
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
