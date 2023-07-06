import { RouteObject } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import MobileDebuggerDashboard from "components/features/mobileDebugger";
import MobileDebuggerHome from "components/features/mobileDebugger/screens/home";
import MobileDebuggerInterceptor from "components/features/mobileDebugger/features/interceptor";
import MobileDebuggerUnauthorized from "components/features/mobileDebugger/screens/unauthorized";
import MobileDebuggerCreateApp from "components/features/mobileDebugger/screens/createApp";
import ProtectedRoute from "components/authentication/ProtectedRoute";

export const mobileDebuggerRoutes: RouteObject[] = [
  {
    path: PATHS.MOBILE_DEBUGGER.RELATIVE,
    element: <MobileDebuggerDashboard />,
  },
  {
    path: PATHS.MOBILE_DEBUGGER.HOME.RELATIVE,
    element: <ProtectedRoute component={MobileDebuggerHome} />,
  },
  {
    path: PATHS.MOBILE_DEBUGGER.INTERCEPTOR.RELATIVE,
    element: <ProtectedRoute component={MobileDebuggerInterceptor} />,
  },
  {
    path: PATHS.MOBILE_DEBUGGER.UNAUTHORIZED.RELATIVE,
    element: <MobileDebuggerUnauthorized />,
  },
  {
    path: PATHS.MOBILE_DEBUGGER.NEW.RELATIVE,
    element: <ProtectedRoute component={MobileDebuggerCreateApp} />,
  },
];
