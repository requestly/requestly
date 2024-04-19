import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { IoDocumentTextOutline } from "@react-icons/all-files/io5/IoDocumentTextOutline";
import { MdOutlineUploadFile } from "@react-icons/all-files/md/MdOutlineUploadFile";
import { SecondarySidebar } from "componentsV2/SecondarySidebar";
import { actions } from "store";

const mocksSidebarItems = [
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

export const MocksSidebar: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (location.pathname.includes("editor")) {
      // @ts-ignore
      dispatch(actions.updateSecondarySidebarCollapse(true));
    } else {
      // @ts-ignore
      dispatch(actions.updateSecondarySidebarCollapse(false));
    }
  }, [dispatch, location]);

  return <SecondarySidebar items={mocksSidebarItems} />;
};
