import React from "react";
import PATHS from "config/constants/sub/paths";
import { IoDocumentTextOutline } from "@react-icons/all-files/io5/IoDocumentTextOutline";
import { MdOutlineUploadFile } from "@react-icons/all-files/md/MdOutlineUploadFile";
import { SecondarySidebar } from "componentsV2/SecondarySidebar";

// TODO: remove /v2 prefix after development
const mocksSidebarItems = [
  {
    title: "My Mock APIs",
    path: "/v2" + PATHS.MOCK_SERVER_V2.ABSOLUTE,
    icon: <IoDocumentTextOutline />,
  },
  {
    title: "My Files",
    path: "/v2" + PATHS.FILE_SERVER_V2.ABSOLUTE,
    icon: <MdOutlineUploadFile />,
  },
];

export const MocksSidebar: React.FC = () => {
  return <SecondarySidebar items={mocksSidebarItems} />;
};
