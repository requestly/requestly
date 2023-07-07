import InterceptorUI from "components/features/mobileDebugger/features/interceptor/InterceptorUI";
import withAppDetailsHoc from "../../hoc/withAppDetailsHoc";

const MobileDebuggerInterceptor = ({ appId }) => {
  // TODO: Move Interceptor Code Here Directly
  return <InterceptorUI appId={appId} />;
};

export default withAppDetailsHoc(MobileDebuggerInterceptor);
