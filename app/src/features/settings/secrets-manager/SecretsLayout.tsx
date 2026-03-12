import React, { useState } from "react";
import { AiOutlineQuestionCircle } from "@react-icons/all-files/ai/AiOutlineQuestionCircle";
import { RQBreadcrumb, RQButton } from "lib/design-system-v2/components";
import FilterIcon from "assets/icons/filter-manage.svg?react";
import ShieldLockIcon from "assets/icons/shield-lock.svg?react";
import { Outlet, useNavigate } from "react-router-dom";
import "./secrets.scss";
import PATHS from "config/constants/sub/paths";
import { useSecretsModals, DEFAULT_FORM_DATA } from "./context/SecretsModalsContext";
import DeleteProviderModal from "./modals/DeleteProviderModal/Index";
import DeleteSecretModal from "./modals/DeleteSecretModal/Index";
import { AddSecretsProviderModal } from "./modals/AddSecretsProviderModal/AddSecretsProviderModal";
import { isDesktopMode } from "utils/AppUtils";
import { useSelector } from "react-redux";
import { selectAllSecretProviders } from "features/apiClient/slices/secrets-manager";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { PRICING } from "features/pricing";
import LINKS from "config/constants/sub/links";

// Made children optional since React Router will mostly use <Outlet />
const SecretsLayout = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate();
  const {
    modals,
    openAddProviderModal,
    closeAddEditProviderModal,
    closeDeleteProviderModal,
    saveProvider,
    testConnection,
    resetConnectionStatus,
    deleteProvider,
    updateAddEditFormData,
    closeDeleteSecretModal,
    deleteSecretConfirmed,
  } = useSecretsModals();

  const { addEdit, delete: deleteModal, deleteSecret: deleteSecretModal } = modals;
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSavingProvider, setIsSavingProvider] = useState(false);

  const currentPath = window.location.pathname;
  const isOnManageProvidersPage = currentPath.includes(PATHS.SETTINGS.SECRETS.MANAGE_PROVIDERS.ABSOLUTE);

  const providersList = useSelector(selectAllSecretProviders);

  const handleManageProvidersClick = () => {
    navigate(PATHS.SETTINGS.SECRETS.MANAGE_PROVIDERS.ABSOLUTE);
  };

  const handleFormChange = (updatedData: any) => {
    updateAddEditFormData(updatedData);
  };

  const handleSave = async () => {
    if (!addEdit.isOpen) {
      return;
    }
    setIsSavingProvider(true);
    try {
      await saveProvider(addEdit.formData);
    } finally {
      setIsSavingProvider(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      await testConnection();
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleDelete = async () => {
    deleteProvider();
  };

  const handleDeleteSecret = async () => {
    deleteSecretConfirmed();
  };

  const handleHelp = (e: React.MouseEvent) => {
    window.open(LINKS.REQUESTLY_SECRETS_DOCS, "_blank", "noopener,noreferrer");
  };

  const onWebApp = !isDesktopMode();
  const user = useSelector(getUserAuthDetails);
  const isUserProfessional = [
    PRICING.PLAN_NAMES.PROFESSIONAL,
    PRICING.PLAN_NAMES.ENTERPRISE,
    PRICING.PLAN_NAMES.PROFESSIONAL_ENTERPRISE,
    PRICING.PLAN_NAMES.API_CLIENT_ENTERPRISE,
    PRICING.PLAN_NAMES.API_CLIENT_PROFESSIONAL,
  ].includes(user?.details?.planDetails?.planName || "");

  const hideAddProviderButton = onWebApp || providersList.length === 0 || !isUserProfessional;
  const hideManageProvidersButton =
    isOnManageProvidersPage || onWebApp || providersList.length === 0 || !isUserProfessional;
  return (
    <main className="secrets-page-container">
      <section className="secrets-content-container">
        {isOnManageProvidersPage && (
          <div className="breadcrumb-container">
            <RQBreadcrumb
              defaultBreadcrumbs={[
                { label: "Secrets", pathname: PATHS.SETTINGS.SECRETS.ABSOLUTE },
                { label: "", pathname: "" },
              ]}
            />
          </div>
        )}
        <div className="header-container">
          <div className="header-left-section">
            {!isOnManageProvidersPage && <ShieldLockIcon className="shield-icon" />}
            <span className="secrets-text">{isOnManageProvidersPage ? "Manage Providers" : "Secrets"}</span>
          </div>
          <div className="header-right-section">
            <RQButton icon={<AiOutlineQuestionCircle className="help-icon" />} type="transparent" onClick={handleHelp}>
              Help
            </RQButton>
            <RQButton
              type="transparent"
              icon={<FilterIcon />}
              onClick={handleManageProvidersClick}
              hidden={hideManageProvidersButton}
            >
              Manage providers
            </RQButton>
            <RQButton type="secondary" onClick={openAddProviderModal} hidden={hideAddProviderButton}>
              Add provider
            </RQButton>
          </div>
        </div>
        {children || <Outlet />}
      </section>

      {/* Global Modals - Available on all pages within this layout */}
      <AddSecretsProviderModal
        mode={addEdit.isOpen ? addEdit.mode : "add"}
        open={addEdit.isOpen}
        providerData={addEdit.isOpen ? addEdit.formData : DEFAULT_FORM_DATA}
        onChange={handleFormChange}
        onClose={closeAddEditProviderModal}
        onSave={handleSave}
        onTestConnection={handleTestConnection}
        onResetConnectionStatus={resetConnectionStatus}
        isFetchingConfig={addEdit.isOpen ? addEdit.isFetchingConfig : false}
        isTestingConnection={isTestingConnection}
        isSavingProvider={isSavingProvider}
        connectionStatus={addEdit.isOpen ? addEdit.connectionStatus : "untested"}
      />

      <DeleteProviderModal
        open={deleteModal.isOpen}
        onClose={closeDeleteProviderModal}
        onDelete={handleDelete}
        isLoading={deleteModal.isOpen ? deleteModal.isLoading : false}
        providerName={deleteModal.isOpen ? deleteModal.providerName : undefined}
      />

      <DeleteSecretModal
        open={deleteSecretModal.isOpen}
        onClose={closeDeleteSecretModal}
        onDelete={handleDeleteSecret}
        isLoading={deleteSecretModal.isOpen ? deleteSecretModal.isLoading : false}
        secretAlias={deleteSecretModal.isOpen ? deleteSecretModal.secretAlias : undefined}
      />
    </main>
  );
};

export default SecretsLayout;
