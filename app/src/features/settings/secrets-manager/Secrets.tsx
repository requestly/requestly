import { useSelector } from "react-redux";
import { selectAllSecretProviders } from "features/apiClient/slices/secrets-manager";
import NoProvidersEmptyState from "./NoProviderEmptyState";
import ManageProviders from "./ManageProviders/Index";

const Secrets = () => {
  const providers = useSelector(selectAllSecretProviders);

  if (providers.length === 0) {
    return <NoProvidersEmptyState />;
  }

  return <ManageProviders />;
};

export default Secrets;
