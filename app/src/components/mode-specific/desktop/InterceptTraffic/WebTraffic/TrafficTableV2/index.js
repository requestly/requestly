import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row } from 'antd';
import ProCard from '@ant-design/pro-card';
import Split from 'react-split';
import { isEqual, sortBy } from 'lodash';
import { getActiveModals } from 'store/selectors';
import { actions } from 'store';
import FixedRequestLogPane from './FixedRequestLogPane';
import ActionHeader from './ActionHeader';
import RuleEditorModal from 'components/common/RuleEditorModal';
import { groupByApp, groupByDomain } from '../../../../../../utils/TrafficTableUtils';
import GroupByDomain from './Tables/GroupByDomain';
import GroupByApp from './Tables/GroupByApp';
import GroupByNone from './Tables/GroupByNone';
import SSLProxyingModal from 'components/mode-specific/desktop/SSLProxyingModal';
import { convertProxyLogToUILog } from './utils/logUtils';
import { makeOriginalLog } from 'capture-console-logs';
import { trackTrafficTableRequestClicked } from 'modules/analytics/events/desktopApp';
import './css/draggable.css';

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

  // Component State
  const previousLogsRef = useRef(logs);

  // {id: log, ...}
  const [networkLogsMap, setNetworkLogsMap] = useState({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedRequestData, setSelectedRequestData] = useState({});
  const [searchKeyword, setSearchKeyword] = useState('');
  const [groupByParameter, setGroupByParameter] = useState('none');
  const [rulePaneSizes, setRulePaneSizes] = useState([100, 0]);
  const [isSSLProxyingModalVisible, setIsSSLProxyingModalVisible] = useState(false);
  const [consoleLogsShown, setConsoleLogsShown] = useState([]);

  const handleRuleEditorModalClose = useCallback(() => {
    dispatch(
      actions.toggleActiveModal({
        newValue: false,
        modalName: 'ruleEditorModal',
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

  const handleOnGroupParameterChange = (e) => {
    setGroupByParameter(e.target.value);
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
        property: 'Time',
        value: selectedRequestData.timestamp,
      },
      {
        property: 'Method',
        value: selectedRequestData.request.method,
      },
      {
        property: 'Status Code',
        value: selectedRequestData.response.statusCode,
      },
      {
        property: 'Path',
        value: selectedRequestData.request.path,
      },
      {
        property: 'Host',
        value: selectedRequestData.request.host,
      },
      {
        property: 'Port',
        value: selectedRequestData.request.port,
      },
      {
        property: 'REQUEST HEADERS',
        value: '',
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
      property: 'RESPONSE HEADERS',
      value: '',
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
    setNetworkLogsMap({});
    if (clearLogsCallback) clearLogsCallback();
  };

  useEffect(() => {
    // TODO: Remove this ipc when all of the users are shifted to new version 1.4.0
    window?.RQ?.DESKTOP.SERVICES.IPC.registerEvent('log-network-request', (payload) => {
      // TODO: @sahil865gupta Fix this multiple time registering
      upsertNetworkLogMap(payload);
    });
    window?.RQ?.DESKTOP.SERVICES.IPC.registerEvent('log-network-request-v2', (payload) => {
      const rqLog = convertProxyLogToUILog(payload);
      printLogsToConsole(rqLog);
      upsertNetworkLogMap(rqLog);
    });

    return () => {
      if (window.RQ && window.RQ.DESKTOP) {
        // TODO: Remove this ipc when all of the users are shifted to new version 1.4.0
        window.RQ.DESKTOP.SERVICES.IPC.unregisterEvent('log-network-request');
        window.RQ.DESKTOP.SERVICES.IPC.unregisterEvent('log-network-request-v2');
      }
    };
  }, [upsertNetworkLogMap, printLogsToConsole]);

  useEffect(() => {
    if (window.RQ && window.RQ.DESKTOP) {
      window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG('enable-request-logger').then(() => {});
    }

    return () => {
      if (window.RQ && window.RQ.DESKTOP) {
        // Disable sending logs from bg window
        window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG('disable-request-logger').then(() => {});
      }
    };
  }, []);

  const getRequestLogs = (desc = true) => {
    const logs = Object.values(networkLogsMap).sort((log1, log2) => log2.timestamp - log1.timestamp);

    if (searchKeyword) {
      const reg = new RegExp(searchKeyword, 'i');
      const filteredLogs = logs.filter((log) => {
        return log.url.match(reg);
      });

      return filteredLogs;
    }
    return logs;
  };

  const getDomainLogs = () => {
    const logs = getRequestLogs();
    const { domainArray: domainList, domainLogs } = groupByDomain(logs);
    return { domainLogs, domainList };
  };

  const getAppLogs = () => {
    const logs = getRequestLogs();
    const { appArray: appList, appLogs } = groupByApp(logs);
    return { appLogs, appList };
  };

  const upsertRequestAction = (log_id, action) => {
    let _networkLogsMap = { ...networkLogsMap };
    if (_networkLogsMap[log_id].actions) {
      _networkLogsMap[log_id].actions.push(action);
    }
    setNetworkLogsMap(_networkLogsMap);
  };

  const getGroupLogs = () => {
    return groupByParameter === 'domain' ? (
      <GroupByDomain handleRowClick={handleRowClick} {...getDomainLogs()} />
    ) : groupByParameter === 'app' ? (
      <GroupByApp handleRowClick={handleRowClick} {...getAppLogs()} />
    ) : (
      <GroupByNone
        requestsLog={getRequestLogs()}
        handleRowClick={handleRowClick}
        emptyCtaText={emptyCtaText}
        emptyCtaAction={emptyCtaAction}
        emptyDesc={emptyDesc}
      />
    );
  };

  return (
    <React.Fragment>
      <ActionHeader
        handleOnSearchChange={handleOnSearchChange}
        handleOnGroupParameterChange={handleOnGroupParameterChange}
        groupByParameter={groupByParameter}
        clearLogs={clearLogs}
        setIsSSLProxyingModalVisible={setIsSSLProxyingModalVisible}
        showDeviceSelector={showDeviceSelector}
        deviceId={deviceId}
      />
      <Split
        sizes={rulePaneSizes}
        minSize={[75, 0]}
        gutterSize={gutterSize}
        dragInterval={20}
        direction="vertical"
        cursor="row-resize"
        style={{
          height: '75vh',
        }}
      >
        <Row className="gap-case-1" style={{ overflow: 'hidden' }}>
          <ProCard
            className="primary-card github-like-border network-table-wrapper-override"
            style={{
              boxShadow: 'none',
              borderBottom: '2px solid #f5f5f5',
              borderRadius: '0',
            }}
          >
            {getGroupLogs()}
          </ProCard>
        </Row>
        <Row style={{ overflow: 'auto', height: '100%' }}>
          <ProCard
            className="primary-card github-like-border"
            style={{
              boxShadow: 'none',
              borderRadius: '0',
              borderTop: '2px solid #f5f5f5',
            }}
            bodyStyle={{ padding: '0px 20px' }}
          >
            <FixedRequestLogPane
              selectedRequestData={selectedRequestData}
              upsertRequestAction={upsertRequestAction}
              handleClosePane={handleClosePane}
              visibility={isPreviewOpen}
            />
          </ProCard>
        </Row>
      </Split>
      {/* ssl proxying is currently hidden */}
      <SSLProxyingModal isVisible={isSSLProxyingModalVisible} setIsVisible={setIsSSLProxyingModalVisible} />

      {ruleEditorModal.isActive && (
        <RuleEditorModal
          isOpen={ruleEditorModal.isActive}
          handleModalClose={handleRuleEditorModalClose}
          analyticEventEditorViewedSource="traffic_table_right_click"
        />
      )}
    </React.Fragment>
  );
};

export default CurrentTrafficTable;
