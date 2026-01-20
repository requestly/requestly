import React, { useCallback, useEffect, useState } from "react";
import {
  convertHarJsonToRQLogs,
  createLogsHar,
} from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/converter";
import { redirectToNetworkSessionHome } from "utils/RedirectionUtils";
import { useNavigate, useParams } from "react-router-dom";
import TrafficTable from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficTableV2";
import { RQNetworkLog } from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/types";
import PageLoader from "components/misc/PageLoader";
import { Button, Popover, Space, Typography } from "antd";
import { DeleteOutlined, DownOutlined, DownloadOutlined } from "@ant-design/icons";
import DownArrow from "assets/icons/down-arrow.svg?react";
import { confirmAndDeleteRecording } from "../NetworkSessionsList";
import { getNetworkSession } from "../actions";
import { downloadHar } from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/utils";
import {
  ActionSource,
  trackDeleteNetworkSessionClicked,
  trackDownloadNetworkSessionClicked,
  trackNetworkSessionViewerBackClicked,
} from "modules/analytics/events/features/sessionRecording/networkSessions";
import { trackRQDesktopLastActivity } from "utils/AnalyticsUtils";
import { SESSION_RECORDING } from "modules/analytics/events/features/constants";
import { useSelector } from "react-redux";
import { PreviewType, networkSessionActions } from "store/features/network-sessions/slice";
import {
  getImportedHar,
  getPreviewType,
  getSessionId,
  getSessionName,
} from "store/features/network-sessions/selectors";
import { useDispatch } from "react-redux";
import { RQButton, RQDropdown } from "lib/design-system/components";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import FEATURES from "config/constants/sub/features";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import {
  trackMockResponsesButtonClicked,
  trackMockResponsesResourceTypeSelected,
} from "modules/analytics/events/features/sessionRecording/mockResponseFromSession";
import CreateMocksModeBanner from "./CreateMocksModeBanner";
import "./networkSessions.scss";

export const NetworkSessionViewer: React.FC = () => {
  const params = useParams();
  console.debug("params", params);
  const id = params.id;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isDesktopSessionsCompatible =
    useFeatureIsOn("desktop-sessions") && isFeatureCompatible(FEATURES.DESKTOP_SESSIONS);

  const isMockResponseFromSessionEnabled = useFeatureIsOn("mock_response_from_session");

  const harPreviewType = useSelector(getPreviewType);
  const networkSessionId = useSelector(getSessionId);
  const importedHar = useSelector(getImportedHar);
  const sessionName = useSelector(getSessionName);

  const [recordedLogs, setRecordedLogs] = useState<RQNetworkLog[] | null>(null);
  const [createMocksMode, setCreateMocksMode] = useState(false);
  const [mockResourceType, setMockResourceType] = useState<string | null>(null);
  const [mockGraphQLKeys, setMockGraphQLKeys] = useState<{ key: string; value: string }[]>([]);
  const [selectedMockRequests, setSelectedMockRequests] = useState({});
  const [showMockRequestSelector, setShowMockRequestSelector] = useState(false);
  const [disableFilters, setDisableFilters] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(networkSessionActions.resetState());
      dispatch(networkSessionActions.setPreviewType(PreviewType.SAVED));
      dispatch(networkSessionActions.setSessionId(id));
    }
  }, [id, dispatch]);

  const fetchRecording = useCallback(async () => {
    const recording = await getNetworkSession(networkSessionId);
    dispatch(networkSessionActions.setSessionName(recording?.name));
    setRecordedLogs(convertHarJsonToRQLogs(recording?.har));
  }, [networkSessionId, dispatch]);

  useEffect(() => {
    if (harPreviewType === PreviewType.IMPORTED && importedHar) {
      const logs = convertHarJsonToRQLogs(importedHar);
      setRecordedLogs(logs);
    } else if (networkSessionId) fetchRecording();
    else {
      console.error("Error: no source for recording");
    }
  }, [fetchRecording, importedHar, harPreviewType, networkSessionId]);

  const resetMockResponseState = useCallback(() => {
    setShowMockRequestSelector(false);
    setMockGraphQLKeys([]);
    setSelectedMockRequests({});
    setMockResourceType(null);
  }, []);

  useEffect(() => {
    if (createMocksMode) {
      if (mockResourceType === "graphqlApi") {
        if (mockGraphQLKeys.length === 0) {
          setShowMockRequestSelector(false);
          setDisableFilters(true);
        } else {
          setShowMockRequestSelector(true);
          setDisableFilters(false);
        }
      } else {
        setShowMockRequestSelector(true);
      }
    } else {
      setShowMockRequestSelector(false);
      setDisableFilters(false);
    }
  }, [mockGraphQLKeys?.length, mockResourceType, createMocksMode]);

  const renderLoader = () => <PageLoader message="Fetching session details..." />;

  return recordedLogs ? (
    <div className="network-session-viewer-page">
      {createMocksMode && (
        <CreateMocksModeBanner
          resetMockResponseState={resetMockResponseState}
          setMockGraphQLKeys={setMockGraphQLKeys}
          mockGraphQLKeys={mockGraphQLKeys}
          setCreateMocksMode={setCreateMocksMode}
          selectedMockRequests={selectedMockRequests}
          setSelectedMockRequests={setSelectedMockRequests}
          mockResourceType={mockResourceType}
        />
      )}
      {!createMocksMode && (
        <div className="network-session-viewer-header">
          <div className="network-session-name-and-navigation">
            <RQButton
              iconOnly
              type="default"
              icon={<img alt="back" width="14px" height="12px" src="/assets/media/common/left-arrow.svg" />}
              onClick={() => {
                trackNetworkSessionViewerBackClicked();
                redirectToNetworkSessionHome(navigate, isDesktopSessionsCompatible);
              }}
              className="back-button"
            />
            <div
              style={{
                display: "flex",
                columnGap: "10px",
              }}
            >
              <div className="header text-center">{sessionName}</div>
            </div>
          </div>
          {harPreviewType === PreviewType.SAVED && (
            <div className="session-viewer-actions">
              <Space>
                {isMockResponseFromSessionEnabled && (
                  <Popover
                    trigger={["click"]}
                    content={
                      <Space direction="vertical">
                        <Typography.Text>Which type of requests do you want to mock?</Typography.Text>
                        <RQDropdown
                          menu={{
                            items: [
                              {
                                key: "restApi",
                                label: "REST/Static APIs",
                              },
                              {
                                key: "graphqlApi",
                                label: "GraphQL APIs",
                              },
                            ],
                            selectedKeys: mockResourceType ? [mockResourceType] : [],
                            selectable: true,
                            onSelect: (item) => {
                              setMockResourceType(item.key);
                              trackMockResponsesResourceTypeSelected(item.key);
                            },
                          }}
                          trigger={["click"]}
                          className="display-inline-block mock-responses-popover"
                          placement="bottomRight"
                          overlayStyle={{ fontSize: "10px" }}
                        >
                          <div>
                            <Typography.Text
                              className="cursor-pointer mock-responses-popover-dropdown-text"
                              onClick={(e) => e.preventDefault()}
                            >
                              {mockResourceType
                                ? mockResourceType === "restApi"
                                  ? "REST/Static APIs"
                                  : "GraphQL API"
                                : "Select Resource Type"}{" "}
                            </Typography.Text>
                            <DownOutlined className="mock-responses-popover-dropdown-icon" />
                          </div>
                        </RQDropdown>
                        <RQButton
                          disabled={!mockResourceType}
                          className="mock-responses-popover-dropdown-btn"
                          type="primary"
                          size="small"
                          onClick={() => {
                            trackMockResponsesButtonClicked();
                            setCreateMocksMode(true);
                          }}
                        >
                          Proceed
                        </RQButton>
                      </Space>
                    }
                  >
                    <RQButton>
                      <span>Create mocks from this session</span>
                      <DownArrow style={{ marginTop: "2px", marginLeft: "4px" }} />
                    </RQButton>
                  </Popover>
                )}

                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    confirmAndDeleteRecording(id, () => {
                      redirectToNetworkSessionHome(navigate, isDesktopSessionsCompatible);
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
      )}
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
        createMocksMode={createMocksMode}
        mockResourceType={mockResourceType}
        mockGraphQLKeys={mockGraphQLKeys}
        selectedMockRequests={selectedMockRequests}
        setSelectedMockRequests={setSelectedMockRequests}
        showMockRequestSelector={showMockRequestSelector}
        disableFilters={disableFilters}
      />
    </div>
  ) : (
    renderLoader()
  );
};

export default NetworkSessionViewer;
