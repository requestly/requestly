import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Button, Col, Tag, Menu, Row, Tooltip } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import ProCard from "@ant-design/pro-card";
import Split from "react-split";
import { isEqual, sortBy } from "lodash";
import { makeOriginalLog } from "capture-console-logs";
import { getActiveModals, getDesktopSpecificDetails } from "store/selectors";
import { actions } from "store";
import FixedRequestLogPane from "./FixedRequestLogPane";
import ActionHeader from "./ActionHeader";
import RuleEditorModal from "components/common/RuleEditorModal";
import { groupByApp, groupByDomain } from "../../../../../../utils/TrafficTableUtils";
import GroupByNone from "./Tables/GroupByNone";
import SSLProxyingModal from "components/mode-specific/desktop/SSLProxyingModal";
import { convertProxyLogToUILog, getSortedMenuItems } from "./utils/logUtils";
import APPNAMES from "./Tables/GROUPBYAPP_CONSTANTS";
import { desktopTrafficTableActions } from "store/features/desktop-traffic-table/slice";
import { getAllLogs, getLogResponseById } from "store/features/desktop-traffic-table/selectors";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import Logger from "lib/logger";
import { ANALYTIC_EVENT_SOURCE, logType } from "./constant";
import { trackTrafficTableLogsCleared, trackTrafficTableRequestClicked } from "modules/analytics/events/desktopApp";
import {
  trackSidebarFilterCollapsed,
  trackSidebarFilterExpanded,
  trackSidebarFilterSelected,
} from "modules/analytics/events/common/traffic-table";
import "./css/draggable.css";
import "./TrafficTableV2.css";
import { getConnectedAppsCount } from "utils/Misc";
import { isRegexFormat } from "utils/rules/misc";

const CurrentTrafficTable = ({
  logs = [],
  emptyCtaText,
  emptyCtaAction,
  emptyDesc,
  showDeviceSelector,
  deviceId,
  clearLogsCallback,
}) => {
  const GUTTER_SIZE = 20;
  const gutterSize = GUTTER_SIZE;
  const dispatch = useDispatch();
  const { ruleEditorModal } = useSelector(getActiveModals);
  const desktopSpecificDetails = useSelector(getDesktopSpecificDetails);

  const isTablePeristenceEnabled = useFeatureIsOn("traffic_table_perisitence");

  // Component State
  const previousLogsRef = useRef(logs);
  const newLogs = useSelector(getAllLogs);
  // {id: log, ...}
  const [networkLogsMap, setNetworkLogsMap] = useState({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedRequestData, setSelectedRequestData] = useState({});
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isRegexSearchActive, setIsRegexSearchActive] = useState(false);
  const [rulePaneSizes, setRulePaneSizes] = useState([100, 0]);
  const [isSSLProxyingModalVisible, setIsSSLProxyingModalVisible] = useState(false);

  const [isInterceptingTraffic, setIsInterceptingTraffic] = useState(true);

  const selectedRequestResponse =
    useSelector(getLogResponseById(selectedRequestData?.id)) || selectedRequestData?.response?.body;

  const [consoleLogsShown, setConsoleLogsShown] = useState([]);
  const [filterType, setFilterType] = useState(null);
  const [expandedLogTypes, setExpandedLogTypes] = useState([]);
  const [logFilters, setLogFilters] = useState({
    statusCode: [],
    resourceType: [],
    method: [],
  });

  const handleRuleEditorModalClose = useCallback(() => {
    dispatch(
      actions.toggleActiveModal({
        newValue: false,
        modalName: "ruleEditorModal",
      })
    );
  }, [dispatch]);

  const upsertLogs = (logs) => {
    let _networkLogsMap = { ...networkLogsMap };
    logs?.forEach((log) => {
      if (log) {
        _networkLogsMap[log.id] = log;
      }
    });

    setNetworkLogsMap(_networkLogsMap);
  };

  const stableUpsertLogs = useCallback(upsertLogs, [networkLogsMap]);

  useEffect(() => {
    if (!isEqual(sortBy(previousLogsRef.current), sortBy(logs))) {
      stableUpsertLogs(logs);
      previousLogsRef.current = logs;
    }
  }, [logs, stableUpsertLogs]);

  const handlePreviewVisibility = (visible = false) => {
    setIsPreviewOpen(visible);

    if (visible) {
      setRulePaneSizes([60, 40]);
      return;
    }

    setRulePaneSizes([100, 0]);
  };

  const handleRowClick = (row) => {
    setSelectedRequestData(row);
    handlePreviewVisibility(true);
    trackTrafficTableRequestClicked();
  };

  const handleClosePane = () => {
    handlePreviewVisibility(false);
  };

  const handleOnSearchChange = (e) => {
    const searchValue = e.target.value;
    setSearchKeyword(searchValue);
  };

  let previewData = [];

  // Show Details of a Request in the Preview pane
  if (selectedRequestData.timestamp) {
    previewData = [
      {
        property: "Time",
        value: selectedRequestData.timestamp,
      },
      {
        property: "Method",
        value: selectedRequestData.request.method,
      },
      {
        property: "Status Code",
        value: selectedRequestData.response.statusCode,
      },
      {
        property: "Path",
        value: selectedRequestData.request.path,
      },
      {
        property: "Host",
        value: selectedRequestData.request.host,
      },
      {
        property: "Port",
        value: selectedRequestData.request.port,
      },
      {
        property: "REQUEST HEADERS",
        value: "",
      },
    ];
    for (const [key, value] of Object.entries(selectedRequestData.request.headers)) {
      const header = {
        property: key,
        value,
      };
      previewData.push(header);
    }
    previewData.push({
      property: "RESPONSE HEADERS",
      value: "",
    });
    for (const [key, value] of Object.entries(selectedRequestData.response.headers)) {
      const header = {
        property: key,
        value,
      };
      previewData.push(header);
    }
  }

  const upsertNetworkLogMap = useCallback(
    (log) => {
      let _networkLogsMap = { ...networkLogsMap };
      _networkLogsMap[log.id] = log;
      setNetworkLogsMap(_networkLogsMap);
    },
    [networkLogsMap]
  );

  const printLogsToConsole = useCallback(
    (log) => {
      if (log.consoleLogs && !consoleLogsShown.includes(log.id)) {
        log.consoleLogs.forEach((consoleLog) => [makeOriginalLog(consoleLog)]);
        setConsoleLogsShown((c) => [...c, log.id]);
      }
    },
    [consoleLogsShown]
  );

  const clearLogs = () => {
    // Old Logs Clear
    setNetworkLogsMap({});

    // New Logs Clear
    dispatch(desktopTrafficTableActions.logResponsesClearAll());
    dispatch(desktopTrafficTableActions.logsClearAll());
    trackTrafficTableLogsCleared(getConnectedAppsCount(Object.values(desktopSpecificDetails.appsList)) > 0);

    if (clearLogsCallback) clearLogsCallback();
  };

  const stableDispatch = useCallback(dispatch, [dispatch]);

  const saveLogInRedux = useCallback(
    (log) => {
      if (log) {
        if (log.response && log.response.body) {
          stableDispatch(desktopTrafficTableActions.logResponseBodyAdd(log));
          log.response.body = null; // Setting this to null so that it doesn't get saved in logs state
        }

        stableDispatch(desktopTrafficTableActions.logUpsert(log));
      }
    },
    [stableDispatch]
  );

  useEffect(() => {
    // TODO: Remove this ipc when all of the users are shifted to new version 1.4.0
    window?.RQ?.DESKTOP.SERVICES.IPC.registerEvent("log-network-request", (payload) => {
      if (isInterceptingTraffic) {
        // TODO: @sahil865gupta Fix this multiple time registering
        upsertNetworkLogMap(payload);
      }
    });
    window?.RQ?.DESKTOP.SERVICES.IPC.registerEvent("log-network-request-v2", (payload) => {
      if (isInterceptingTraffic) {
        const rqLog = convertProxyLogToUILog(payload);

        printLogsToConsole(rqLog);

        if (isTablePeristenceEnabled) {
          saveLogInRedux(rqLog);
        } else {
          upsertNetworkLogMap(rqLog);
        }
      }
    });

    return () => {
      if (window.RQ && window.RQ.DESKTOP) {
        // TODO: Remove this ipc when all of the users are shifted to new version 1.4.0
        window.RQ.DESKTOP.SERVICES.IPC.unregisterEvent("log-network-request");
        window.RQ.DESKTOP.SERVICES.IPC.unregisterEvent("log-network-request-v2");
      }
    };
  }, [upsertNetworkLogMap, printLogsToConsole, saveLogInRedux, isTablePeristenceEnabled, isInterceptingTraffic]);

  useEffect(() => {
    if (window.RQ && window.RQ.DESKTOP) {
      window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("enable-request-logger").then(() => {});
    }

    return () => {
      if (window.RQ && window.RQ.DESKTOP) {
        // Disable sending logs from bg window
        window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("disable-request-logger").then(() => {});
      }
    };
  }, []);

  const getFilteredLogs = useCallback(
    (logs) => {
      const isLogFilterApplied = Object.values(logFilters).some((prop) => prop.length > 0);
      if (isLogFilterApplied) {
        return logs.filter((log) => {
          if (logFilters.statusCode.length && !logFilters.statusCode.includes(log?.response?.statusCode?.toString())) {
            return false;
          }
          if (logFilters.resourceType.length && !logFilters.resourceType.includes(log?.response?.contentType)) {
            return false;
          }
          if (logFilters.method.length && !logFilters.method.includes(log?.request?.method)) {
            return false;
          }

          return true;
        });
      }
      return null;
    },
    [logFilters]
  );

  const getSearchedLogs = useCallback(
    (logs, searchKeyword) => {
      let networkLogs = getFilteredLogs(logs) || logs;
      if (searchKeyword) {
        try {
          // TODO: @wrongsahil fix this. Special Characters are breaking the UI
          let reg = null;
          if (isRegexSearchActive) {
            reg = new RegExp(searchKeyword);
            return networkLogs.filter((log) => log.url.match(reg));
          } else {
            return networkLogs.filter((log) => log.url.includes(searchKeyword));
          }
        } catch (err) {
          Logger.log(err);
        }
      }

      return networkLogs;
    },
    [isRegexSearchActive, getFilteredLogs]
  );

  const getRequestLogs = useCallback(
    (desc = true) => {
      let logs = null;
      // Old Logs or Mobile Debugger Logs
      if (Object.keys(networkLogsMap).length > 0) {
        logs = Object.values(networkLogsMap).sort((log1, log2) => log2.timestamp - log1.timestamp);
      }
      // New Redux
      else {
        logs = newLogs;
      }
      return logs;
    },
    [networkLogsMap, newLogs]
  );

  const requestLogs = useMemo(getRequestLogs, [getRequestLogs]);

  const getDomainLogs = useCallback(() => {
    const { domainArray: domainList, domainLogs } = groupByDomain(requestLogs);
    return { domainLogs, domainList };
  }, [requestLogs]);

  const getAppLogs = useCallback(() => {
    const { appArray: appList, appLogs } = groupByApp(requestLogs);
    return { appLogs, appList };
  }, [requestLogs]);

  const upsertRequestAction = (log_id, action) => {
    let _networkLogsMap = { ...networkLogsMap };
    if (_networkLogsMap[log_id].actions) {
      _networkLogsMap[log_id].actions.push(action);
    }
    setNetworkLogsMap(_networkLogsMap);
  };

  const { appList, appLogs } = useMemo(() => getAppLogs(), [getAppLogs]);
  const { domainList, domainLogs } = useMemo(() => getDomainLogs(), [getDomainLogs]);

  const getGroupLogs = () => {
    const [logType, filter] = filterType?.split(" ") ?? [];
    const logs = (filterType ? (logType === "app" ? appLogs[filter] : domainLogs[filter]) : requestLogs) || [];
    const searchedLogs = getSearchedLogs(logs, searchKeyword);

    return (
      <GroupByNone
        requestsLog={searchedLogs}
        handleRowClick={handleRowClick}
        emptyCtaText={emptyCtaText}
        emptyCtaAction={emptyCtaAction}
        emptyDesc={emptyDesc}
        searchKeyword={searchKeyword}
      />
    );
  };

  const handleClearFilter = useCallback((e) => {
    e.stopPropagation();
    setFilterType(null);
  }, []);

  const getLogAvatar = useCallback(
    (logName = "", avatarUrl) => {
      const filter = filterType?.split(" ")?.[1] ?? [];
      const isSelected = logName === filter;

      return (
        <>
          <Tooltip mouseEnterDelay={0.3} placement="topLeft" title={logName.length >= 20 ? logName : ""}>
            <Avatar size={18} src={avatarUrl} style={{ display: "inline-block", marginRight: "4px" }} />
            <span className="log-name">{`  ${logName}`}</span>
            {isSelected && (
              <Tooltip mouseEnterDelay={0.5} placement="bottom" title="Clear filter">
                <Button
                  size="small"
                  shape="circle"
                  icon={<CloseOutlined />}
                  onClick={handleClearFilter}
                  className="clear-log-filter-btn"
                />
              </Tooltip>
            )}
          </Tooltip>
        </>
      );
    },
    [filterType, handleClearFilter]
  );

  const getApplogAvatar = useCallback(
    (logName) => {
      const logNameURI = decodeURIComponent(logName.trim());
      const avatarDomain = APPNAMES[logNameURI.split(" ")[0].toLowerCase()];
      const avatarUrl = `https://www.google.com/s2/favicons?domain=${avatarDomain}`;
      return getLogAvatar(logNameURI, avatarUrl);
    },
    [getLogAvatar]
  );

  const getDomainLogAvatar = useCallback(
    (logName) => {
      const domainParts = logName.trim().split(".");
      const avatarDomain = domainParts.splice(domainParts.length - 2, 2).join(".");
      const avatarUrl = `https://www.google.com/s2/favicons?domain=${avatarDomain}`;
      return getLogAvatar(logName, avatarUrl);
    },
    [getLogAvatar]
  );

  const getAppLogsMenuItem = useCallback(
    (apps) => {
      return getSortedMenuItems(apps, "appName").map(({ appName }) => ({
        key: `${logType.APP} ${appName}`,
        label: getApplogAvatar(appName),
        onClick: () => {
          trackSidebarFilterSelected(ANALYTIC_EVENT_SOURCE, logType.APP, appName);
        },
      }));
    },
    [getApplogAvatar]
  );

  const getDomainLogsMenuItem = useCallback(
    (domains) => {
      return getSortedMenuItems(domains, "domain").map(({ domain }) => ({
        key: `${logType.DOMAIN} ${domain}`,
        label: getDomainLogAvatar(domain),
        onClick: () => {
          trackSidebarFilterSelected(ANALYTIC_EVENT_SOURCE, logType.DOMAIN, domain);
        },
      }));
    },
    [getDomainLogAvatar]
  );

  const handleSubMenuTitleClick = useCallback(
    (key) => {
      if (expandedLogTypes.includes(key)) {
        setExpandedLogTypes((prev) => prev.filter((logType) => key !== logType));
        trackSidebarFilterCollapsed(ANALYTIC_EVENT_SOURCE, key);
      } else {
        setExpandedLogTypes((prev) => [...prev, key]);
        trackSidebarFilterExpanded(ANALYTIC_EVENT_SOURCE, key);
      }
    },
    [expandedLogTypes]
  );

  const items = useMemo(
    () => [
      {
        key: logType.APP,
        label: `Apps (${appList?.length ?? 0})`,
        children: getAppLogsMenuItem(appList),
        onTitleClick: ({ key }) => handleSubMenuTitleClick(key),
      },
      {
        key: logType.DOMAIN,
        label: `Domains (${domainList?.length ?? 0})`,
        children: getDomainLogsMenuItem(domainList),
        onTitleClick: ({ key }) => handleSubMenuTitleClick(key),
      },
    ],
    [appList, domainList, handleSubMenuTitleClick, getAppLogsMenuItem, getDomainLogsMenuItem]
  );

  const handleSidebarMenuItemClick = useCallback((e) => setFilterType(e.key), []);

  return (
    <>
      <Row wrap={false}>
        <Col flex="197px" className="traffic-table-sidebar">
          <Menu
            theme="dark"
            mode="inline"
            items={items}
            openKeys={expandedLogTypes}
            onClick={handleSidebarMenuItemClick}
            selectedKeys={filterType ? [filterType] : []}
          />
        </Col>
        <Col flex="auto">
          <Row align={"middle"}>
            <ActionHeader
              handleOnSearchChange={handleOnSearchChange}
              clearLogs={clearLogs}
              setIsSSLProxyingModalVisible={setIsSSLProxyingModalVisible}
              showDeviceSelector={showDeviceSelector}
              deviceId={deviceId}
              setIsInterceptingTraffic={setIsInterceptingTraffic}
              setIsRegexSearchActive={setIsRegexSearchActive}
              isRegexSearchActive={isRegexSearchActive}
              setLogFilters={setLogFilters}
            />
            {newLogs.length ? <Tag>{newLogs.length} requests</Tag> : null}
          </Row>
          <Split
            sizes={rulePaneSizes}
            minSize={[75, 0]}
            gutterSize={gutterSize}
            dragInterval={20}
            direction="vertical"
            cursor="row-resize"
            className="traffic-table-split-container"
          >
            <Row className="gap-case-1" style={{ overflow: "hidden" }}>
              <ProCard
                className="primary-card github-like-border network-table-wrapper-override"
                style={{
                  boxShadow: "none",
                  // borderBottom: "2px solid #f5f5f5",
                  borderRadius: "0",
                  paddingBottom: "0",
                }}
              >
                {getGroupLogs()}
              </ProCard>
            </Row>

            <Row className="request-log-pane-container" style={{ overflow: "auto", height: "100%" }}>
              <ProCard
                className="primary-card github-like-border"
                style={{
                  boxShadow: "none",
                  borderRadius: "0",
                  // borderTop: "2px solid #f5f5f5",
                }}
                bodyStyle={{ padding: "0px 20px" }}
              >
                <FixedRequestLogPane
                  selectedRequestData={{
                    ...selectedRequestData,
                    response: { ...selectedRequestData.response, body: selectedRequestResponse },
                  }}
                  upsertRequestAction={upsertRequestAction}
                  handleClosePane={handleClosePane}
                  visibility={isPreviewOpen}
                />
              </ProCard>
            </Row>
          </Split>

          {/* ssl proxying is currently hidden */}
          <SSLProxyingModal isVisible={isSSLProxyingModalVisible} setIsVisible={setIsSSLProxyingModalVisible} />
        </Col>
      </Row>
      {ruleEditorModal.isActive && (
        <RuleEditorModal
          isOpen={ruleEditorModal.isActive}
          handleModalClose={handleRuleEditorModalClose}
          analyticEventEditorViewedSource="traffic_table_right_click"
        />
      )}
    </>
  );
};

export default CurrentTrafficTable;
