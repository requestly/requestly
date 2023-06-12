import React, { useCallback } from "react";
import PATHS from "config/constants/sub/paths";
import { Document, PaperUpload } from "react-iconly";
import { SecondarySidebarLink } from "../../common/SecondarySidebarLink";
import "./MockServerSidebar.css";

const mockServerSubRoutes = [
  {
    title: "My Mock APIs",
    path: PATHS.MOCK_SERVER_V2.ABSOLUTE,
    icon: <Document set="curved" />,
  },
  {
    title: "My Files",
    path: PATHS.FILE_SERVER_V2.ABSOLUTE,
    icon: <PaperUpload set="curved" />,
  },
];

export const MockServerSidebar: React.FC = () => {
  const isActiveLink = useCallback((isActive: boolean) => isActive, []);

  return (
    <div className="mock-server-sidebar-container">
      <ul>
        {mockServerSubRoutes.map(({ path, title, icon }) => (
          <li key={title}>
            <SecondarySidebarLink path={path} title={title} icon={icon} isActiveLink={isActiveLink} />
          </li>
        ))}
      </ul>
    </div>
  );
};
