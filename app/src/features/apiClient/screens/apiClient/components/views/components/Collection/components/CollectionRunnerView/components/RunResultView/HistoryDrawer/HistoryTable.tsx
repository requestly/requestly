import React, { useMemo } from "react";
import { Skeleton, Table } from "antd";
import "./historyTable.scss";
import { useRunResultStore } from "../../../run.context";
import { getAllTestSummary } from "features/apiClient/store/collectionRunResult/utils";
import { LiveRunResult, RunResult, RunStatus } from "features/apiClient/store/collectionRunResult/runResult.store";
import moment from "moment";
import { EmptyState } from "../../EmptyState/EmptyState";

const LoadingSkeleton: React.FC = () => <Skeleton.Button shape="round" size="small" />;

export const HistoryTable: React.FC<{ onHistoryClick: (result: RunResult) => void }> = ({ onHistoryClick }) => {
  const [runStatus, runStartTime] = useRunResultStore((s) => [s.runStatus, s.startTime]);

  const [history] = useRunResultStore((s) => [s.history]);
  const formattedHistory = useMemo(() => {
    const sortedHistory = history.sort((a, b) => b.startTime - a.startTime);
    return sortedHistory;
  }, [history]);

  const liveRunResult: LiveRunResult[] = useMemo(() => {
    if (runStatus === RunStatus.RUNNING) {
      return [
        {
          startTime: runStartTime,
          endTime: 0,
          runStatus,
          iterations: new Map(),
        },
      ];
    }
    return [];
  }, [runStartTime, runStatus]);

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
        render: (_: any, record: RunResult | LiveRunResult) =>
          record.runStatus === RunStatus.RUNNING ? (
            <LoadingSkeleton />
          ) : (
            <span>{record.endTime - record.startTime} ms</span>
          ),
      },
      {
        title: "Total",
        render: (_: any, record: RunResult | LiveRunResult) => {
          if (record.runStatus === RunStatus.RUNNING) {
            return <LoadingSkeleton />;
          }
          const testSummary = getAllTestSummary(record.iterations);
          return <span>{testSummary.totalTestsCounts}</span>;
        },
      },
      {
        title: <span style={{ color: "var(--requestly-color-success)" }}>Success</span>,
        render: (_: any, record: RunResult | LiveRunResult) => {
          if (record.runStatus === RunStatus.RUNNING) {
            return <LoadingSkeleton />;
          }
          const testSummary = getAllTestSummary(record.iterations);
          return <span>{testSummary.successTestsCounts}</span>;
        },
      },
      {
        title: <span style={{ color: "var(--requestly-color-error-text)" }}>Failed</span>,
        render: (_: any, record: RunResult | LiveRunResult) => {
          if (record.runStatus === RunStatus.RUNNING) {
            return <LoadingSkeleton />;
          }
          const testSummary = getAllTestSummary(record.iterations);
          return <span>{testSummary.failedTestsCounts}</span>;
        },
      },
      {
        title: "Skipped",
        render: (_: any, record: RunResult | LiveRunResult) => {
          if (record.runStatus === RunStatus.RUNNING) {
            return <LoadingSkeleton />;
          }
          const testSummary = getAllTestSummary(record.iterations);
          return <span>{testSummary.skippedTestsCounts}</span>;
        },
      },
    ];
  }, []);

  return (
    <Table
      className="history-table"
      columns={columns}
      dataSource={[...liveRunResult, ...formattedHistory]}
      pagination={false}
      onRow={(record: RunResult) => ({
        onClick: () => onHistoryClick(record),
      })}
      locale={{
        emptyText: <EmptyState title="No run history found" description="Run the collection to see results here." />,
      }}
      sticky={true}
    />
  );
};
