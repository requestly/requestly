import { RouteObject } from "react-router-dom";
import { AddRequestHeader } from "./headerModifications/addRequestHeader";
import { RemoveRequestHeader } from "./headerModifications/removeRequestHeader";
import { AddResponseHeader } from "./headerModifications/addResponseHeader";
import { RemoveResponseHeader } from "./headerModifications/removeResponseHeader";
import { AutomationPage } from "./index";

import PATHS from "config/constants/sub/paths";

export const automationRoutes: RouteObject[] = [
  {
    path: "",
    element: <AutomationPage />,
  },
  {
    path: PATHS.AUTOMATION.HEADER_MODIFICATIONS.ADD_REQUEST_HEADER.RELATIVE,
    element: <AddRequestHeader />,
  },
  {
    path: PATHS.AUTOMATION.HEADER_MODIFICATIONS.REMOVE_REQUEST_HEADER.RELATIVE,
    element: <RemoveRequestHeader />,
  },
  {
    path: PATHS.AUTOMATION.HEADER_MODIFICATIONS.ADD_RESPONSE_HEADER.RELATIVE,
    element: <AddResponseHeader />,
  },
  {
    path: PATHS.AUTOMATION.HEADER_MODIFICATIONS.REMOVE_RESPONSE_HEADER.RELATIVE,
    element: <RemoveResponseHeader />,
  },
];
