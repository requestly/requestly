import { RouteObject } from "react-router-dom";
import NetworkInspectorContainer from "./container";
import PATHS from "config/constants/sub/paths";
import { NetworkInspectorHomeScreen } from "./screens";

export const networkInspectorRoutes: RouteObject[] = [
  {
    path: PATHS.NETWORK_INSPECTOR.INDEX,
    element: <NetworkInspectorContainer />,
    children: [
      {
        index: true,
        element: <NetworkInspectorHomeScreen />,
      },
    ],
  },
];
