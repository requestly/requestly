import ProtectedRoute from "components/authentication/ProtectedRoute";
import MobileDebuggerInterceptor from "components/features/mobileDebugger/features/interceptor";

const MobileDebuggerInterceptorView = () => {
  return <ProtectedRoute component={MobileDebuggerInterceptor} />;
};

export default MobileDebuggerInterceptorView;
