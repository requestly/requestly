import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Row, Skeleton, Button, Col } from "antd";
import ProTable from "@ant-design/pro-table";
import { SyncOutlined } from "@ant-design/icons";
import { StorageService } from "../../../../init";
import { getModeData } from "../RuleBuilder/actions";
import { generateObjectId } from "../../../../utils/FormattingHelper";
import { getExecutionLogsId } from "../../../../utils/rules/misc";
import { epochToLocaleDate, epochToLocaleTime } from "utils/DateTimeUtils";
import { getAppMode, getCurrentlySelectedRuleData } from "store/selectors";
import { trackExecutionLogs } from "modules/analytics/events/features/executionLogs";
import Logger from "lib/logger";

const requestTypeMap = {
  main_frame: "html",
  sub_frame: "iframe",
};

const columns = [
  {
    title: "Time",
    dataIndex: "timestamp",
    defaultSortOrder: "descend",
    align: "center",
    width: "15%",
    renderText: (timestamp) => {
      if (isNaN(timestamp)) return "-";
      return epochToLocaleDate(Number(timestamp)) + " " + epochToLocaleTime(Number(timestamp));
    },
    sorter: (a, b) => a.timestamp - b.timestamp,
  },
  {
    title: "Request Url",
    dataIndex: "url",
    width: "60%",
    ellipsis: true,
  },
  {
    title: "Request Method",
    dataIndex: "requestMethod",
    width: "12.5%",
    align: "center",
  },
  {
    title: "Request Type",
    dataIndex: "requestType",
    width: "12.5%",
    align: "center",
    renderText: (requestType) => {
      return requestTypeMap[requestType] || requestType;
    },
  },
];

const ExecutionLogs = () => {
  const { RULE_TO_EDIT_ID } = getModeData(window.location, null);
  const executionLogsId = getExecutionLogsId(RULE_TO_EDIT_ID);

  const appMode = useSelector(getAppMode);
  const ruleData = useSelector(getCurrentlySelectedRuleData);

  //Component State
  const [executionLogs, setExecutionLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchExecutionLogs = () => {
    setIsLoading(true);
    Logger.log("Reading storage in fetchExecutionLogs");
    StorageService(appMode)
      .getRecord(executionLogsId)
      .then((fetchedExecutionLogs) => {
        if (fetchedExecutionLogs) {
          setExecutionLogs(fetchedExecutionLogs.sort((log1, log2) => log2.timestamp - log1.timestamp));
        }
        setIsLoading(false);
      });
  };

  // memoizing to prevent unnecessary renders
  const stableFetchLogs = useCallback(fetchExecutionLogs, [appMode, executionLogsId]);

  useEffect(() => {
    stableFetchLogs();
  }, [stableFetchLogs]);

  const sendAnalytics = () => {
    trackExecutionLogs(ruleData.ruleType);
  };

  const handleRefreshBtnOnClick = () => {
    sendAnalytics();
    stableFetchLogs();
  };

  return (
    <>
      <Skeleton loading={isLoading}>
        <Row align="middle" justify="space-between" style={{ paddingBottom: "6px" }}>
          <Col span={2} xxl={{ pull: 0 }} lg={{ pull: 1 }} sm={{ pull: 2 }}>
            <Button onClick={handleRefreshBtnOnClick} type="default" icon={<SyncOutlined />}>
              Refresh
            </Button>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <ProTable
              dataSource={executionLogs}
              columns={columns}
              pagination={false}
              rowKey={() => generateObjectId()}
              sticky={true}
              locale={{
                emptyText: "Start using the rule to see execution logs",
              }}
              showSorterTooltip={false}
              search={false}
              options={false}
              scroll={{ y: "40vh" }}
              size="small"
            />
          </Col>
        </Row>
      </Skeleton>
    </>
  );
};

export default ExecutionLogs;
