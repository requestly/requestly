import { useParams } from "react-router-dom";

const MobileDebuggerUnauthorized = () => {
  const { appId } = useParams();

  return <h1>Unauthorized appId {appId}</h1>;
};

export default MobileDebuggerUnauthorized;
