import { useSelector } from "react-redux";
import { selectAllSecretProviders, selectSelectedProviderId } from "features/apiClient/slices/secrets-manager";
import ManageProvidersRow from "../components/ManageProvidersRow/Index";
import "./index.scss";

const ManageProviders = () => {
  const providers = useSelector(selectAllSecretProviders);
  const selectedProviderId = useSelector(selectSelectedProviderId);
  const activeProvider = selectedProviderId ? providers.find((p) => p.id === selectedProviderId) : null;

  return (
    <div className="manage-providers-container">
      {providers.map((provider) => (
        <ManageProvidersRow
          key={provider.id}
          providerId={provider.id}
          providerName={provider.name}
          providerType={provider.type}
          isActive={activeProvider?.id === provider.id}
        />
      ))}
    </div>
  );
};
export default ManageProviders;
