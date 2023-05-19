import React, { useCallback, useState } from "react";
import { Row, Col, Input, Typography, Space, Button, Tooltip, Badge } from "antd";
import {
  SaveOutlined,
  CaretRightOutlined,
  ClearOutlined,
  PauseOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { FaFilter } from "react-icons/fa";
import { VscRegex } from "react-icons/vsc";
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
import { getAllFilters } from "store/features/desktop-traffic-table/selectors";
import {
  trackTrafficInterceptionPaused,
  trackTrafficInterceptionResumed,
  trackTrafficTableFilterClicked,
  trackTrafficTableSearched,
} from "modules/analytics/events/desktopApp";
import { useFeatureIsOn } from "@growthbook/growthbook-react";

const { Text } = Typography;

const ActionHeader = ({
  clearLogs,
  setIsSSLProxyingModalVisible,
  showDeviceSelector,
  deviceId,
  logsCount,
  setIsInterceptingTraffic,
  logsToSaveAsHar,
  isStaticPreview,
  isFiltersCollapsed,
  setIsFiltersCollapsed,
  activeFiltersCount = 0,
}) => {
  const isImportNetworkSessions = useFeatureIsOn("import_export_sessions");

  const [isSessionSaveModalOpen, setIsSessionSaveModalOpen] = useState(false);

  const closeSaveModal = useCallback(() => {
    setIsSessionSaveModalOpen(false);
  }, []);

  const openSaveModal = useCallback(() => {
    setIsSessionSaveModalOpen(true);
  }, []);

  const dispatch = useDispatch();
  const trafficTableFilters = useSelector(getAllFilters);

  const isRegexSearchActive = trafficTableFilters.search.regex;

  const handleOnSearchChange = (e) => {
    const searchValue = e.target.value;
    if (searchValue) trackTrafficTableSearched();
    dispatch(desktopTrafficTableActions.updateSearchTerm(searchValue));
  };

  const renderSearchInput = () => {
    if (trafficTableFilters.search.regex) {
      return (
        <Input.Search
          value={trafficTableFilters.search.term || ""}
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
                  onClick={() => dispatch(desktopTrafficTableActions.toggleRegexSearch())}
                  iconOnly
                  icon={<VscRegex />}
                />
              </Tooltip>
            </>
          }
          style={{ width: 300 }}
        />
      );
    }

    return (
      <Input.Search
        value={trafficTableFilters.search.term || ""}
        className="action-header-input"
        placeholder="Input Search Keyword"
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
      />
    );
  };

  return (
    <>
      <Row
        align="middle"
        style={{
          padding: 3,
          paddingLeft: "24px",
          paddingRight: "12px",
        }}
      >
        <Space direction="horizontal">
          <Col>{renderSearchInput()}</Col>
          <Col>
            <Badge count={activeFiltersCount} size="small">
              <RQButton
                type="default"
                iconOnly
                icon={<FaFilter />}
                onClick={() => {
                  setIsFiltersCollapsed((prev) => !prev);
                  trackTrafficTableFilterClicked();
                }}
                className={isFiltersCollapsed ? "traffic-table-filter-btn-inactive" : "traffic-table-filter-btn-active"}
              />
            </Badge>
          </Col>
          {isStaticPreview ? null : (
            <>
              <Col>
                <Tooltip placement="top" title="Clear Logs">
                  <Button
                    type="primary"
                    disabled={!logsCount}
                    shape="circle"
                    icon={<ClearOutlined />}
                    onClick={clearLogs}
                  />
                </Tooltip>
              </Col>
              {isFeatureCompatible(FEATURES.NETWORK_SESSIONS) && isImportNetworkSessions ? (
                <>
                  <Col>
                    <Tooltip placement="top" title="Save Network Session">
                      <Button
                        type="primary"
                        disabled={!logsCount}
                        icon={<SaveOutlined />}
                        onClick={() => {
                          trackNetworkSessionSaveClicked();
                          openSaveModal();
                        }}
                      />
                    </Tooltip>
                  </Col>
                  <Col>
                    <Tooltip placement="top" title="Export Network Session">
                      <Button
                        type="primary"
                        disabled={!logsCount}
                        icon={<DownloadOutlined />}
                        onClick={() => {
                          downloadHar(logsToSaveAsHar || {}, "");
                          trackDownloadNetworkSessionClicked(ActionSource.TrafficTable);
                        }}
                      />
                    </Tooltip>
                  </Col>
                </>
              ) : null}
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
              <Col>
                <PauseAndPlayButton
                  defaultIsPaused={false}
                  onChange={(isPaused) => {
                    setIsInterceptingTraffic(!isPaused);
                  }}
                  disabled={!logsCount}
                />
              </Col>
            </>
          )}
        </Space>
      </Row>
      <SessionSaveModal har={logsToSaveAsHar} isVisible={isSessionSaveModalOpen} closeModal={closeSaveModal} />
    </>
  );
};

export default ActionHeader;

function PauseAndPlayButton({ defaultIsPaused, onChange, disabled }) {
  const [isPaused, setIsPaused] = useState(defaultIsPaused);
  return (
    <Tooltip title={isPaused ? "Resume logging requests" : "Pause logging requests"}>
      {isPaused ? (
        <Button
          type="primary"
          shape="circle"
          icon={<CaretRightOutlined />}
          onClick={() => {
            setIsPaused(false);
            onChange(false); // isPaused
            trackTrafficInterceptionResumed();
          }}
        />
      ) : (
        <Button
          type="primary"
          shape="circle"
          danger
          icon={<PauseOutlined />}
          onClick={() => {
            setIsPaused(true);
            onChange(true); // isPaused
            trackTrafficInterceptionPaused();
          }}
          disabled={disabled}
        />
      )}
    </Tooltip>
  );
}
