import React, { useCallback, useState } from "react";
import { Row, Col, Input, Typography, Space, Button, Tooltip, Badge, Divider, Modal } from "antd";
import {
  SaveOutlined,
  CaretRightOutlined,
  ClearOutlined,
  PauseOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  DownloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { VscRegex } from "@react-icons/all-files/vsc/VscRegex";
import { RQButton } from "lib/design-system/components";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import SessionSaveModal from "views/features/sessions/SessionsIndexPageContainer/NetworkSessions/SessionSaveModal";
import {
  ActionSource,
  trackDownloadNetworkSessionClicked,
  trackNetworkSessionSaveClicked,
} from "modules/analytics/events/features/sessionRecording/networkSessions";
import { downloadHar } from "../TrafficExporter/harLogs/utils";
import { useDispatch, useSelector } from "react-redux";
import { desktopTrafficTableActions } from "store/features/desktop-traffic-table/slice";
import { getAllFilters, getIsInterceptionPaused } from "store/features/desktop-traffic-table/selectors";
import {
  trackSavingTooManyLogsAlertShown,
  trackTrafficInterceptionPaused,
  trackTrafficInterceptionResumed,
  trackTrafficTableFilterClicked,
  trackTrafficTableSearched,
} from "modules/analytics/events/desktopApp";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { SESSION_RECORDING } from "modules/analytics/events/features/constants";
import { trackRQDesktopLastActivity } from "utils/AnalyticsUtils";
import { TRAFFIC_TABLE } from "modules/analytics/events/desktopApp/constants";
import { useDebounce } from "hooks/useDebounce";

const { Text } = Typography;

const canSaveLogsWithoutCrashing = (logsCount) => {
  const MAX_ENTRIES = 1500; // ESTIMATE
  return logsCount <= MAX_ENTRIES;
};

const ActionHeader = ({
  children,
  clearLogs,
  deviceId,
  logsCount,
  filteredLogsCount,
  showDeviceSelector,
  logsToSaveAsHar,
  isStaticPreview,
  setIsFiltersCollapsed,
  activeFiltersCount = 0,
  setIsSSLProxyingModalVisible,
  disableFilters,
  search,
  setSearch,
  persistLogsSearch,
}) => {
  const isImportNetworkSessions = useFeatureIsOn("import_export_sessions");

  const isPaused = useSelector(getIsInterceptionPaused);

  const [isSessionSaveModalOpen, setIsSessionSaveModalOpen] = useState(false);

  const closeSaveModal = useCallback(() => {
    setIsSessionSaveModalOpen(false);
  }, []);

  const openSaveModal = useCallback(() => {
    setIsSessionSaveModalOpen(true);
  }, []);

  const dispatch = useDispatch();
  const trafficTableFilters = useSelector(getAllFilters);

  const isRegexSearchActive = persistLogsSearch ? trafficTableFilters.search.regex : search.regex;

  const sendOnSearchEvents = useDebounce(() => {
    trackTrafficTableSearched();
    trackRQDesktopLastActivity(TRAFFIC_TABLE.TRAFFIC_TABLE_SEARCHED);
  });

  const handleOnSearchChange = (e) => {
    const searchValue = e.target.value;
    if (searchValue) {
      sendOnSearchEvents();
    }
    if (persistLogsSearch) {
      dispatch(desktopTrafficTableActions.updateSearchTerm(searchValue));
    } else {
      setSearch((prev) => {
        return { ...prev, term: searchValue };
      });
    }
  };

  const renderSearchInput = () => {
    const searchFilter = persistLogsSearch ? trafficTableFilters.search : search;
    if (searchFilter.regex) {
      return (
        <Input
          value={searchFilter.term || ""}
          className="action-header-input"
          placeholder="Input RegEx"
          onChange={handleOnSearchChange}
          prefix={<span className="text-gray">{"/"}</span>}
          suffix={
            <>
              <span className="text-gray">{"/"}</span>
              &nbsp;
              <Tooltip title="Use regular expression" placement="bottom" mouseEnterDelay={0.5}>
                <RQButton
                  className={`traffic-table-regex-btn ${
                    isRegexSearchActive ? "traffic-table-regex-btn-active" : "traffic-table-regex-btn-inactive"
                  }`}
                  onClick={() => {
                    if (persistLogsSearch) {
                      dispatch(desktopTrafficTableActions.toggleRegexSearch());
                    } else {
                      setSearch((prev) => {
                        return { ...prev, regex: !prev.regex };
                      });
                    }
                  }}
                  iconOnly
                  icon={<VscRegex />}
                />
              </Tooltip>
            </>
          }
          style={{ width: 300 }}
          size="small"
          disabled={disableFilters}
        />
      );
    }

    return (
      <Input
        value={searchFilter.term || ""}
        className="action-header-input"
        placeholder="Input Search URL"
        onChange={handleOnSearchChange}
        suffix={
          <Tooltip title="Use regular expression" placement="bottom" mouseEnterDelay={0.5}>
            <RQButton
              className={`traffic-table-regex-btn ${
                isRegexSearchActive ? "traffic-table-regex-btn-active" : "traffic-table-regex-btn-inactive"
              }`}
              onClick={() => {
                dispatch(desktopTrafficTableActions.toggleRegexSearch());
              }}
              iconOnly
              icon={<VscRegex />}
            />
          </Tooltip>
        }
        style={{ width: 300 }}
        size="small"
        disabled={disableFilters}
      />
    );
  };

  const handleFilterClick = () => {
    setIsFiltersCollapsed((prev) => !prev);
    trackTrafficTableFilterClicked();
    trackRQDesktopLastActivity(TRAFFIC_TABLE.TRAFFIC_TABLE_FILTER_CLICKED);
  };

  const showExcessLogsAlert = (logsCount, src) => {
    trackSavingTooManyLogsAlertShown(logsCount, src);
    Modal.error({
      title: "Log Limit Exceeded",
      content: (
        <Typography>
          Saving this many logs may lead to unexpected app behaviour.
          <br />
          Please use filters or search to select specific logs for saving.
        </Typography>
      ),
      width: 520,
    });
  };

  return (
    <>
      <Row
        align="middle"
        style={{
          paddingLeft: "24px",
          paddingRight: "12px",
        }}
      >
        <Space size={12}>
          <Tooltip title={disableFilters ? "First, filter the GraphQL requests using payload key-value filters." : ""}>
            <Col>{renderSearchInput()}</Col>
          </Tooltip>
          <Col>
            <Tooltip
              title={disableFilters ? "First, filter the GraphQL requests using payload key-value filters." : ""}
            >
              <Button icon={<FilterOutlined />} onClick={handleFilterClick} disabled={disableFilters}>
                <span className="traffic-table-filter-btn-content">
                  <span>Filter</span>
                  <Badge className="traffic-table-applied-filter-count" count={activeFiltersCount} size="small" />
                </span>
              </Button>
            </Tooltip>
          </Col>
          {isStaticPreview ? null : (
            <>
              <Col>
                <Button icon={<ClearOutlined />} onClick={clearLogs} disabled={!logsCount}>
                  Clear log
                </Button>
              </Col>

              <Col>
                {isPaused ? (
                  <RQButton
                    icon={<CaretRightOutlined />}
                    onClick={() => {
                      trackTrafficInterceptionResumed();
                      trackRQDesktopLastActivity(TRAFFIC_TABLE.TRAFFIC_INTERCEPTION_RESUMED);
                      dispatch(desktopTrafficTableActions.toggleIsInterceptionPaused());
                    }}
                  >
                    Resume
                  </RQButton>
                ) : (
                  <RQButton
                    danger
                    icon={<PauseOutlined />}
                    onClick={() => {
                      trackTrafficInterceptionPaused();
                      trackRQDesktopLastActivity(TRAFFIC_TABLE.TRAFFIC_INTERCEPTION_PAUSED);
                      dispatch(desktopTrafficTableActions.toggleIsInterceptionPaused());
                    }}
                  >
                    Pause
                  </RQButton>
                )}
              </Col>

              {isFeatureCompatible(FEATURES.DESKTOP_APP_SSL_PROXYING) ? (
                <Col>
                  <Tooltip title="SSL Proxying">
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<SafetyCertificateOutlined />}
                      onClick={() => setIsSSLProxyingModalVisible(true)}
                    />
                  </Tooltip>
                </Col>
              ) : null}
              {showDeviceSelector ? (
                <>
                  <Col>
                    <Button onClick={showDeviceSelector} shape="circle" danger type="primary">
                      <SettingOutlined />
                    </Button>
                  </Col>
                  <Col>
                    <Text code>Device Id: {deviceId || "Null"}</Text>
                  </Col>
                </>
              ) : null}

              {children}
            </>
          )}
        </Space>
      </Row>
      <Row className="ml-auto" align="middle" justify="end" style={{ paddingRight: "24px" }}>
        {isFeatureCompatible(FEATURES.NETWORK_SESSIONS) && isImportNetworkSessions ? (
          <>
            {!isStaticPreview && (
              <Col>
                <Button
                  icon={<DownloadOutlined />}
                  disabled={!filteredLogsCount}
                  onClick={() => {
                    if (canSaveLogsWithoutCrashing(filteredLogsCount)) {
                      downloadHar(logsToSaveAsHar || {}, "");
                    } else {
                      showExcessLogsAlert(filteredLogsCount, "export-har");
                    }
                    trackDownloadNetworkSessionClicked(ActionSource.TrafficTable);
                    trackRQDesktopLastActivity(SESSION_RECORDING.network.download);
                  }}
                >
                  Export HAR
                </Button>
              </Col>
            )}

            {!isStaticPreview && (
              <>
                <Divider type="vertical" style={{ margin: "0 16px" }} />
                <Col>
                  <Button
                    icon={<SaveOutlined />}
                    disabled={!filteredLogsCount}
                    onClick={() => {
                      trackNetworkSessionSaveClicked();
                      trackRQDesktopLastActivity(SESSION_RECORDING.network.save.btn_clicked);
                      if (canSaveLogsWithoutCrashing(filteredLogsCount)) {
                        openSaveModal();
                      } else {
                        showExcessLogsAlert(filteredLogsCount, "save-har");
                      }
                    }}
                  >
                    Save
                  </Button>
                </Col>
              </>
            )}
          </>
        ) : null}
      </Row>

      <SessionSaveModal har={logsToSaveAsHar} isVisible={isSessionSaveModalOpen} closeModal={closeSaveModal} />
    </>
  );
};

export default ActionHeader;
