import React, {
  useCallback,
  useMemo,
  useState,
  // useEffect, useCallback, useRef
} from "react";
// import { isEqual, sortBy } from "lodash";
// Styles
import "./css/draggable.css";
import FixedRequestLogPane from "./FixedRequestLogPane";
import ActionHeader from "./ActionHeader";
import {
  getFinalLogs,
  groupByApp,
  groupByDomain,
} from "../../../../../../utils/TrafficTableUtils";
import GroupByDomain from "./Tables/GroupByDomain";
import GroupByApp from "./Tables/GroupByApp";
import GroupByNone from "./Tables/GroupByNone";
import SSLProxyingModal from "components/mode-specific/desktop/SSLProxyingModal";
import { Row } from "antd";
import ProCard from "@ant-design/pro-card";
import Split from "react-split";
import { desktopLogsActions } from "store/features/desktop-network-logs/slice";
import { useDispatch, useSelector } from "react-redux";
import { getDesktopLogs } from "store/features/desktop-network-logs/selectors";

const CurrentTrafficTable = ({
  // logs = [],
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
  const networkLogsMap = useSelector(getDesktopLogs);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedRequestData, setSelectedRequestData] = useState({});
  const [searchKeyword, setSearchKeyword] = useState("");
  const [groupByParameter, setGroupByParameter] = useState("none");
  const [rulePaneSizes, setRulePaneSizes] = useState([100, 0]);
  const [isSSLProxyingModalVisible, setIsSSLProxyingModalVisible] = useState(
    false
  );

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
    for (const [key, value] of Object.entries(
      selectedRequestData.request.headers
    )) {
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
    for (const [key, value] of Object.entries(
      selectedRequestData.response.headers
    )) {
      const header = {
        property: key,
        value,
      };
      previewData.push(header);
    }
  }

  const clearLogs = () => {
    // setNetworkLogsMap({});
    dispatch(desktopLogsActions.resetState());
    if (clearLogsCallback) clearLogsCallback();
  };

  // const deduplicate_logs = (logArr) => {
  //   let existsMap = {};

  //   return logArr.filter((log) => {
  //     if (existsMap[log.id]) {
  //       if (existsMap[log.id].timestamp > log.timestamp) {
  //         existsMap[log.id] = log;
  //         return true;
  //       } else {
  //         return false;
  //       }
  //     } else {
  //       existsMap[log.id] = log;
  //       return true;
  //     }
  //   });
  // };

  // // const finalLogs = useMemo(
  // const finalLogs = useCallback(
  //   (desc = true) => {
  //     // const logs = Object.values(networkLogsMap).sort(
  //     let localMap = [...networkLogsMap];
  //     let toSort = deduplicate_logs(localMap);
  //     const logs = toSort.sort((log1, log2) => log2.timestamp - log1.timestamp);

  //     console.log("total logs", logs.length);

  //     if (searchKeyword) {
  //       const reg = new RegExp(searchKeyword, "i");
  //       const filteredLogs = logs.filter((log) => {
  //         return log.url.match(reg);
  //       });

  //       console.log("total filtered logs", filteredLogs.length);
  //       return filteredLogs;
  //     }
  //     return logs;
  //   },
  //   [networkLogsMap, searchKeyword]
  // );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const finalLogs = useMemo(() => getFinalLogs(networkLogsMap, searchKeyword), [
    networkLogsMap,
    searchKeyword,
  ]);

  const finalDomainLogs = () => {
    const logs = finalLogs;
    // const logs = getFinalLogs(networkLogsMap, searchKeyword)
    const { domainArray: domainList, domainLogs } = groupByDomain(logs);
    return { domainLogs, domainList };
  };

  const finalAppLogs = () => {
    const logs = finalLogs;
    // const logs = getFinalLogs(networkLogsMap, searchKeyword)
    const { appArray: appList, appLogs } = groupByApp(logs);
    return { appLogs, appList };
  };

  const upsertRequestAction = (log_id, action) => {
    let localMap = [...networkLogsMap];
    // let _networkLogsMap = { ...networkLogsMap };
    // todo: needs rewrite
    // if (_networkLogsMap[log_id].actions) {
    let idx = localMap.findIndex((log) => log.id === log_id);
    if (idx !== 1) {
      const newLog = localMap[idx];
      newLog.action = action;
      newLog.timestamp = Date.now(); //hacky for now
      dispatch(desktopLogsActions.addNetworkLog(newLog));
    }
    // setNetworkLogsMap(_networkLogsMap);
  };

  const getGroupLogs = () => {
    return groupByParameter === "domain" ? (
      <GroupByDomain handleRowClick={handleRowClick} {...finalDomainLogs()} />
    ) : groupByParameter === "app" ? (
      <GroupByApp handleRowClick={handleRowClick} {...finalAppLogs()} />
    ) : (
      <GroupByNone
        requestsLog={finalLogs}
        // requestsLog={getFinalLogs(networkLogsMap, searchKeyword)}
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
          height: "75vh",
        }}
      >
        <Row className="gap-case-1" style={{ overflow: "hidden" }}>
          <ProCard
            className="primary-card github-like-border network-table-wrapper-override"
            style={{
              boxShadow: "none",
              borderBottom: "2px solid #f5f5f5",
              borderRadius: "0",
            }}
          >
            {getGroupLogs()}
          </ProCard>
        </Row>
        <Row style={{ overflow: "auto", height: "100%" }}>
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
              selectedRequestData={selectedRequestData}
              upsertRequestAction={upsertRequestAction}
              handleClosePane={handleClosePane}
              visibility={isPreviewOpen}
            />
          </ProCard>
        </Row>
      </Split>
      {/* ssl proxying is currently hidden */}
      <SSLProxyingModal
        isVisible={isSSLProxyingModalVisible}
        setIsVisible={setIsSSLProxyingModalVisible}
      />
    </React.Fragment>
  );
};

export default CurrentTrafficTable;
