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
import { LogFilter } from "./LogFilter";
import { groupByApp, groupByDomain } from "../../../../../../utils/TrafficTableUtils";
import GroupByNone from "./Tables/GroupByNone";
import SSLProxyingModal from "components/mode-specific/desktop/SSLProxyingModal";
import { convertProxyLogToUILog, getSortedMenuItems } from "./utils/logUtils";
import APPNAMES from "./Tables/GROUPBYAPP_CONSTANTS";
import { desktopTrafficTableActions } from "store/features/desktop-traffic-table/slice";
import { getAllFilters, getAllLogs, getLogResponseById } from "store/features/desktop-traffic-table/selectors";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import Logger from "lib/logger";
import { getConnectedAppsCount } from "utils/Misc";
import { ANALYTIC_EVENT_SOURCE, logType } from "./constant";
import {
  trackTrafficTableFilterApplied,
  trackTrafficTableLogsCleared,
  trackTrafficTableRequestClicked,
} from "modules/analytics/events/desktopApp";
import {
  trackSidebarFilterCollapsed,
  trackSidebarFilterExpanded,
  trackSidebarFilterSelected,
  trackSidebarFilterClearAllClicked,
} from "modules/analytics/events/common/traffic-table";
import "./css/draggable.css";
import "./TrafficTableV2.css";
import { createLogsHar } from "../TrafficExporter/harLogs/converter";
import { STATUS_CODE_ONLY_OPTIONS } from "config/constants/sub/statusCode";
import { CONTENT_TYPE_OPTIONS } from "config/constants/sub/contentType";
import { METHOD_TYPE_OPTIONS } from "config/constants/sub/methodType";
import { RQButton } from "lib/design-system/components";

const CurrentTrafficTable = ({
  logs: propLogs = [],
  emptyCtaText,
  emptyCtaAction,
  emptyDesc,
  showDeviceSelector,
  deviceId,
  clearLogsCallback,
  isStaticPreview = false,
}) => {
  const GUTTER_SIZE = 20;
  const gutterSize = GUTTER_SIZE;
  const dispatch = useDispatch();
  const { ruleEditorModal } = useSelector(getActiveModals);
  const newLogs = useSelector(getAllLogs);
  const desktopSpecificDetails = useSelector(getDesktopSpecificDetails);
  const trafficTableFilters = useSelector(getAllFilters);

  const isTablePeristenceEnabled = useFeatureIsOn("traffic_table_perisitence");

  const previousLogsRef = useRef(propLogs);

  // Component State
  const [networkLogsMap, setNetworkLogsMap] = useState({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedRequestData, setSelectedRequestData] = useState({});
  const [rulePaneSizes, setRulePaneSizes] = useState([100, 0]);
  const [isSSLProxyingModalVisible, setIsSSLProxyingModalVisible] = useState(false);

  const [isInterceptingTraffic, setIsInterceptingTraffic] = useState(true);

  const selectedRequestResponse =
    useSelector(getLogResponseById(selectedRequestData?.id)) || selectedRequestData?.response?.body;

  const [consoleLogsShown, setConsoleLogsShown] = useState([]);
  const [expandedLogTypes, setExpandedLogTypes] = useState([]);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(true);

  const isAppsConnected = useMemo(() => getConnectedAppsCount(Object.values(desktopSpecificDetails.appsList)) > 0, [
    desktopSpecificDetails.appsList,
  ]);

  const handleRuleEditorModalClose = useCallback(() => {
    dispatch(
      actions.toggleActiveModal({
        newValue: false,
        modalName: "ruleEditorModal",
      })
    );
  }, [dispatch]);

  const getGroupFiltersLength = useCallback(() => {
    return [...trafficTableFilters.app, ...trafficTableFilters.domain].length;
  }, [trafficTableFilters.app, trafficTableFilters.domain]);

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
    if (!isEqual(sortBy(previousLogsRef.current), sortBy(propLogs))) {
      stableUpsertLogs(propLogs);
      previousLogsRef.current = propLogs;
    }
  }, [propLogs, stableUpsertLogs]);

  const handlePreviewVisibility = (visible = false) => {
    setIsPreviewOpen(visible);

    if (visible) {
      setRulePaneSizes([55, 45]);
      return;
    }

    setRulePaneSizes([100, 0]);
  };

  const handleRowClick = useCallback((row) => {
    setSelectedRequestData(row);
    handlePreviewVisibility(true);
    trackTrafficTableRequestClicked();
  }, []);

  const handleClosePane = () => {
    handlePreviewVisibility(false);
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

        // @wrongsahil: Disabling this for now as this is leading to rerendering of this component which is degrading the perfomance
        // printLogsToConsole(rqLog);

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
    if (window.RQ && window.RQ.DESKTOP && !isStaticPreview) {
      window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("enable-request-logger").then(() => {});
    }

    return () => {
      if (window.RQ && window.RQ.DESKTOP && !isStaticPreview) {
        // Disable sending logs from bg window
        window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("disable-request-logger").then(() => {});
      }
    };
  }, [isStaticPreview]);

  const activeFiltersCount = useMemo(
    () => [...trafficTableFilters.method, ...trafficTableFilters.statusCode, ...trafficTableFilters.contentType].length,
    [trafficTableFilters.method, trafficTableFilters.contentType, trafficTableFilters.statusCode]
  );

  const filterLog = useCallback(
    (log) => {
      let includeLog = true;

      if (trafficTableFilters.search.term) {
        const searchTerm = trafficTableFilters.search.term;
        try {
          // TODO: @wrongsahil fix this. Special Characters are breaking the UI
          let reg = null;
          if (trafficTableFilters.search.regex) {
            reg = new RegExp(searchTerm);
            includeLog = log.url.match(reg);
          } else {
            includeLog = log.url.includes(searchTerm);
          }
        } catch (err) {
          Logger.log(err);
        }
      }

      if (!includeLog) {
        return false;
      }

      if (
        trafficTableFilters.statusCode.length > 0 &&
        !trafficTableFilters.statusCode.includes(log?.response?.statusCode?.toString())
      ) {
        return false;
      }
      if (
        trafficTableFilters.contentType.length > 0 &&
        !trafficTableFilters.contentType.includes(log?.response?.contentType)
      ) {
        return false;
      }
      if (trafficTableFilters.method.length > 0 && !trafficTableFilters.method.includes(log?.request?.method)) {
        return false;
      }

      return true;
    },
    [
      trafficTableFilters.method,
      trafficTableFilters.contentType,
      trafficTableFilters.search.regex,
      trafficTableFilters.search.term,
      trafficTableFilters.statusCode,
    ]
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
        logs = isStaticPreview ? propLogs : newLogs;
      }
      return logs;
    },
    [isStaticPreview, networkLogsMap, newLogs, propLogs]
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

  const getGroupedLogs = useCallback(() => {
    const groupedLogs = [];
    trafficTableFilters.app.forEach((app) => {
      appLogs[app] && groupedLogs.push(...appLogs[app]);
    });
    trafficTableFilters.domain.forEach((domain) => {
      domainLogs[domain] && groupedLogs.push(...domainLogs[domain]);
    });

    return groupedLogs;
  }, [appLogs, domainLogs, trafficTableFilters.app, trafficTableFilters.domain]);

  const getFilteredLogs = useCallback(
    (logs) => {
      const groupedLogs = getGroupedLogs();
      const allLogs = groupedLogs.length > 0 ? groupedLogs : logs;

      // remove logs with same id
      const prunedLogs = allLogs.reduce((result, log) => ({ ...result, [log.id]: log }), {});
      const prunedLogsArray = Object.values(prunedLogs);

      return prunedLogsArray.filter(filterLog);
    },
    [filterLog, getGroupedLogs]
  );

  const renderLogs = useMemo(
    () => () => {
      const logsToRender = getFilteredLogs(requestLogs);

      return (
        <GroupByNone
          requestsLog={logsToRender}
          handleRowClick={handleRowClick}
          emptyCtaText={emptyCtaText}
          emptyCtaAction={emptyCtaAction}
          emptyDesc={emptyDesc}
          isStaticPreview={isStaticPreview}
        />
      );
    },
    [emptyCtaAction, emptyCtaText, emptyDesc, getFilteredLogs, handleRowClick, isStaticPreview, requestLogs]
  );

  const handleClearFilter = useCallback(
    (e, key, domain) => {
      e.stopPropagation();
      dispatch(desktopTrafficTableActions.removeGroupFilter({ key, domain }));
    },
    [dispatch]
  );

  const getLogAvatar = useCallback(
    (key, logName = "", avatarUrl) => {
      const isSelected = trafficTableFilters[key].includes(logName);

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
                  onClick={(e) => handleClearFilter(e, key, logName)}
                  className="clear-log-filter-btn"
                />
              </Tooltip>
            )}
          </Tooltip>
        </>
      );
    },
    [handleClearFilter, trafficTableFilters]
  );

  const getApplogAvatar = useCallback(
    (key, logName) => {
      const logNameURI = decodeURIComponent(logName.trim());
      const avatarDomain = APPNAMES[logNameURI.split(" ")[0].toLowerCase()];
      const avatarUrl = `https://www.google.com/s2/favicons?domain=${avatarDomain}`;
      return getLogAvatar(key, logNameURI, avatarUrl);
    },
    [getLogAvatar]
  );

  const getDomainLogAvatar = useCallback(
    (key, logName) => {
      const domainParts = logName.trim().split(".");
      const avatarDomain = domainParts.splice(domainParts.length - 2, 2).join(".");
      const avatarUrl = `https://www.google.com/s2/favicons?domain=${avatarDomain}`;
      return getLogAvatar(key, logName, avatarUrl);
    },
    [getLogAvatar]
  );

  const getAppLogsMenuItem = useCallback(
    (apps) => {
      return getSortedMenuItems(apps, "appName").map(({ appName }) => ({
        key: `${appName}`,
        label: getApplogAvatar(`${logType.APP}`, appName),
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
        key: `${domain}`,
        label: getDomainLogAvatar(`${logType.DOMAIN}`, domain),
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

  const items = useMemo(() => {
    return [
      {
        key: "clear_all",
        label: (
          <span className="clear-all-filter-option">
            Clear all <CloseOutlined style={{ marginLeft: "8px" }} />
          </span>
        ),
        onClick: () => {
          dispatch(desktopTrafficTableActions.clearGroupFilters());
          trackSidebarFilterClearAllClicked(ANALYTIC_EVENT_SOURCE, getGroupFiltersLength());
        },
      },
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
    ];
  }, [
    appList,
    getAppLogsMenuItem,
    domainList,
    getDomainLogsMenuItem,
    dispatch,
    getGroupFiltersLength,
    handleSubMenuTitleClick,
  ]);

  const stableGetLogsToExport = useMemo(() => {
    const logsToExport = getFilteredLogs(newLogs);
    return createLogsHar(logsToExport);
  }, [getFilteredLogs, newLogs]);

  const handleSidebarMenuItemClick = useCallback(
    (e) => {
      if (e.key === "clear_all") return;
      dispatch(
        desktopTrafficTableActions.addGroupFilters({
          key: e.keyPath[1],
          value: e.keyPath[0],
        })
      );
    },
    [dispatch]
  );

  return (
    <>
      <Row wrap={false}>
        <Col
          flex="197px"
          style={getGroupFiltersLength() > 0 ? { paddingTop: "8px" } : {}}
          className="traffic-table-sidebar"
        >
          <Menu
            theme="dark"
            mode="inline"
            items={items}
            openKeys={expandedLogTypes}
            onClick={handleSidebarMenuItemClick}
            selectedKeys={[...trafficTableFilters.app, ...trafficTableFilters.domain]}
            className={getGroupFiltersLength() > 0 ? "filter-applied" : ""}
          />
        </Col>
        <Col flex="auto">
          <Row align={"middle"}>
            <ActionHeader
              deviceId={deviceId}
              clearLogs={clearLogs}
              logsCount={newLogs.length}
              isAppsConnected={isAppsConnected}
              isStaticPreview={isStaticPreview}
              activeFiltersCount={activeFiltersCount}
              logsToSaveAsHar={stableGetLogsToExport}
              isFiltersCollapsed={isFiltersCollapsed}
              showDeviceSelector={showDeviceSelector}
              setIsFiltersCollapsed={setIsFiltersCollapsed}
              setIsInterceptingTraffic={setIsInterceptingTraffic}
              setIsSSLProxyingModalVisible={setIsSSLProxyingModalVisible}
            />
            {isStaticPreview ? (
              <Tag>{propLogs.length} requests</Tag>
            ) : newLogs.length ? (
              <Tag>{newLogs.length} requests</Tag>
            ) : null}
          </Row>
          {!isFiltersCollapsed && (
            <Row className="traffic-table-filters-container">
              <section>
                <LogFilter
                  filterId="filter-method"
                  filterLabel="Method"
                  filterPlaceholder="Filter by method"
                  options={METHOD_TYPE_OPTIONS}
                  value={trafficTableFilters.method}
                  handleFilterChange={(options) => {
                    dispatch(desktopTrafficTableActions.updateFilters({ method: options }));
                    trackTrafficTableFilterApplied("method", options, options?.length);
                  }}
                />
                <LogFilter
                  filterId="filter-status-code"
                  filterLabel="Status code"
                  filterPlaceholder="Filter by status code"
                  options={STATUS_CODE_ONLY_OPTIONS}
                  value={trafficTableFilters.statusCode}
                  handleFilterChange={(options) => {
                    dispatch(desktopTrafficTableActions.updateFilters({ statusCode: options }));
                    trackTrafficTableFilterApplied("status_code", options, options?.length);
                  }}
                />
                <LogFilter
                  filterId="filter-resource-type"
                  filterLabel="Content type"
                  filterPlaceholder="Filter by content type"
                  options={CONTENT_TYPE_OPTIONS}
                  value={trafficTableFilters.contentType}
                  handleFilterChange={(options) => {
                    dispatch(desktopTrafficTableActions.updateFilters({ contentType: options }));
                    trackTrafficTableFilterApplied("content_type", options, options?.length);
                  }}
                />
              </section>
              <RQButton
                type="primary"
                className="clear-logs-filter-btn"
                onClick={() => {
                  dispatch(desktopTrafficTableActions.clearColumnFilters());
                }}
              >
                Clear
              </RQButton>
            </Row>
          )}
          <div className={!isPreviewOpen && "hide-traffic-table-split-gutter"}>
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
                  {renderLogs()}
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
          </div>

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
