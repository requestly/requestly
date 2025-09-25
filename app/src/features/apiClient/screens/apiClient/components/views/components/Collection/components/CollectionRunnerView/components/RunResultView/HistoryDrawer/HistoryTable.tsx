import React, { useMemo } from "react";
import { Table } from "antd";
import "./historyTable.scss";

export const HistoryTable: React.FC = () => {
  const columns = useMemo(() => {
    return [
      {
        title: "Ran at",
        dataIndex: "ranAt",
      },
      {
        title: "Duration",
        dataIndex: "duration",
      },
      {
        title: "Total",
        dataIndex: "total",
      },
      {
        title: (
          <>
            <span style={{ color: "var(--requestly-color-success)" }}>Success</span>
          </>
        ),
        dataIndex: "success",
      },
      {
        title: (
          <>
            <span style={{ color: "var(--requestly-color-error-text)" }}>Failed</span>
          </>
        ),
        dataIndex: "failed",
      },
      {
        title: "Skipped",
        dataIndex: "skipped",
      },
    ];
  }, []);

  const dataSource = useMemo(() => {
    return [
      {
        key: "1",
        ranAt: "Nov 28, 2024 at 07:11:12",
        duration: "5s",
        total: 100,
        success: 80,
        failed: 15,
        skipped: 5,
      },
      {
        key: "2",
        ranAt: "Nov 27, 2024 at 07:11:12",
        duration: "6s",
        total: 120,
        success: 90,
        failed: 20,
        skipped: 10,
      },
    ];
  }, []);

  return <Table className="history-table" columns={columns} dataSource={dataSource} pagination={false} />;
};
