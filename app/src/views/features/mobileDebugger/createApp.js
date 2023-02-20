import ProtectedRoute from "components/authentication/ProtectedRoute";
import CreateApp from "components/features/mobileDebugger/screens/createApp";

const MobileDebuggerCreateApp = () => {
  return <ProtectedRoute component={CreateApp} />;
};

export default MobileDebuggerCreateApp;
