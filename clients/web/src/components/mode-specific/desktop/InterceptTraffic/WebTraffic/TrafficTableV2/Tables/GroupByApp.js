import React from "react";
import ProTable from "@ant-design/pro-table";
import { Avatar } from "antd";
import GroupByNone from "./GroupByNone";
//CONSTANTS APPNAME
import APPNAMES from "./GROUPBYAPP_CONSTANTS";
import { ITEM_SIZE } from "../NetworkInspector/NetworkTable";

const columns = [
  {
    title: "App Name",
    dataIndex: "appName",
    key: "appName",
    render: (text) => {
      text = text.trim();
      text = decodeURIComponent(text);
      const avatarDomain = APPNAMES[text.split(" ")[0].toLowerCase()];
      const avatarUrl = `https://www.google.com/s2/favicons?domain=${avatarDomain}`;
      return (
        <>
          <Avatar size="small" src={avatarUrl} style={{ display: "inline-block" }} />
          <span> {text}</span>
        </>
      );
    },
  },
];

const NestedTable = ({ appName, appLogs, handleRowClick }) => {
  return (
    <div
      style={{
        height: `${Math.min(ITEM_SIZE * (appLogs[appName].length + 1), 400)}px`,
      }}
    >
      <GroupByNone requestsLog={appLogs[appName]} handleRowClick={handleRowClick} />
    </div>
  );
};

const GroupByApp = ({ appList, appLogs, handleRowClick }) => {
  // sorting apps alphabetically
  appList.sort((app1Obj, app2Obj) => {
    const app1 = app1Obj.appName.trim();
    const app2 = app2Obj.appName.trim();
    if (app1 < app2) {
      return -1;
    }
    return 1;
  });

  return (
    <ProTable
      columns={columns}
      dataSource={appList}
      rowKey={(record) => record.appName}
      pagination={false}
      scroll={{ y: 600 }}
      expandable={{
        expandedRowRender: (record) => {
          return <NestedTable appName={record.appName} appLogs={appLogs} handleRowClick={handleRowClick} />;
        },
        expandRowByClick: true,
      }}
      locale={{ emptyText: "No Traffic Intercepted" }}
      options={false}
      search={false}
      style={{ cursor: "pointer" }}
    />
  );
};

export default GroupByApp;
