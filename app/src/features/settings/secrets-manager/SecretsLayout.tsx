import React from "react";
import { AiOutlineQuestionCircle } from "@react-icons/all-files/ai/AiOutlineQuestionCircle";
import { RQBreadcrumb, RQButton } from "lib/design-system-v2/components";
import FilterIcon from "assets/icons/filter-manage.svg?react";
import ShieldLockIcon from "assets/icons/shield-lock.svg?react";
import { Outlet, useNavigate } from "react-router-dom";
import "./secrets.scss";
import PATHS from "config/constants/sub/paths";
import { useSecretsModals, DEFAULT_FORM_DATA } from "./context/SecretsModalsContext";
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

  const { addEdit, delete: deleteModal } = modals;

  const currentPath = window.location.pathname;
  const isOnManageProvidersPage = currentPath.includes(PATHS.SETTINGS.SECRETS.MANAGE_PROVIDERS);

  const handleManageProvidersClick = () => {
    navigate(PATHS.SETTINGS.SECRETS.MANAGE_PROVIDERS);
  };

  const handleFormChange = (updatedData: any) => {
    updateAddEditFormData(updatedData);
  };

  const handleSave = async () => {
    if (!addEdit.isOpen) {
      return;
    }
    try {
      await saveProvider(addEdit.formData);
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
        mode={addEdit.isOpen ? addEdit.mode : "add"}
        open={addEdit.isOpen}
        providerData={addEdit.isOpen ? addEdit.formData : DEFAULT_FORM_DATA}
        onChange={handleFormChange}
        onClose={closeAddEditProviderModal}
        onSave={handleSave}
        onTestConnection={handleTestConnection}
        isLoading={addEdit.isOpen ? addEdit.isLoading : false}
        error={addEdit.isOpen ? addEdit.error : undefined}
      />

      <DeleteProviderModal
        open={deleteModal.isOpen}
        onClose={closeDeleteProviderModal}
        onDelete={handleDelete}
        isLoading={deleteModal.isOpen ? deleteModal.isLoading : false}
        error={deleteModal.isOpen ? deleteModal.error : undefined}
        providerName={deleteModal.isOpen ? deleteModal.providerName : undefined}
      />
    </main>
  );
};

export default SecretsLayout;
