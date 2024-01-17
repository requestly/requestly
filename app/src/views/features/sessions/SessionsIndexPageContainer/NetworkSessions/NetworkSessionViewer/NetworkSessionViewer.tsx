import React, { useCallback, useEffect, useState } from "react";
import {
  convertHarJsonToRQLogs,
  createLogsHar,
} from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/converter";
import { redirectToNetworkSessionHome, redirectToSessionRecordingHome } from "utils/RedirectionUtils";
import { useNavigate, useParams } from "react-router-dom";
import TrafficTable from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficTableV2";
import { RQNetworkLog } from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/types";
import PageLoader from "components/misc/PageLoader";
import { Button, Space } from "antd";
import { DeleteOutlined, DownloadOutlined } from "@ant-design/icons";

import "./networkSessions.scss";
import { confirmAndDeleteRecording } from "../NetworkSessionsList";
import { getNetworkSession } from "../actions";
import { downloadHar } from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/utils";
import {
  ActionSource,
  trackDeleteNetworkSessionClicked,
  trackDownloadNetworkSessionClicked,
} from "modules/analytics/events/features/sessionRecording/networkSessions";
import { trackRQDesktopLastActivity } from "utils/AnalyticsUtils";
import { SESSION_RECORDING } from "modules/analytics/events/features/constants";
import { useSelector } from "react-redux";
import { PreviewType, harPreviewActions } from "store/features/har-preview/slice";
import { getImportedHar, getPreviewType, getSessionId, getSessionName } from "store/features/har-preview/selectors";
import { useDispatch } from "react-redux";
import { RQButton } from "lib/design-system/components";

const NetworkSessionViewer: React.FC = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const harPreviewType = useSelector(getPreviewType)
  const networkSessionId = useSelector(getSessionId)
  const importedHar = useSelector(getImportedHar)
  const sessionName = useSelector(getSessionName)
  
  const [recordedLogs, setRecordedLogs] = useState<RQNetworkLog[] | null>(null);
  // const [sessionName, setSessionName] = useState("");

  useEffect(() => {
    if(id) {
      dispatch(harPreviewActions.resetState())
      dispatch(harPreviewActions.setPreviewType(PreviewType.SAVED))
      dispatch(harPreviewActions.setSessionId(id))
    }
  }, [id, dispatch]);


  const fetchRecording = useCallback(async () => {
    const recording = await getNetworkSession(networkSessionId);
    dispatch(harPreviewActions.setSessionName(recording.name))
    setRecordedLogs(convertHarJsonToRQLogs(recording.har));
  }, [networkSessionId, dispatch]);

  useEffect(() => {
    if (harPreviewType === PreviewType.IMPORTED && importedHar) {
      const logs = convertHarJsonToRQLogs(importedHar);
      setRecordedLogs(logs);
    } else if(networkSessionId) fetchRecording()
    else {
      console.error("Error: no source for recording")
    }
  }, [fetchRecording, importedHar, harPreviewType, networkSessionId]);

  const renderLoader = () => <PageLoader message="Fetching session details..." />;

  return recordedLogs ? (
    <>
      <div className="network-session-viewer-page">
        <div className="network-session-viewer-header">
          <div className="network-session-name-and-navigation">
            <RQButton
              iconOnly
              type="default"
              icon={<img alt="back" width="14px" height="12px" src="/assets/icons/leftArrow.svg" />}
              onClick={() => redirectToNetworkSessionHome(navigate)}
              className="back-button"
            />
            <div
              style={{
                display: "flex",
                columnGap: "10px",
              }}
            >
              <div className="header text-center">
                {sessionName}
              </div>
            </div>
          </div>
          {harPreviewType === PreviewType.SAVED && (
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
                  trackRQDesktopLastActivity(SESSION_RECORDING.network.download);
                }}
              >
                Download HAR
              </Button>
            </Space>
          </div>
          )}
        </div>
        {/* view */}
        <TrafficTable
          logs={recordedLogs}
          isStaticPreview={true}
          emptyCtaText=""
          emptyDesc=""
          emptyCtaAction={null}
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
