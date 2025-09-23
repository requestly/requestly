import React, { useMemo } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineHistory } from "@react-icons/all-files/md/MdOutlineHistory";
import "./runResultView.scss";
import { Tabs } from "antd";

const runMetrics = [
  {
    label: "Ran at",
    value: "Nov 28, 2024 at 09:00:12",
  },
  {
    label: "Duration",
    value: "800 ms",
  },
  {
    label: "Avg. resp. time",
    value: "629ms",
  },
];

enum RunResultTabKey {
  ALL = "all",
  SUCCESS = "success",
  FAIL = "fail",
  SKIPPED = "skipped",
}

const ResultList: React.FC = () => {};

export const RunResultView: React.FC = () => {
  const tabItems = useMemo(() => {
    return [
      {
        label: <span>All 10</span>,
        key: RunResultTabKey.ALL,
        children: <ResultList key={RunResultTabKey.ALL} />,
      },
      {
        label: <span>Success 10</span>,
        key: RunResultTabKey.SUCCESS,
        children: <ResultList key={RunResultTabKey.SUCCESS} />,
      },
      {
        label: <span>Fail 10</span>,
        key: RunResultTabKey.FAIL,
        children: <ResultList key={RunResultTabKey.FAIL} />,
      },
      {
        label: <span>Skipped 10</span>,
        key: RunResultTabKey.SKIPPED,
        children: <ResultList key={RunResultTabKey.SKIPPED} />,
      },
    ];
  }, []);

  return (
    <div className="run-result-view-container">
      <div className="run-result-view-header">
        <span className="header">Result</span>
        <RQButton size="small" type="transparent" icon={<MdOutlineHistory />} onClick={() => {}}>
          History
        </RQButton>
      </div>

      {/* TODO: show empty state depending upon run status */}
      <div className="run-result-view-content">
        <div className="result-header">
          {runMetrics.map((data) => {
            return (
              <div className="run-metric">
                <span className="label">{data.label}:</span>
                <span className="value">{data.value}</span>
              </div>
            );
          })}
        </div>
        <div className="result-tabs-container">
          <Tabs
            destroyInactiveTabPane={false}
            defaultActiveKey={RunResultTabKey.ALL}
            items={tabItems}
            animated={false}
            moreIcon={null}
          />
        </div>
      </div>
    </div>
  );
};
