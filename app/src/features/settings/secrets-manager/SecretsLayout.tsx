import React from "react";
import { AiOutlineQuestionCircle } from "@react-icons/all-files/ai/AiOutlineQuestionCircle";
import { RQBreadcrumb, RQButton } from "lib/design-system-v2/components";
import FilterIcon from "assets/icons/filter-manage.svg?react";
import ShieldLockIcon from "assets/icons/shield-lock.svg?react";
import { Outlet, useNavigate } from "react-router-dom";
import "./secrets.scss";
import PATHS from "config/constants/sub/paths";
import { useSecretsModals } from "./context/SecretsModalsContext";
import { AddEditProviderModal } from "./modals/AddEditProviderModal/Index";
import DeleteProviderModal from "./modals/DeleteProviderModal/Index";

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
    deleteProvider,
    updateAddEditFormData,
  } = useSecretsModals();

  console.log(modals, "Current state of secrets modals");

  const currentPath = window.location.pathname;
  const isOnManageProvidersPage = currentPath.includes(PATHS.SETTINGS.SECRETS.MANAGE_PROVIDERS);

  const handleManageProvidersClick = () => {
    navigate(PATHS.SETTINGS.SECRETS.MANAGE_PROVIDERS);
  };

  const handleFormChange = (updatedData: any) => {
    console.log("Form data updated:", updatedData);
    updateAddEditFormData(updatedData);
  };

  const handleSave = async () => {
    try {
      await saveProvider(modals.addEdit.formData || {});
    } catch (error) {
      console.error("Failed to save provider:", error);
    }
  };

  const handleTestConnection = async () => {
    try {
      await testConnection();
    } catch (error) {
      console.error("Connection test failed:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProvider();
    } catch (error) {
      console.error("Failed to delete provider:", error);
    }
  };

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
            {!isOnManageProvidersPage && <ShieldLockIcon />}
            <span className="secrets-text">{isOnManageProvidersPage ? "Manage Providers" : "Secrets"}</span>
          </div>
          <div className="header-right-section">
            <RQButton icon={<AiOutlineQuestionCircle />} type="transparent">
              Help
            </RQButton>
            <RQButton
              type="transparent"
              icon={<FilterIcon />}
              onClick={handleManageProvidersClick}
              hidden={isOnManageProvidersPage}
            >
              Manage providers
            </RQButton>
            <RQButton type="secondary" onClick={openAddProviderModal}>
              Add provider
            </RQButton>
          </div>
        </div>
        {children || <Outlet />}
      </section>

      {/* Global Modals - Available on all pages within this layout */}
      <AddEditProviderModal
        mode={modals.addEdit.mode}
        open={modals.addEdit.isOpen}
        providerData={modals.addEdit.formData}
        onChange={handleFormChange}
        onClose={closeAddEditProviderModal}
        onSave={handleSave}
        onTestConnection={handleTestConnection}
        isLoading={modals.addEdit.isLoading}
        error={modals.addEdit.error}
      />

      <DeleteProviderModal
        open={modals.delete.isOpen}
        onClose={closeDeleteProviderModal}
        onDelete={handleDelete}
        isLoading={modals.delete.isLoading}
        error={modals.delete.error}
        providerName={modals.delete.selectedProviderName}
      />
    </main>
  );
};

export default SecretsLayout;
