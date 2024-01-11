import React, { useCallback } from "react";
import PATHS from "config/constants/sub/paths";
import { IoDocumentTextOutline } from "@react-icons/all-files/io5/IoDocumentTextOutline";
import { MdOutlineUploadFile } from "@react-icons/all-files/md/MdOutlineUploadFile";
import { SecondarySidebarLink } from "../../common/SecondarySidebarLink";
import "./MockServerSidebar.css";

const mockServerSubRoutes = [
  {
    title: "My Mock APIs",
    path: PATHS.MOCK_SERVER_V2.ABSOLUTE,
    icon: <IoDocumentTextOutline />,
  },
  {
    title: "My Files",
    path: PATHS.FILE_SERVER_V2.ABSOLUTE,
    icon: <MdOutlineUploadFile />,
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
