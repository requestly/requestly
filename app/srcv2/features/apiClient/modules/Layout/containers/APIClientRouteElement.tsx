import ErrorBoundaryWrapper from "../components/ApiClientErrorBoundary";
import useApiClientRoute from "../hooks/useApiClientRoute";

import ApiClientLayout from "./ApiClientLayout";

const ApiClientRouteElement: React.FC = () => {
  const { isApiClientCompatible } = useApiClientRoute();
  if (!isApiClientCompatible) {
    return <div>Incompatible Configuration</div>;
  }
  return (
    <ErrorBoundaryWrapper boundaryId="api-client-error-boundary">
      <ApiClientLayout />
    </ErrorBoundaryWrapper>
  );
};

export default ApiClientRouteElement;
