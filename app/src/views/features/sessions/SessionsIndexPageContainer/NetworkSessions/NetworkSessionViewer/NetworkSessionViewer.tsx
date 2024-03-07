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
import { Alert, Button, Popover, Space, Tooltip, Typography } from "antd";
import { CloseOutlined, DeleteOutlined, DownOutlined, DownloadOutlined } from "@ant-design/icons";
import DownArrow from "assets/icons/down-arrow.svg?react";
import "./networkSessions.scss";
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
import CreatableSelect from "react-select/creatable";
import {
  trackMockResponsesButtonClicked,
  trackMockResponsesResourceTypeSelected,
} from "modules/analytics/events/features/sessionRecording/mockResponseFromSession";

const NetworkSessionViewer: React.FC = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isDesktopSessionsCompatible =
    useFeatureIsOn("desktop-sessions") && isFeatureCompatible(FEATURES.DESKTOP_SESSIONS);

  const harPreviewType = useSelector(getPreviewType);
  const networkSessionId = useSelector(getSessionId);
  const importedHar = useSelector(getImportedHar);
  const sessionName = useSelector(getSessionName);

  const [recordedLogs, setRecordedLogs] = useState<RQNetworkLog[] | null>(null);
  const [createMocksMode, setCreateMocksMode] = useState(false);
  const [mockResourceType, setMockResourceType] = useState<string>(null);
  // const [sessionName, setSessionName] = useState("");

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

  const renderLoader = () => <PageLoader message="Fetching session details..." />;

  return recordedLogs ? (
    <>
      <div className="network-session-viewer-page">
        {createMocksMode && (
          <Alert
            type="info"
            banner={true}
            showIcon={false}
            message={
              <div className="display-flex w-100" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <div className="w-100">
                  <span>
                    {mockResourceType === "graphqlApi"
                      ? `Enter the request payload key to filter specific graphQL requests in the traffic table.`
                      : `Select the REST/Static requests that you want to mock from the traffic table below.`}
                  </span>
                </div>
                <Space direction="horizontal">
                  {mockResourceType === "graphqlApi" && (
                    <div className="mr-16">
                      <CreatableSelect
                        isMulti={true}
                        isClearable={true}
                        theme={(theme) => ({
                          ...theme,
                          borderRadius: 4,
                          border: "none",
                          colors: {
                            ...theme.colors,
                            primary: "var(--surface-1)",
                            primary25: "var(--surface-2)",
                            neutral0: "var(--surface-1)",
                            neutral10: "var(--surface-3)", // tag background color
                            neutral80: "var(--text-default)", // tag text color
                            danger: "var(--text-default)", // tag cancel icon color
                            dangerLight: "var(--surface-3)", // tag cancel background color
                          },
                        })}
                        isValidNewOption={(string) => !!string}
                        noOptionsMessage={() => null}
                        formatCreateLabel={() => "Hit Enter to add"}
                        placeholder={"Enter graphQL keys"}
                        onChange={(selectors) => {
                          // trackMockResponsesGraphQLKeyEntered(selectors.map((selector) => selector.value));
                          // setMockGraphQLKeys(selectors.map((selector) => selector.value));
                        }}
                        styles={{
                          indicatorSeparator: (provided) => ({
                            ...provided,
                            display: "none",
                          }),
                          dropdownIndicator: (provided) => ({ ...provided, display: "none" }),
                          control: (provided) => ({
                            ...provided,
                            boxShadow: "none",
                            border: "1px solid var(--border)",
                            backgroundColor: "var(--background)",
                          }),
                          container: (provided) => ({
                            ...provided,
                            flexGrow: 1,
                            width: "50ch",
                          }),
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <RQButton type="primary">Create rules</RQButton>
                  </div>
                  <div>
                    <Tooltip placement="top" title="Clear selected mode">
                      <Button
                        size="small"
                        icon={<CloseOutlined />}
                        style={{ margin: "0 8px" }}
                        onClick={() => setCreateMocksMode(false)}
                      />
                    </Tooltip>
                  </div>
                </Space>
              </div>
            }
          />
        )}
        {!createMocksMode && (
          <div className="network-session-viewer-header">
            <div className="network-session-name-and-navigation">
              <RQButton
                iconOnly
                type="default"
                icon={<img alt="back" width="14px" height="12px" src="/assets/icons/leftArrow.svg" />}
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
                  <Popover
                    trigger={["click"]}
                    content={
                      <Space direction="vertical">
                        <Typography.Text>Which type of requests do you want to serve?</Typography.Text>
                        <RQDropdown
                          menu={{
                            items: [
                              {
                                key: "restApi",
                                label: "HTTP (REST, JS, CSS)",
                              },
                              {
                                key: "graphqlApi",
                                label: "GraphQL API",
                              },
                            ],
                            selectedKeys: mockResourceType ? [mockResourceType] : [],
                            selectable: true,
                            onSelect: (item) => {
                              // resetMockResponseState();
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
                                  ? "HTTP (REST, JS, CSS)"
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
        />
      </div>
    </>
  ) : (
    renderLoader()
  );
};
export default NetworkSessionViewer;
