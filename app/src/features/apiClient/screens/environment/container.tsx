import { Outlet } from "react-router-dom";
import "./container.scss";

export const EnvironmentContainer = () => {
  return (
    <div className="environment-container">
      <div className="environment-container-content">
        <Outlet />
      </div>
    </div>
  );
};
