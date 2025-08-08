import { Skeleton } from "antd";
import "./apiClientLoadingView.css";

export const ApiClientLoadingView = () => {
  return (
    <div className="api-client-loading-container">
      <div className="api-client-loading-sidebar">
        <Skeleton active className="api-client-sidebar-skeleton" paragraph={{ rows: 10, width: "100%" }} />
      </div>
      <div className="api-client-loading-view">
        <Skeleton active className="api-client-header-skeleton" paragraph={{ rows: 1, width: "100%" }} />
        <Skeleton active className="api-client-body-skeleton" />
      </div>
    </div>
  );
};
