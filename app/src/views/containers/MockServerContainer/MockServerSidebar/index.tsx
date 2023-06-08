import React from "react";
import { NavLink } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import "./MockServerSidebar.css";

const mockServerSubRoutes = [
  {
    title: "My Mock APIs",
    path: PATHS.MOCK_SERVER_V2.ABSOLUTE,
  },
  {
    title: "My Files",
    path: PATHS.FILE_SERVER_V2.ABSOLUTE,
  },
];

export const MockServerSidebar: React.FC = () => {
  return (
    <div className="mock-server-sidebar-container secondary-sidebar-container">
      <ul>
        {mockServerSubRoutes.map(({ path, title }) => (
          <li key={title}>
            <NavLink to={path} className={({ isActive }) => (isActive ? `mock-server-sidebar-active-link` : ``)}>
              {title}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};
