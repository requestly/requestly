import React from "react";
import ProTable from "@ant-design/pro-table";
import { Avatar } from "antd";
import GroupByNone from "./GroupByNone";
import { ITEM_SIZE } from "../NetworkInspector/NetworkTable";

const columns = [
  {
    title: "Domain Name",
    dataIndex: "domain",
    key: "domain",
    render: (text) => {
      text = text.trim();
      const domainParts = text.split(".");
      const avatarDomain = domainParts.splice(domainParts.length - 2, 2).join(".");
      const avatarUrl = `https://www.google.com/s2/favicons?domain=${avatarDomain}`;
      return (
        <>
          <Avatar size="small" style={{ display: "inline-block" }} src={avatarUrl} />
          <span>{`  ${text}`}</span>
        </>
      );
    },
  },
];

const NestedTable = ({ domain, domainLogs, handleRowClick }) => {
  return (
    // HACK
    <div
      style={{
        height: `${Math.min(ITEM_SIZE * (domainLogs[domain].length + 1), 400)}px`,
      }}
    >
      <GroupByNone requestsLog={domainLogs[domain]} handleRowClick={handleRowClick} />
    </div>
  );
};

const GroupByDomain = ({ domainList, domainLogs, handleRowClick }) => {
  // sorting domains alphabetically
  domainList.sort((domain1Obj, domain2Obj) => {
    const domain1 = domain1Obj.domain.trim();
    const domain2 = domain2Obj.domain.trim();
    if (domain1 < domain2) {
      return -1;
    }
    return 1;
  });

  return (
    <ProTable
      columns={columns}
      dataSource={domainList}
      rowKey={(record) => record.domain}
      pagination={false}
      scroll={{ y: 600 }}
      expandable={{
        expandedRowRender: (record) => {
          return <NestedTable domain={record.domain} domainLogs={domainLogs} handleRowClick={handleRowClick} />;
        },
        expandRowByClick: true,
      }}
      locale={{ emptyText: "No Traffic Intercepted" }}
      search={false}
      options={false}
      style={{ cursor: "pointer" }}
    />
  );
};

export default GroupByDomain;
