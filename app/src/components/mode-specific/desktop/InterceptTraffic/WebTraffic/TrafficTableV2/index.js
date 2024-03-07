import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Button, Col, Tag, Menu, Row, Tooltip, Space, Typography, Popconfirm, Modal } from "antd";
import { CheckCircleOutlined, CloseOutlined, DownOutlined } from "@ant-design/icons";
import ProCard from "@ant-design/pro-card";
import Split from "react-split";
import { makeOriginalLog } from "capture-console-logs";
import { getActiveModals, getAppMode, getDesktopSpecificDetails } from "store/selectors";
import { actions } from "store";
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
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
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
import { STATUS_CODE_LABEL_ONLY_OPTIONS } from "config/constants/sub/statusCode";
import { RESOURCE_FILTER_OPTIONS, doesContentTypeMatchResourceFilter } from "config/constants/sub/resoureTypeFilters";
import { METHOD_TYPE_OPTIONS } from "config/constants/sub/methodType";
import {
  createResponseMock,
  doesStatusCodeMatchLabels,
  getGraphQLOperationValues,
  getOrCreateSessionGroup,
} from "./utils";
import { TRAFFIC_TABLE } from "modules/analytics/events/common/constants";
import { trackRQDesktopLastActivity } from "utils/AnalyticsUtils";
import { redirectToRules } from "utils/RedirectionUtils";
import { RQButton, RQDropdown } from "lib/design-system/components";
import CreatableSelect from "react-select/creatable";
import { getSessionName, getSessionId } from "store/features/network-sessions/selectors";
import { StorageService } from "init";
import { toast } from "utils/Toast";
import { useNavigate } from "react-router-dom";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import {
  trackMockResponsesCreateRulesClicked,
  trackMockResponsesGraphQLKeyEntered,
  trackMockResponsesResourceTypeSelected,
  trackMockResponsesRuleCreationCompleted,
  trackMockResponsesRuleCreationFailed,
  trackMockResponsesRuleCreationStarted,
  trackMockResponsesTargetingSelecting,
  trackMockResponsesViewNowClicked,
} from "modules/analytics/events/features/sessionRecording/mockResponseFromSession";

const CurrentTrafficTable = ({
  logs: propLogs = [],
  emptyCtaText,
  emptyCtaAction,
  emptyDesc,
  showDeviceSelector,
  deviceId,
  clearLogsCallback,
  isStaticPreview = false,
  createMocksMode,
  mockResourceType,
  mockGraphQLKeys,
  selectedMockRequests,
  setSelectedMockRequests,
}) => {
  const GUTTER_SIZE = 20;
  const gutterSize = GUTTER_SIZE;
  const dispatch = useDispatch();
  // const navigate = useNavigate();

  const { ruleEditorModal } = useSelector(getActiveModals);
  const newLogs = useSelector(getAllLogs);
  const desktopSpecificDetails = useSelector(getDesktopSpecificDetails);
  const trafficTableFilters = useSelector(getAllFilters);
  const isInterceptingTraffic = !useSelector(getIsInterceptionPaused);
  const networkSessionId = useSelector(getSessionId);
  const sessionName = useSelector(getSessionName);
  const appMode = useSelector(getAppMode);

  // Component State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedRequestData, setSelectedRequestData] = useState({});
  const [rulePaneSizes, setRulePaneSizes] = useState([100, 0]);
  const [isSSLProxyingModalVisible, setIsSSLProxyingModalVisible] = useState(false);

  const [consoleLogsShown, setConsoleLogsShown] = useState([]);
  const [expandedLogTypes, setExpandedLogTypes] = useState([]);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(true);

  // const [selectedMockRequests, setSelectedMockRequests] = useState({});
  // const [showMockFilters, setShowMockFilters] = useState(false);
  // const [mockMatcher, setMockMatcher] = useState(null);
  // const [mockGraphQLKeys, setMockGraphQLKeys] = useState([]);
  const [showMockRequestSelector, setShowMockRequestSelector] = useState(false);
  const [isMockRequestSelectorDisabled, setIsMockRequestSelectorDisabled] = useState(false);

  const [appList, setAppList] = useState(new Set([...trafficTableFilters.app]));
  const [domainList, setDomainList] = useState(new Set([...trafficTableFilters.domain]));
  const mounted = useRef(false);

  const selectedRequestResponse =
    useSelector(getLogResponseById(selectedRequestData?.id)) || selectedRequestData?.response?.body;

  const isAnyAppConnected = useMemo(
    () => getConnectedAppsCount(Object.values(desktopSpecificDetails.appsList)) > 0,
    [desktopSpecificDetails.appsList]
  );

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
    // New Logs Clear
    dispatch(desktopTrafficTableActions.logResponsesClearAll());
    dispatch(desktopTrafficTableActions.logsClearAll());
    setDomainList(new Set([...trafficTableFilters.domain]));
    setAppList(new Set([...trafficTableFilters.app]));
    trackTrafficTableLogsCleared(getConnectedAppsCount(Object.values(desktopSpecificDetails.appsList)) > 0);
    trackRQDesktopLastActivity(TRAFFIC_TABLE.TRAFFIC_TABLE_LOGS_CLEARED);

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

  useEffect(() => {
    window?.RQ?.DESKTOP.SERVICES.IPC.registerEvent("log-network-request-v2", (payload) => {
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

        saveLogInRedux(rqLog);
      }
    });

    return () => {
      if (window.RQ && window.RQ.DESKTOP) {
        window.RQ.DESKTOP.SERVICES.IPC.unregisterEvent("log-network-request-v2");
      }
    };
  }, [printLogsToConsole, saveLogInRedux, isInterceptingTraffic, updateDomainList, updateAppList]);

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
    () =>
      [...trafficTableFilters.method, ...trafficTableFilters.statusCode, ...trafficTableFilters.resourceType].length,
    [trafficTableFilters.method, trafficTableFilters.resourceType, trafficTableFilters.statusCode]
  );

  const filterLog = useCallback(
    (log) => {
      let includeLog = true;

      if (trafficTableFilters.search.term) {
        const searchTerm = trafficTableFilters.search.term.toLowerCase();
        const logUrl = log.url.toLowerCase();
        try {
          // TODO: @wrongsahil fix this. Special Characters are breaking the UI
          let reg = null;
          if (trafficTableFilters.search.regex) {
            reg = new RegExp(searchTerm);
            includeLog = logUrl.match(reg);
          } else {
            includeLog = logUrl.includes(searchTerm);
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
        !doesStatusCodeMatchLabels(log?.response?.statusCode, trafficTableFilters.statusCode)
      ) {
        return false;
      }
      if (
        trafficTableFilters.resourceType.length > 0 &&
        !doesContentTypeMatchResourceFilter(log?.response?.contentType, trafficTableFilters.resourceType)
      ) {
        return false;
      }
      if (trafficTableFilters.method.length > 0 && !trafficTableFilters.method.includes(log?.request?.method)) {
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

      if (mockGraphQLKeys.length && mockResourceType === "graphqlApi") {
        try {
          const requestBody = JSON.parse(log?.request?.body);
          if (requestBody && !!getGraphQLOperationValues(requestBody, mockGraphQLKeys)) {
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
      mockGraphQLKeys,
      mockResourceType,
      trafficTableFilters.app,
      trafficTableFilters.domain,
      trafficTableFilters.method,
      trafficTableFilters.resourceType,
      trafficTableFilters.search.regex,
      trafficTableFilters.search.term,
      trafficTableFilters.statusCode,
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

    requestLogs.map((log) => {
      if (log?.domain) {
        domains.add(log?.domain);
      }
      if (log?.app) {
        apps.add(log?.app);
      }

      setDomainList(domains);
      setAppList(apps);

      return null;
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
          isMockRequestSelectorDisabled={isMockRequestSelectorDisabled}
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
      isMockRequestSelectorDisabled,
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

  const resetMockResponseState = useCallback(() => {
    setShowMockRequestSelector(false);
    // setMockGraphQLKeys([]);
    // setSelectedMockRequests({});
    // setMockResourceType(null);
    // setMockMatcher(null);
  }, []);

  useEffect(() => {
    if (isStaticPreview && createMocksMode) {
      setShowMockRequestSelector(true);
      if (!mockResourceType) {
        setIsMockRequestSelectorDisabled(true);
      } else if (mockResourceType === "graphqlApi") {
        setIsMockRequestSelectorDisabled(mockGraphQLKeys.length === 0);
      } else {
        setIsMockRequestSelectorDisabled(false);
      }
    } else {
      resetMockResponseState();
    }
  }, [isStaticPreview, mockGraphQLKeys?.length, mockResourceType, resetMockResponseState, createMocksMode]);

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
            >
              <Tag>{requestLogs.length} requests</Tag>
            </ActionHeader>
          </Row>

          <div className="traffic-table-filters-container">
            <>
              {!isFiltersCollapsed && (
                <Row>
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
                      options={STATUS_CODE_LABEL_ONLY_OPTIONS}
                      value={trafficTableFilters.statusCode}
                      handleFilterChange={(options) => {
                        dispatch(desktopTrafficTableActions.updateFilters({ statusCode: options }));
                        trackTrafficTableFilterApplied("status_code", options, options?.length);
                      }}
                    />
                    <LogFilter
                      filterId="filter-resource-type"
                      filterLabel="Resource type"
                      filterPlaceholder="Filter by resource type"
                      options={RESOURCE_FILTER_OPTIONS}
                      value={trafficTableFilters.resourceType}
                      handleFilterChange={(options) => {
                        dispatch(desktopTrafficTableActions.updateFilters({ resourceType: options }));
                        trackTrafficTableFilterApplied("resource_type", options, options?.length);
                      }}
                    />
                  </section>
                  <Button
                    type="link"
                    className="clear-logs-filter-btn"
                    onClick={() => {
                      dispatch(desktopTrafficTableActions.clearColumnFilters());
                    }}
                  >
                    Clear all
                  </Button>
                </Row>
              )}
              {/* {isMockResponseFromSessionEnabled && createMocksMode && (
                <Row justify={"space-between"} align={"middle"}>
                  <Space size={12}>
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
                          resetMockResponseState();
                          setMockResourceType(item.key);
                          trackMockResponsesResourceTypeSelected(item.key);
                        },
                      }}
                      trigger={["click"]}
                      className="display-inline-block"
                      overlayStyle={{ fontSize: "10px" }}
                    >
                      <Typography.Text className="cursor-pointer" onClick={(e) => e.preventDefault()}>
                        {mockResourceType
                          ? mockResourceType === "restApi"
                            ? "HTTP (REST, JS, CSS)"
                            : "GraphQL API"
                          : "Select Resource Type"}{" "}
                        <DownOutlined />
                      </Typography.Text>
                    </RQDropdown>
                    <RQDropdown
                      menu={{
                        items: [
                          {
                            key: GLOBAL_CONSTANTS.RULE_KEYS.URL,
                            label: (
                              <Tooltip title="Ideal for targeting specific and complete URLs." placement="right">
                                Match entire URL
                              </Tooltip>
                            ),
                          },
                          {
                            key: GLOBAL_CONSTANTS.RULE_KEYS.PATH,
                            label: (
                              <Tooltip title="Ideal for matching across different domains" placement="right">
                                Match only path
                              </Tooltip>
                            ),
                          },
                          {
                            key: "path_query",
                            label: (
                              <Tooltip
                                title="Ideal for cases where param values in URL are crucial for matching"
                                placement="right"
                              >
                                Match path & query params
                              </Tooltip>
                            ),
                          },
                        ],
                        selectedKeys: mockMatcher ? [mockMatcher] : [],
                        selectable: true,
                        onSelect: (item) => {
                          setMockMatcher(item.key);
                          trackMockResponsesTargetingSelecting(item.key);
                        },
                      }}
                      trigger={["click"]}
                      className="display-inline-block"
                    >
                      <Typography.Text className="cursor-pointer" onClick={(e) => e.preventDefault()}>
                        {mockMatcher
                          ? mockMatcher === GLOBAL_CONSTANTS.RULE_KEYS.URL
                            ? "Match entire URL"
                            : mockMatcher === GLOBAL_CONSTANTS.RULE_KEYS.PATH
                            ? "Match only path"
                            : "Match path & query params"
                          : "Select Matching Condition"}{" "}
                        <DownOutlined />
                      </Typography.Text>
                    </RQDropdown>
                    {mockResourceType === "graphqlApi" && (
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
                        isValidNewOption={(string) => string}
                        noOptionsMessage={() => null}
                        formatCreateLabel={() => "Hit Enter to add"}
                        placeholder={"Enter graphQL keys"}
                        onChange={(selectors) => {
                          trackMockResponsesGraphQLKeyEntered(selectors.map((selector) => selector.value));
                          setMockGraphQLKeys(selectors.map((selector) => selector.value));
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
                    )}
                  </Space>
                  <Popconfirm
                    title={`Create rules for the ${selectedRequestsLength} selected ${
                      selectedRequestsLength > 1 ? "requests" : "request"
                    }?`}
                    onConfirm={() => {
                      createMockResponses();
                    }}
                    okText="Yes"
                    cancelText="No"
                    placement="topLeft"
                    disabled={
                      !mockMatcher ||
                      !mockResourceType ||
                      selectedRequestsLength === 0 ||
                      (mockResourceType === "graphqlApi" && mockGraphQLKeys.length === 0)
                    }
                    destroyTooltipOnHide
                    trigger={["click"]}
                  >
                    <Tooltip
                      title={selectedRequestsLength === 0 ? "Please select requests to proceed" : ""}
                      destroyTooltipOnHide
                      trigger={["hover"]}
                    >
                      <RQButton
                        type="primary"
                        disabled={selectedRequestsLength === 0}
                        onClick={() => {
                          trackMockResponsesCreateRulesClicked(selectedRequestsLength);
                          if (!mockResourceType) {
                            toast.error("Please select resource type to create mock rules");
                            return;
                          }

                          if (!mockMatcher) {
                            toast.error("Please select matching condition to create mock rules");
                            return;
                          }

                          if (mockResourceType === "graphqlApi" && mockGraphQLKeys.length === 0) {
                            toast.error("Please enter at least one operation key to create mock rules");
                            return;
                          }
                        }}
                      >
                        <Space>
                          Create Mock Rules
                          <div className="mock-rules-count-badge">{selectedRequestsLength}</div>
                        </Space>
                      </RQButton>
                    </Tooltip>
                  </Popconfirm>
                </Row>
              )} */}
            </>
          </div>

          <div className={!isPreviewOpen ? "hide-traffic-table-split-gutter" : ""}>
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
