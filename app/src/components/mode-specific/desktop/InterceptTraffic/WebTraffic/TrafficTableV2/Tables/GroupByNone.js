import React from "react";
import { Button } from "antd";
import NetworkInspector from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficTableV2/NetworkInspector";
import "./index.css";

const GroupByNone = ({ requestsLog, handleRowClick, emptyCtaText, emptyCtaAction, emptyDesc, isStaticPreview }) => {
  const renderNoTrafficCTA = () => {
    if (emptyCtaAction && emptyCtaText) {
      return (
        <>
          <Button type="primary" href={emptyCtaAction} target="_blank" style={{ margin: 8 }} size="small">
            {emptyCtaText}
          </Button>
          <p>{emptyDesc}</p>
        </>
      );
    }
  };

  if (requestsLog?.length === 0 && emptyCtaAction && emptyCtaText) {
    return renderNoTrafficCTA();
  }

  return (
    <NetworkInspector
      isStaticPreview={isStaticPreview}
      logs={requestsLog}
      onRow={(record) => {
        const { actions } = record;
        return {
          onClick: () => handleRowClick(record),
          style: actions.length !== 0 ? { background: "#13c2c280" } : {},
        };
      }}
    />
  );
};

export default GroupByNone;
