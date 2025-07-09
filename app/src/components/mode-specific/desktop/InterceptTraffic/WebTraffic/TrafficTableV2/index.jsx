import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Button, Col, Tag, Menu, Row, Tooltip, Checkbox, Space } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import ProCard from "@ant-design/pro-card";
import Split from "react-split";
// import { makeOriginalLog } from "capture-console-logs";
import { getDesktopSpecificDetails } from "store/selectors";
import { getActiveModals } from "store/slices/global/modals/selectors";
import { globalActions } from "store/slices/global/slice";
import FixedRequestLogPane from "./FixedRequestLogPane";
import ActionHeader from "./ActionHeader";
import RuleEditorModal from "components/common/RuleEditorModal";
import { LogFilter } from "./LogFilter";
import GroupByNone from "./Tables/GroupByNone";
import SSLProxyingModal from "components/mode-specific/desktop/SSLProxyingModal";
import { convertProxyLogToUILog } from "./utils/logUtils";
import APPNAMES from "./Tables/GROUPBYAPP_CONSTANTS";
import { desktopTrafficTableActions } from "store/features/desktop-traffic-table/slice";
import {
  getAllFilters,
  getAllLogs,
  getAllResponses,
  getIsInterceptionPaused,
  getLogResponseById,
} from "store/features/desktop-traffic-table/selectors";
import Logger from "lib/logger";
import { getConnectedAppNames, getConnectedAppsCount } from "utils/Misc";
import { ANALYTIC_EVENT_SOURCE, logType } from "./constant";
import {
  trackTrafficInterceptionStarted,
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
import { STATUS_CODE_LABEL_ONLY_OPTIONS } from "config/constants/sub/statusCode";
import { RESOURCE_FILTER_OPTIONS, doesContentTypeMatchResourceFilter } from "config/constants/sub/resoureTypeFilters";
import { METHOD_TYPE_OPTIONS } from "config/constants/sub/methodType";
import { doesStatusCodeMatchLabels, getGraphQLOperationValues } from "./utils";
import { TRAFFIC_TABLE } from "modules/analytics/events/common/constants";
import { trackRQDesktopLastActivity } from "utils/AnalyticsUtils";
import { RQTooltip } from "lib/design-system-v2/components/RQTooltip/RQTooltip";
import * as Sentry from "@sentry/react";

const CurrentTrafficTable = ({
  logs: propLogs = [],
  emptyCtaText,
  emptyCtaAction,
  emptyDesc,
  showDeviceSelector,
  deviceId,
  clearLogsCallback,
  isStaticPreview = false,
  createMocksMode = false,
  mockResourceType,
  mockGraphQLKeys,
  selectedMockRequests,
  setSelectedMockRequests,
  showMockRequestSelector,
  disableFilters = false,
  persistLogsFilters = false,
}) => {
  const dispatch = useDispatch();
  // const navigate = useNavigate();

  const { ruleEditorModal } = useSelector(getActiveModals);
  const newLogs = useSelector(getAllLogs);
  const desktopSpecificDetails = useSelector(getDesktopSpecificDetails);
  const trafficTableFilters = useSelector(getAllFilters);
  const isInterceptingTraffic = !useSelector(getIsInterceptionPaused);

  // Component State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedRequestData, setSelectedRequestData] = useState({});
  const [rulePaneSizes, setRulePaneSizes] = useState([100, 0]);
  const [isSSLProxyingModalVisible, setIsSSLProxyingModalVisible] = useState(false);

  // const [consoleLogsShown, setConsoleLogsShown] = useState([]);
  const [expandedLogTypes, setExpandedLogTypes] = useState([]);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(true);

  const [appList, setAppList] = useState(new Set([...trafficTableFilters.app]));
  const [domainList, setDomainList] = useState(new Set([...trafficTableFilters.domain]));
  const [statusCodesFilters, setStatusCodesFilters] = useState([]);
  const [methodTypeFilters, setMethodTypeFilters] = useState([]);
  const [resourceTypeFilters, setResourceTypeFilters] = useState([]);
  const [search, setSearch] = useState({ term: "", regex: false });
  const [showOnlyModifiedRequests, setShowOnlyModifiedRequests] = useState(false);

  const mounted = useRef(false);

  const selectedRequestResponse =
    useSelector(getLogResponseById(selectedRequestData?.id)) || selectedRequestData?.response?.body;

  const isAnyAppConnected = useMemo(() => getConnectedAppsCount(Object.values(desktopSpecificDetails.appsList)) > 0, [
    desktopSpecificDetails.appsList,
  ]);

  const handleRuleEditorModalClose = useCallback(() => {
    dispatch(
      globalActions.toggleActiveModal({
        newValue: false,
        modalName: "ruleEditorModal",
      })
    );
  }, [dispatch]);

  const getGroupFiltersLength = useCallback(() => {
    return [...trafficTableFilters.app, ...trafficTableFilters.domain].length;
  }, [trafficTableFilters.app, trafficTableFilters.domain]);

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
    trackRQDesktopLastActivity(TRAFFIC_TABLE.TRAFFIC_TABLE_REQUEST_CLICKED);
  }, []);

  const handleClosePane = () => {
    handlePreviewVisibility(false);
  };

  // const printLogsToConsole = useCallback(
  //   (log) => {
  //     if (log.consoleLogs && !consoleLogsShown.includes(log.id)) {
  //       log.consoleLogs.forEach((consoleLog) => [makeOriginalLog(consoleLog)]);
  //       setConsoleLogsShown((c) => [...c, log.id]);
  //     }
  //   },
  //   [consoleLogsShown]
  // );

  const clearLogs = () => {
    // New Logs Clear
    dispatch(desktopTrafficTableActions.logResponsesClearAll());
    dispatch(desktopTrafficTableActions.logsClearAll());
    setDomainList(new Set([...trafficTableFilters.domain]));
    setAppList(new Set([...trafficTableFilters.app]));
    setIsPreviewOpen(false);
    trackTrafficTableLogsCleared(getConnectedAppsCount(Object.values(desktopSpecificDetails.appsList)) > 0);
    trackRQDesktopLastActivity(TRAFFIC_TABLE.TRAFFIC_TABLE_LOGS_CLEARED);

    if (clearLogsCallback) clearLogsCallback();
  };

  const stableDispatch = useCallback(dispatch, [dispatch]);

  const saveLogInRedux = useCallback(
    (log) => {
      if (log) {
        if (log.response?.body) {
          stableDispatch(desktopTrafficTableActions.logResponseBodyAdd(log));
          log.response.body = null; // Setting this to null so that it doesn't get saved in logs state
        }

        stableDispatch(desktopTrafficTableActions.logUpsert(log));
      }
    },
    [stableDispatch]
  );

  const updateDomainList = useCallback(
    (domain) => {
      setDomainList((prev) => new Set(prev.add(domain)));
    },
    [setDomainList]
  );

  const updateAppList = useCallback(
    (app) => {
      setAppList((prev) => new Set(prev.add(app)));
    },
    [setAppList]
  );

  const trackIfFirstLog = useCallback(
    (rqLog) => {
      if (rqLog && newLogs.length === 0) {
        const currentlyConnectedApps = getConnectedAppNames(Object.values(desktopSpecificDetails.appsList));
        trackTrafficInterceptionStarted(currentlyConnectedApps);
      }
    },
    [newLogs.length, desktopSpecificDetails.appsList]
  );

  const handleLogNetworkRequest = useCallback(
    (payload) => {
      if (isInterceptingTraffic) {
        const rqLog = convertProxyLogToUILog(payload);
        if (rqLog?.domain) {
          updateDomainList(rqLog.domain);
        }
        if (rqLog?.app) {
          updateAppList(rqLog.app);
        }
        // @wrongsahil: Disabling this for now as this is leading to rerendering of this component which is degrading the perfomance
        // printLogsToConsole(rqLog);

        trackIfFirstLog(rqLog);
        saveLogInRedux(rqLog);
      }
    },
    [isInterceptingTraffic, updateDomainList, updateAppList, trackIfFirstLog, saveLogInRedux]
  );

  useEffect(() => {
    if (window?.RQ?.DESKTOP?.SERVICES?.IPC) {
      window.RQ.DESKTOP.SERVICES.IPC.registerEvent("log-network-request-v2", handleLogNetworkRequest);
    }

    return () => {
      if (window.RQ?.DESKTOP?.SERVICES?.IPC) {
        window.RQ.DESKTOP.SERVICES.IPC.unregisterEvent("log-network-request-v2", handleLogNetworkRequest);
      }
    };
  }, [handleLogNetworkRequest]);

  useEffect(() => {
    if (window.RQ?.DESKTOP && !isStaticPreview) {
      window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("enable-request-logger");
    }

    return () => {
      if (window.RQ?.DESKTOP && !isStaticPreview) {
        // Disable sending logs from bg window
        window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("disable-request-logger");
      }
    };
  }, [isStaticPreview]);

  const activeFiltersCount = useMemo(() => {
    const countFilters = (filters) => filters.reduce((acc, curr) => acc + curr.length, 0);

    if (persistLogsFilters) {
      const { method, statusCode, resourceType } = trafficTableFilters;
      return countFilters([method, statusCode, resourceType]);
    } else {
      return countFilters([statusCodesFilters, methodTypeFilters, resourceTypeFilters]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    trafficTableFilters.method,
    trafficTableFilters.resourceType,
    trafficTableFilters.statusCode,
    statusCodesFilters,
    methodTypeFilters,
    resourceTypeFilters,
    persistLogsFilters,
  ]);

  const filterLog = useCallback(
    (log) => {
      let includeLog = true;
      const statusCodeFilter = persistLogsFilters ? trafficTableFilters.statusCode : statusCodesFilters;
      const resourceTypeFilter = persistLogsFilters ? trafficTableFilters.resourceType : resourceTypeFilters;
      const methodFilter = persistLogsFilters ? trafficTableFilters.method : methodTypeFilters;
      const searchFilter = persistLogsFilters ? trafficTableFilters.search : search;
      const modifiedRequestsFilter = persistLogsFilters
        ? trafficTableFilters.showOnlyModifiedRequests
        : showOnlyModifiedRequests;

      if (searchFilter.term) {
        const searchTerm = searchFilter.term.toLowerCase();
        const logUrl = log.url.toLowerCase();
        try {
          // TODO: @wrongsahil fix this. Special Characters are breaking the UI
          let reg = null;
          if (searchFilter.regex) {
            reg = new RegExp(searchTerm);
            includeLog = logUrl.match(reg);
          } else {
            includeLog = logUrl.includes(searchTerm);
          }
        } catch (err) {
          Logger.log(err);
        }

        if (!includeLog && log?.request?.body) {
          try {
            const body = log.request.body.toLowerCase();
            // TODO: @wrongsahil fix this. Special Characters are breaking the UI
            let reg = null;
            if (searchFilter.regex) {
              reg = new RegExp(searchTerm);
              includeLog = body.match(reg);
            } else {
              includeLog = body.includes(searchTerm);
            }
          } catch (err) {
            Logger.log(err);
          }
        }
      }

      if (!includeLog) {
        return false;
      }

      if (statusCodeFilter.length > 0 && !doesStatusCodeMatchLabels(log?.response?.statusCode, statusCodeFilter)) {
        return false;
      }
      if (
        resourceTypeFilter.length > 0 &&
        !doesContentTypeMatchResourceFilter(log?.response?.contentType, resourceTypeFilter, log)
      ) {
        return false;
      }
      if (methodFilter.length > 0 && !methodFilter.includes(log?.request?.method)) {
        return false;
      }

      if (modifiedRequestsFilter && (!log.actions || log.actions === "-" || log.actions?.length === 0)) {
        return false;
      }

      if (
        log?.domain &&
        trafficTableFilters.domain &&
        trafficTableFilters.domain.length > 0 &&
        !trafficTableFilters?.domain.includes(log?.domain)
      ) {
        return false;
      }

      if (
        log?.app &&
        trafficTableFilters.app &&
        trafficTableFilters.app.length > 0 &&
        !trafficTableFilters?.app.includes(log?.app)
      ) {
        return false;
      }

      if (createMocksMode && mockGraphQLKeys.length && mockResourceType === "graphqlApi") {
        try {
          const requestBody = JSON.parse(log?.request?.body);
          if (
            requestBody &&
            !!getGraphQLOperationValues(
              requestBody,
              mockGraphQLKeys.map((graphQLkey) => graphQLkey.key),
              mockGraphQLKeys.map((graphQLkey) => graphQLkey.value)
            )
          ) {
            return true;
          }
        } catch (e) {
          // Do nothing
        }
        return false;
      }

      return true;
    },
    [
      createMocksMode,
      mockGraphQLKeys,
      mockResourceType,
      trafficTableFilters.app,
      trafficTableFilters.domain,
      trafficTableFilters.method,
      trafficTableFilters.resourceType,
      trafficTableFilters.search,
      trafficTableFilters.statusCode,
      trafficTableFilters.showOnlyModifiedRequests,
      persistLogsFilters,
      statusCodesFilters,
      methodTypeFilters,
      resourceTypeFilters,
      search,
      showOnlyModifiedRequests,
    ]
  );

  const requestLogs = useMemo(() => {
    let logs = newLogs;
    if (propLogs?.length > 0) {
      logs = propLogs;
    }
    return logs;
  }, [newLogs, propLogs]);

  useEffect(() => {
    if (mounted.current) {
      return;
    }

    const domains = new Set();
    const apps = new Set();

    requestLogs.forEach((log) => {
      if (log?.domain) {
        domains.add(log?.domain);
      }
      if (log?.app) {
        apps.add(log?.app);
      }

      setDomainList(domains);
      setAppList(apps);
    });
  }, [requestLogs]);

  const getFilteredLogs = useCallback(
    (logs) => {
      return logs.filter(filterLog);
    },
    [filterLog]
  );

  const allResponses = useSelector(getAllResponses);
  const getResponseById = useCallback((id) => allResponses[id], [allResponses]);

  const getFilteredLogsWithResponses = useCallback(
    (logs) => {
      const filteredLogs = getFilteredLogs(logs);
      return filteredLogs.map((log) => {
        const responseBody = getResponseById(log.id) ?? log.response?.body;
        return {
          ...log,
          response: { ...log.response, body: responseBody },
        };
      });
    },
    [getFilteredLogs, getResponseById]
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
          setSelectedMockRequests={setSelectedMockRequests}
          showMockRequestSelector={showMockRequestSelector}
          selectedMockRequests={selectedMockRequests}
          showMockFilters={createMocksMode}
        />
      );
    },
    [
      getFilteredLogs,
      requestLogs,
      handleRowClick,
      emptyCtaText,
      emptyCtaAction,
      emptyDesc,
      isStaticPreview,
      setSelectedMockRequests,
      showMockRequestSelector,
      selectedMockRequests,
      createMocksMode,
    ]
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
        <RQTooltip mouseEnterDelay={0.3} placement="right" title={logName.length >= 20 ? logName : ""}>
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
        </RQTooltip>
      );
    },
    [handleClearFilter, trafficTableFilters]
  );

  const getApplogAvatar = useCallback(
    (key, logName) => {
      let logNameURI;
      try {
        logNameURI = decodeURIComponent(logName.trim());
      } catch (e) {
        Logger.log("faulty logname: ", logName);
        Sentry.captureMessage(e);
      }
      const avatarDomain = logNameURI ? APPNAMES[logNameURI.split(" ")[0].toLowerCase()] : "randooooom.com"; // random domain to show the 404-like icon
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
      return Array.from(apps)
        .sort()
        .map((appName) => ({
          key: `${appName}`,
          label: getApplogAvatar(`${logType.APP}`, appName),
          onClick: () => {
            trackSidebarFilterSelected(ANALYTIC_EVENT_SOURCE, logType.APP, appName);
            trackRQDesktopLastActivity(TRAFFIC_TABLE.SIDEBAR_FILTER_SELECTED);
          },
        }));
    },
    [getApplogAvatar]
  );

  const getDomainLogsMenuItem = useCallback(
    (domains) => {
      return Array.from(domains)
        .sort()
        .map((domain) => ({
          key: `${domain}`,
          label: getDomainLogAvatar(`${logType.DOMAIN}`, domain),
          onClick: () => {
            trackSidebarFilterSelected(ANALYTIC_EVENT_SOURCE, logType.DOMAIN, domain);
            trackRQDesktopLastActivity(TRAFFIC_TABLE.SIDEBAR_FILTER_SELECTED);
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
        label: `Apps (${appList?.size ?? 0})`,
        children: getAppLogsMenuItem(appList),
        onTitleClick: ({ key }) => handleSubMenuTitleClick(key),
      },
      {
        key: logType.DOMAIN,
        label: `Domains (${domainList?.size ?? 0})`,
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
    const logsToExport = getFilteredLogsWithResponses(requestLogs);
    return createLogsHar(logsToExport);
  }, [getFilteredLogsWithResponses, requestLogs]);

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

  const clearAllFilters = useCallback(() => {
    if (persistLogsFilters) {
      dispatch(desktopTrafficTableActions.clearColumnFilters());
    } else {
      setStatusCodesFilters([]);
      setMethodTypeFilters([]);
      setResourceTypeFilters([]);
      setShowOnlyModifiedRequests(false);
    }
  }, [dispatch, persistLogsFilters]);

  const clearSearchFilter = useCallback(() => {
    if (persistLogsFilters) {
      dispatch(desktopTrafficTableActions.updateSearchTerm(""));
    } else {
      setSearch({ term: "", regex: false });
    }
  }, [dispatch, persistLogsFilters]);

  useEffect(() => {
    if (disableFilters) {
      clearAllFilters();
      clearSearchFilter();
      setIsFiltersCollapsed(true);
    }
  }, [clearAllFilters, clearSearchFilter, disableFilters]);

  // IMP: Keep this in the end to wait for other useEffects to run first
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <>
      <Row wrap={false} className="traffic-table-container-row">
        {isStaticPreview ? null : (
          <Col
            flex="224px"
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
        )}
        <Col flex="auto" className="traffic-table-content">
          <Row align={"middle"}>
            <ActionHeader
              deviceId={deviceId}
              clearLogs={clearLogs}
              logsCount={requestLogs.length}
              filteredLogsCount={requestLogs.length}
              isAnyAppConnected={isAnyAppConnected}
              isStaticPreview={isStaticPreview}
              activeFiltersCount={activeFiltersCount}
              logsToSaveAsHar={stableGetLogsToExport}
              isFiltersCollapsed={isFiltersCollapsed}
              showDeviceSelector={showDeviceSelector}
              setIsFiltersCollapsed={setIsFiltersCollapsed}
              setIsSSLProxyingModalVisible={setIsSSLProxyingModalVisible}
              disableFilters={disableFilters}
              search={search}
              setSearch={setSearch}
              persistLogsSearch={persistLogsFilters}
            >
              <Tag>{requestLogs.length} requests</Tag>
            </ActionHeader>
          </Row>

          <div className="traffic-table-filters-container">
            {!isFiltersCollapsed && (
              <Row>
                <section>
                  <Space align="end" size={12}>
                    <LogFilter
                      filterId="filter-method"
                      filterLabel="Method"
                      filterPlaceholder="Filter by method"
                      options={METHOD_TYPE_OPTIONS}
                      value={persistLogsFilters ? trafficTableFilters.method : methodTypeFilters}
                      handleFilterChange={(options) => {
                        if (persistLogsFilters) {
                          dispatch(desktopTrafficTableActions.updateFilters({ method: options }));
                        } else {
                          setMethodTypeFilters(options);
                        }
                        trackTrafficTableFilterApplied("method", options, options?.length);
                      }}
                    />
                    <LogFilter
                      filterId="filter-status-code"
                      filterLabel="Status code"
                      filterPlaceholder="Filter by status code"
                      options={STATUS_CODE_LABEL_ONLY_OPTIONS}
                      value={persistLogsFilters ? trafficTableFilters.statusCode : statusCodesFilters}
                      handleFilterChange={(options) => {
                        if (persistLogsFilters) {
                          dispatch(desktopTrafficTableActions.updateFilters({ statusCode: options }));
                        } else {
                          setStatusCodesFilters(options);
                        }
                        trackTrafficTableFilterApplied("status_code", options, options?.length);
                      }}
                    />
                    <LogFilter
                      filterId="filter-resource-type"
                      filterLabel="Resource type"
                      filterPlaceholder="Filter by resource type"
                      options={RESOURCE_FILTER_OPTIONS}
                      value={persistLogsFilters ? trafficTableFilters.resourceType : resourceTypeFilters}
                      handleFilterChange={(options) => {
                        if (persistLogsFilters) {
                          dispatch(desktopTrafficTableActions.updateFilters({ resourceType: options }));
                        } else {
                          setResourceTypeFilters(options);
                        }
                        trackTrafficTableFilterApplied("resource_type", options, options?.length);
                      }}
                    />
                    <Checkbox
                      checked={
                        persistLogsFilters ? trafficTableFilters.showOnlyModifiedRequests : showOnlyModifiedRequests
                      }
                      onChange={(e) => {
                        if (persistLogsFilters) {
                          dispatch(
                            desktopTrafficTableActions.updateFilters({
                              showOnlyModifiedRequests: e.target.checked,
                            })
                          );
                        } else {
                          setShowOnlyModifiedRequests(e.target.checked);
                        }
                        trackTrafficTableFilterApplied("modified_requests", e.target.checked);
                      }}
                      className="modified-requests-checkbox"
                    >
                      Modified requests
                    </Checkbox>
                  </Space>
                </section>
                <Button type="link" className="clear-logs-filter-btn" onClick={clearAllFilters}>
                  Clear all
                </Button>
              </Row>
            )}
          </div>

          <div className={!isPreviewOpen ? "hide-traffic-table-split-gutter" : ""}>
            {/* TODO: use <SplitPaneLayout/> component */}
            <Split
              sizes={rulePaneSizes}
              minSize={[75, 0]}
              gutterSize={4}
              direction="vertical"
              cursor="row-resize"
              className="traffic-table-split-container"
            >
              <Row className="gap-case-1" style={{ overflow: "hidden" }}>
                <ProCard
                  className="primary-card github-like-border network-table-wrapper-override"
                  style={{
                    height: "-webkit-fill-available",
                    boxShadow: "none",
                    // borderBottom: "2px solid #f5f5f5",
                    borderRadius: "0",
                    paddingBottom: "0",
                  }}
                >
                  {renderLogs()}
                </ProCard>
              </Row>

              <Row className="request-log-pane-container" style={{ overflow: "hidden", height: "100%" }}>
                <ProCard
                  className="primary-card github-like-border h-full"
                  style={{
                    boxShadow: "none",
                    borderRadius: "0",
                  }}
                  bodyStyle={{ padding: "0px 20px" }}
                >
                  <FixedRequestLogPane
                    selectedRequestData={{
                      ...selectedRequestData,
                      response: { ...selectedRequestData.response, body: selectedRequestResponse },
                    }}
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
