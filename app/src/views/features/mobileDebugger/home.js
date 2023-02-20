import ProtectedRoute from "components/authentication/ProtectedRoute";
import MobileDebuggerHome from "components/features/mobileDebugger/screens/home";

const MobileDebuggerHomeView = (props) => {
  return <ProtectedRoute component={MobileDebuggerHome} />;
};

export default MobileDebuggerHomeView;
