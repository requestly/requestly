import React from "react";
import { Button } from "antd";
import NetworkInspector from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficTableV2/NetworkInspector";
import "./index.css";
import NoTrafficCTA from "../NetworkInspector/NetworkTable/NoTrafficCTA";

const GroupByNone = ({
  requestsLog,
  handleRowClick,
  emptyCtaText,
  emptyCtaAction,
  emptyDesc,
  isStaticPreview,
  setSelectedMockRequests,
  showMockRequestSelector,
  selectedMockRequests,
  showMockFilters,
}) => {
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

    return <NoTrafficCTA isStaticPreview={isStaticPreview} showMockFilters={showMockFilters} />;
  };

  if (requestsLog?.length === 0) {
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
          "data-modified": actions.length !== 0 ? "true" : "false",
        };
      }}
      setSelectedMockRequests={setSelectedMockRequests}
      showMockRequestSelector={showMockRequestSelector}
      selectedMockRequests={selectedMockRequests}
    />
  );
};

export default GroupByNone;
