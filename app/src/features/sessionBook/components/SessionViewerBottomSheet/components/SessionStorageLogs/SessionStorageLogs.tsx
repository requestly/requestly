import { useSelector } from "react-redux";
import { getSessionRecordingAttributes, getSessionRecordingEvents } from "store/features/session-recording/selectors";
import "./sessionStorageLogs.scss";
import { useCallback, useMemo } from "react";
import { StorageEventData } from "@requestly/web-sdk";
import { Table } from "antd";
import { secToMinutesAndSeconds } from "utils/DateTimeUtils";
import CopyButton from "components/misc/CopyButton";

export const SessionStorageLogs = () => {
  const events = useSelector(getSessionRecordingEvents);
  const attributes = useSelector(getSessionRecordingAttributes);

  const getOffset = useCallback(
    (event: StorageEventData) => {
      let offset = (new Date(Number(event.timestamp)).getTime() - attributes?.startTime) / 1000;
      offset = offset >= 0 ? offset : 0; // Sometimes offset comes out negative.
      return offset;
    },
    [attributes?.startTime]
  );

  const columns = useMemo(() => {
    return [
      {
        title: `Time`,
        key: "time",
        width: 60,
        render: (_: any, record: StorageEventData) => {
          const offset = Math.floor(getOffset(record));
          return <div className="session-storage-log-cell">{secToMinutesAndSeconds(offset)}</div>;
        },
      },
      {
        title: `Key`,
        key: "key",
        width: 140,
        render: (_: any, record: StorageEventData) => (
          <div className="session-storage-log-cell text-bold">{record.key}</div>
        ),
      },
      {
        title: `New value`,
        key: "newValue",
        width: 200,
        render: (_: any, record: StorageEventData) => {
          const value = record.eventType === "initialStorageValue" ? record.value : record.newValue;
          return (
            <div className="copy-value-cell session-storage-log-cell">
              <div className="copy-value-text">{value}</div>
              <CopyButton copyText={value} size="small" />
            </div>
          );
        },
      },
      {
        title: `Old value`,
        key: "oldValue",
        width: 140,
        render: (_: any, record: StorageEventData) => (
          <div className="session-storage-log-cell">
            {record.eventType === "initialStorageValue" ? "-" : record.oldValue || "-"}
          </div>
        ),
      },
    ];
  }, [getOffset]);

  return (
    <div className="session-storage-logs-container">
      <Table
        className="session-storage-logs-table"
        dataSource={events.storage || []}
        columns={columns}
        pagination={false}
        // TEMP
        scroll={{ y: "calc(100vh - 210px)" }}
      />
    </div>
  );
};
