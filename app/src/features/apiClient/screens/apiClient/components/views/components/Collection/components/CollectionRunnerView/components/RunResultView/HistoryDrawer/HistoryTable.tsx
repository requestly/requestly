import React, { useMemo } from "react";
import { Skeleton, Table } from "antd";
import "./historyTable.scss";
import { useRunResultStore } from "../../../run.context";
import { getAllTestSummary, getRunMetrics } from "features/apiClient/store/collectionRunResult/utils";
import { LiveRunResult, RunResult, RunStatus } from "features/apiClient/store/collectionRunResult/runResult.store";
import { EmptyState } from "../../EmptyState/EmptyState";
import { getFormattedStartTime, getFormattedTime } from "../utils";

const LoadingSkeleton: React.FC = () => <Skeleton.Button className="history-row-skeleton" shape="round" size="small" />;

export const HistoryTable: React.FC<{ onHistoryClick: (result: RunResult) => void }> = ({ onHistoryClick }) => {
  const [runStatus, runStartTime] = useRunResultStore((s) => [s.runStatus, s.startTime]);

  const [history] = useRunResultStore((s) => [s.history]);
  const formattedHistory = useMemo(() => {
    return [...history].sort((a, b) => (b.startTime ?? 0) - (a.startTime ?? 0));
  }, [history]);

  const liveRunResult: LiveRunResult[] = useMemo(() => {
    if (runStatus === RunStatus.RUNNING) {
      return [
        {
          startTime: runStartTime,
          endTime: null as LiveRunResult["endTime"],
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
        width: 175,
        render: (_: any, record: RunResult) => <span>{getFormattedStartTime(record.startTime)}</span>,
      },
      {
        title: "Duration",
        width: 130,
        render: (_: any, record: RunResult | LiveRunResult) =>
          record.runStatus === RunStatus.RUNNING ? (
            <LoadingSkeleton />
          ) : (
            <span>{getFormattedTime(getRunMetrics(record.iterations).totalDuration)}</span>
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
