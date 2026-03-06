import { useSelector } from "react-redux";
import { selectAllSecretProviders } from "features/apiClient/slices/secrets-manager";
import ManageProvidersRow from "../components/ManageProvidersRow/Index";
import "./index.scss";

const ManageProviders = () => {
  const providers = useSelector(selectAllSecretProviders);

  return (
    <div className="manage-providers-container">
      {providers.map((provider) => (
        <ManageProvidersRow
          key={provider.id}
          providerId={provider.id}
          providerName={provider.name}
          providerType={provider.type}
        />
      ))}
    </div>
  );
};
export default ManageProviders;
