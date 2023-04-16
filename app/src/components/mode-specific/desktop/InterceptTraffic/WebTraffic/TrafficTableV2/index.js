import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Col, Menu, Row, Tag } from "antd";
import ProCard from "@ant-design/pro-card";
import Split from "react-split";
import { isEqual, sortBy } from "lodash";

import { makeOriginalLog } from "capture-console-logs";

import { getActiveModals } from "store/selectors";
import { actions } from "store";
import FixedRequestLogPane from "./FixedRequestLogPane";
import ActionHeader from "./ActionHeader";
import RuleEditorModal from "components/common/RuleEditorModal";
import { groupByApp, groupByDomain } from "../../../../../../utils/TrafficTableUtils";
import GroupByNone from "./Tables/GroupByNone";
import SSLProxyingModal from "components/mode-specific/desktop/SSLProxyingModal";
import { trackTrafficTableRequestClicked } from "modules/analytics/events/desktopApp";
import { convertProxyLogToUILog, getAppLogsMenuItem, getDomainLogsMenuItem } from "./utils/logUtils";
import "./css/draggable.css";
import "./TrafficTableV2.css";
import { desktopTrafficTableActions } from "store/features/desktop-traffic-table/slice";
import { getAllLogs, getLogResponseById } from "store/features/desktop-traffic-table/selectors";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import Logger from "lib/logger";

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

  const isTablePeristenceEnabled = useFeatureIsOn("traffic_table_perisitence");

  // Component State
  const previousLogsRef = useRef(logs);
  const newLogs = useSelector(getAllLogs);
  // {id: log, ...}
  const [networkLogsMap, setNetworkLogsMap] = useState({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedRequestData, setSelectedRequestData] = useState({});
  const [searchKeyword, setSearchKeyword] = useState("");
  const [rulePaneSizes, setRulePaneSizes] = useState([100, 0]);
  const [isSSLProxyingModalVisible, setIsSSLProxyingModalVisible] = useState(false);

  const selectedRequestResponse =
    useSelector(getLogResponseById(selectedRequestData?.id)) || selectedRequestData?.response?.body;

  const [consoleLogsShown, setConsoleLogsShown] = useState([]);
  const [filterType, setFilterType] = useState(null);

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
      // TODO: @sahil865gupta Fix this multiple time registering
      upsertNetworkLogMap(payload);
    });
    window?.RQ?.DESKTOP.SERVICES.IPC.registerEvent("log-network-request-v2", (payload) => {
      const rqLog = convertProxyLogToUILog(payload);

      printLogsToConsole(rqLog);

      if (isTablePeristenceEnabled) {
        saveLogInRedux(rqLog);
      } else {
        upsertNetworkLogMap(rqLog);
      }
    });

    return () => {
      if (window.RQ && window.RQ.DESKTOP) {
        // TODO: Remove this ipc when all of the users are shifted to new version 1.4.0
        window.RQ.DESKTOP.SERVICES.IPC.unregisterEvent("log-network-request");
        window.RQ.DESKTOP.SERVICES.IPC.unregisterEvent("log-network-request-v2");
      }
    };
  }, [upsertNetworkLogMap, printLogsToConsole, saveLogInRedux, isTablePeristenceEnabled]);

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

  const getSearchedLogs = useCallback((logs, searchKeyword) => {
    if (searchKeyword) {
      try {
        // TODO: @wrongsahil fix this. Special Characters are breaking the UI
        const reg = new RegExp(searchKeyword, "i");
        return logs.filter((log) => log.url.match(reg));
      } catch (err) {
        Logger.log(err);
      }
    }

    return logs;
  }, []);

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

  const getDomainLogs = useCallback(() => {
    const logs = getRequestLogs();
    const { domainArray: domainList, domainLogs } = groupByDomain(logs);
    return { domainLogs, domainList };
  }, [getRequestLogs]);

  const getAppLogs = useCallback(() => {
    const logs = getRequestLogs();
    const { appArray: appList, appLogs } = groupByApp(logs);
    return { appLogs, appList };
  }, [getRequestLogs]);

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
    const logs = filterType ? (logType === "app" ? appLogs[filter] : domainLogs[filter]) : getRequestLogs();
    const searchedLogs = getSearchedLogs(logs, searchKeyword);

    return (
      <GroupByNone
        requestsLog={searchedLogs}
        handleRowClick={handleRowClick}
        emptyCtaText={emptyCtaText}
        emptyCtaAction={emptyCtaAction}
        emptyDesc={emptyDesc}
      />
    );
  };

  const items = useMemo(
    () => [
      {
        key: "0",
        label: `Apps (${appList?.length ?? 0})`,
        children: getAppLogsMenuItem(appList),
      },
      {
        key: "1",
        label: `Domains (${domainList?.length ?? 0})`,
        children: getDomainLogsMenuItem(domainList),
      },
    ],
    [appList, domainList]
  );

  const handleSidebarMenuItemClick = useCallback((e) => setFilterType(e.key), []);

  return (
    <>
      <Row wrap={false}>
        <Col flex="197px" className="traffic-table-sidebar">
          <Menu theme="dark" mode="inline" items={items} onClick={handleSidebarMenuItemClick} />
        </Col>
        <Col flex="auto">
          <Row align={"middle"}>
            <ActionHeader
              handleOnSearchChange={handleOnSearchChange}
              clearLogs={clearLogs}
              setIsSSLProxyingModalVisible={setIsSSLProxyingModalVisible}
              showDeviceSelector={showDeviceSelector}
              deviceId={deviceId}
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
            style={{ height: "75vh" }}
            className="traffic-table-split-container"
          >
            <Row className="gap-case-1" style={{ overflow: "hidden" }}>
              <ProCard
                className="primary-card github-like-border network-table-wrapper-override"
                style={{
                  boxShadow: "none",
                  borderBottom: "2px solid #f5f5f5",
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
                  borderTop: "2px solid #f5f5f5",
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

          <Alert
            closable
            showIcon
            type="info"
            message="Network logger works only when you are on this page."
            style={{ paddingLeft: "24px", paddingRight: "24px", margin: "1rem 0 1rem 1.25rem" }}
          />

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
