import { RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import MobileDebuggerDashboardView from "views/features/mobileDebugger";
import MobileDebuggerHomeView from "views/features/mobileDebugger/home";
import MobileDebuggerInterceptorView from "views/features/mobileDebugger/features/interceptor";
import MobileDebuggerUnauthorized from "components/features/mobileDebugger/screens/unauthorized";
import MobileDebuggerCreateApp from "views/features/mobileDebugger/createApp";

export const mobileDebuggerRoutes: RouteObject[] = [
  {
    path: PATHS.MOBILE_DEBUGGER.RELATIVE,
    element: <MobileDebuggerDashboardView />,
  },
  {
    path: PATHS.MOBILE_DEBUGGER.HOME.RELATIVE,
    element: <MobileDebuggerHomeView />,
  },
  {
    path: PATHS.MOBILE_DEBUGGER.INTERCEPTOR.RELATIVE,
    element: <MobileDebuggerInterceptorView />,
  },
  {
    path: PATHS.MOBILE_DEBUGGER.UNAUTHORIZED.RELATIVE,
    element: <MobileDebuggerUnauthorized />,
  },
  {
    path: PATHS.MOBILE_DEBUGGER.NEW.RELATIVE,
    element: <MobileDebuggerCreateApp />,
  },
];
