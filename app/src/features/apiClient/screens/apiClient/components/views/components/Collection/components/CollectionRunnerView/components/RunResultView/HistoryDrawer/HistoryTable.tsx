import { Skeleton, Table } from "antd";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { useCollectionHistory } from "features/apiClient/slices/runHistory";
import { LiveRunResult, RunResult, RunStatus } from "features/apiClient/slices/common/runResults/types";
import { getAllTestSummary, getRunMetrics } from "features/apiClient/store/collectionRunResult/utils";
import React, { useMemo } from "react";
import { useCollectionView } from "../../../../../collectionView.context";
import { EmptyState } from "../../EmptyState/EmptyState";
import { getFormattedStartTime, getFormattedTime } from "../utils";
import "./historyTable.scss";

const LoadingSkeleton: React.FC = () => <Skeleton.Button className="history-row-skeleton" shape="round" size="small" />;

export const HistoryTable: React.FC<{ onHistoryClick: (result: RunResult) => void }> = ({ onHistoryClick }) => {
  const { liveRunResultEntity, collectionId } = useCollectionView();

  const liveRunSummary = useApiClientSelector((s) => liveRunResultEntity.getRunSummary(s));
  const { runStatus, startTime: runStartTime } = liveRunSummary;

  const history = useCollectionHistory(collectionId);

  const formattedHistory = useMemo(() => {
    const sortedHistory = [...history].sort((a, b) => (b.startTime ?? 0) - (a.startTime ?? 0));
    return sortedHistory;
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
        render: (_: any, record: RunResult) => (
          <span>{record.startTime ? getFormattedStartTime(record.startTime) : "..."}</span>
        ),
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
