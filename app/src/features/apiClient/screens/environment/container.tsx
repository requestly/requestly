import { Outlet } from "react-router-dom";
import { EnvironmentsSidebar } from "./components/environmentsSidebar/EnvironmentsSidebar";
import "./container.scss";

export const EnvironmentContainer = () => {
  return (
    <div className="environment-container">
      <EnvironmentsSidebar />
      <div className="environment-container-content">
        <Outlet />
      </div>
    </div>
  );
};
