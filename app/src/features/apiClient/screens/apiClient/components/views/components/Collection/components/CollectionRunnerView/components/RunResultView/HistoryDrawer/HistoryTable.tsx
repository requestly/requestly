import React, { useMemo } from "react";
import { Table } from "antd";
import "./historyTable.scss";
import { useRunResultStore } from "../../../run.context";
import { getAllTestSummary } from "features/apiClient/store/collectionRunResult/utils";
import { RunResult } from "features/apiClient/store/collectionRunResult/runResult.store";
import moment from "moment";

export const HistoryTable: React.FC<{ onHistoryClick: (result: RunResult) => void }> = ({ onHistoryClick }) => {
  const [history] = useRunResultStore((s) => [s.history]);

  const columns = useMemo(() => {
    return [
      {
        title: "Ran at",
        render: (_: any, record: RunResult) => (
          <span>{moment(record.startTime).format("MMM DD, YYYY [at] HH:mm:ss")}</span>
        ),
      },
      {
        title: "Duration",
        render: (_: any, record: RunResult) => <span>{record.endTime - record.startTime} ms</span>,
      },
      {
        title: "Total",
        render: (_: any, record: RunResult) => {
          const testSummary = getAllTestSummary(record.result);
          return <span>{testSummary.totalTestsCounts}</span>;
        },
      },
      {
        title: (
          <>
            <span style={{ color: "var(--requestly-color-success)" }}>Success</span>
          </>
        ),
        render: (_: any, record: RunResult) => {
          const testSummary = getAllTestSummary(record.result);
          return <span>{testSummary.successTestsCounts}</span>;
        },
      },
      {
        title: (
          <>
            <span style={{ color: "var(--requestly-color-error-text)" }}>Failed</span>
          </>
        ),
        render: (_: any, record: RunResult) => {
          const testSummary = getAllTestSummary(record.result);
          return <span>{testSummary.failedTestsCounts}</span>;
        },
      },
      {
        title: "Skipped",
        render: (_: any, record: RunResult) => {
          const testSummary = getAllTestSummary(record.result);
          return <span>{testSummary.skippedTestsCounts}</span>;
        },
      },
    ];
  }, []);

  return (
    <Table
      className="history-table"
      columns={columns}
      dataSource={history}
      pagination={false}
      onRow={(record) => ({
        onClick: () => onHistoryClick(record),
      })}
    />
  );
};
