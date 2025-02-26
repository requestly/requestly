import React from "react";
import { TabsLayout } from "layouts/TabsLayout/types";
import { MdOutlineSyncAlt } from "@react-icons/all-files/md/MdOutlineSyncAlt";
import { MdOutlineFolder } from "@react-icons/all-files/md/MdOutlineFolder";
import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";
import { MdOutlineHistory } from "@react-icons/all-files/md/MdOutlineHistory";

export const tabIcons: Record<TabsLayout.IconType, React.ReactNode> = {
  [TabsLayout.IconType.REQUEST]: <MdOutlineSyncAlt />,
  [TabsLayout.IconType.COLLECTION]: <MdOutlineFolder />,
  [TabsLayout.IconType.ENVIORNMENT_VARIABLE]: <MdHorizontalSplit />,
  [TabsLayout.IconType.HISTORY]: <MdOutlineHistory />,
};
