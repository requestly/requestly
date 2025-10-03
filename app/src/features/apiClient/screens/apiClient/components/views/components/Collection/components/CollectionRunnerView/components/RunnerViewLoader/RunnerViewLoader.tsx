import { Skeleton } from "antd";
import "./runnerViewLoader.scss";

export const RunnerViewLoader = () => {
  return (
    <div className="runner-view-loader">
      <div className="config-section">
        <Skeleton active className="api-client-sidebar-skeleton" paragraph={{ rows: 10, width: "100%" }} />
        <Skeleton active className="api-client-sidebar-skeleton" paragraph={{ rows: 5, width: "100%" }} />
      </div>
      <div className="result-section">
        <Skeleton active className="api-client-sidebar-skeleton" paragraph={{ rows: 17, width: "100%" }} />
      </div>
    </div>
  );
};
