import { AWSSecretProviderConfig, SecretProviderConfig } from "@requestly/shared/types/entities/secretsManager";
import React, { createContext, useContext, useState, useCallback } from "react";
import { secretsManagerService, toSecretProviderConfig, toProviderData } from "services/secretsManagerService";
import { toast } from "utils/Toast";

/**
 * Provider Data Interface
 */
export interface ProviderData {
  id?: string;
  instanceName: SecretProviderConfig["name"];
  secretManagerType: SecretProviderConfig["type"];
  authMethod: string;
  accessKey: AWSSecretProviderConfig["credentials"]["accessKeyId"];
  secretKey: AWSSecretProviderConfig["credentials"]["secretAccessKey"];
  sessionToken?: AWSSecretProviderConfig["credentials"]["sessionToken"];
  region: AWSSecretProviderConfig["credentials"]["region"];
}

/**
 * Modal State Interface
 * Centralized state management for all modals in secrets manager
 */
interface ModalState {
  addEdit: {
    isOpen: boolean;
    mode: "add" | "edit";
    data?: ProviderData;
    formData?: Partial<ProviderData>;
    isLoading?: boolean;
    error?: string;
  };
  delete: {
    isOpen: boolean;
    selectedProviderId?: string;
    selectedProviderName?: string;
    isLoading?: boolean;
    error?: string;
  };
}

/**
 * Context Actions Interface
 */
interface SecretsModalsContextValue {
  // State
  modals: ModalState;

  // AddEdit Modal Actions
  openAddProviderModal: () => void;
  openEditProviderModal: (providerId: string) => Promise<void>;
  closeAddEditProviderModal: () => void;
  updateAddEditFormData: (formData: Partial<ProviderData>) => void;
  saveProvider: (formData: Partial<ProviderData>) => Promise<void>;
  testConnection: () => Promise<void>;

  // Delete Modal Actions
  openDeleteProviderModal: (providerId: string, providerName: string) => void;
  closeDeleteProviderModal: () => void;
  deleteProvider: () => Promise<void>;

  // Batch Actions
  closeAllModals: () => void;
}

const initialState: ModalState = {
  addEdit: {
    isOpen: false,
    mode: "add",
    data: undefined,
    formData: {},
    isLoading: false,
    error: undefined,
  },
  delete: {
    isOpen: false,
    selectedProviderId: undefined,
    selectedProviderName: undefined,
    isLoading: false,
    error: undefined,
  },
};

// Create context with undefined default (will be provided by Provider)
const SecretsModalsContext = createContext<SecretsModalsContextValue | undefined>(undefined);

/**
 * Provider Component
 * Wraps the secrets manager feature with modal state management
 */
export const SecretsModalsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modals, setModals] = useState<ModalState>(initialState);

  // AddEdit Modal Actions
  const openAddProviderModal = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      addEdit: {
        isOpen: true,
        mode: "add",
        data: undefined,
        formData: {},
        isLoading: false,
        error: undefined,
      },
    }));
  }, []);

  const openEditProviderModal = useCallback(async (providerId: string) => {
    setModals((prev) => ({
      ...prev,
      addEdit: { ...prev.addEdit, isLoading: true },
    }));

    const result = await secretsManagerService.getProviderConfig(providerId);

    if (result.type === "error" || !result.data) {
      toast.error(result.type === "error" ? result.error.message : "Provider not found");
      setModals((prev) => ({
        ...prev,
        addEdit: { ...prev.addEdit, isLoading: false },
      }));
      return;
    }

    const data = toProviderData(result.data);

    console.log("!!!debug", "result data", {
      result,
      data,
    });
    setModals((prev) => ({
      ...prev,
      addEdit: {
        isOpen: true,
        mode: "edit",
        data,
        formData: { ...data },
        isLoading: false,
        error: undefined,
      },
    }));
  }, []);

  const closeAddEditProviderModal = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      addEdit: {
        isOpen: false,
        mode: "add",
        data: undefined,
        formData: {},
        isLoading: false,
        error: undefined,
      },
    }));
  }, []);

  const updateAddEditFormData = useCallback((formData: Partial<ProviderData>) => {
    setModals((prev) => ({
      ...prev,
      addEdit: {
        ...prev.addEdit,
        formData: { ...prev.addEdit.formData, ...formData },
        error: undefined,
      },
    }));
  }, []);

  // Delete Modal Actions
  const openDeleteProviderModal = useCallback((providerId: string, providerName: string) => {
    setModals((prev) => ({
      ...prev,
      delete: {
        isOpen: true,
        selectedProviderId: providerId,
        selectedProviderName: providerName,
        isLoading: false,
        error: undefined,
      },
    }));
  }, []);

  const closeDeleteProviderModal = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      delete: {
        isOpen: false,
        selectedProviderId: undefined,
        selectedProviderName: undefined,
        isLoading: false,
        error: undefined,
      },
    }));
  }, []);

  const saveProvider = useCallback(
    async (formData: Partial<ProviderData>) => {
      setModals((prev) => ({
        ...prev,
        addEdit: { ...prev.addEdit, isLoading: true, error: undefined },
      }));

      try {
        const existingId = modals.addEdit.mode === "edit" ? modals.addEdit.data?.id : undefined;
        const config = toSecretProviderConfig(formData, existingId);
        const result = await secretsManagerService.setProviderConfig(config);

        if (result.type === "error") {
          setModals((prev) => ({
            ...prev,
            addEdit: { ...prev.addEdit, isLoading: false, error: result.error.message },
          }));
          return;
        }

        toast.success(`Provider ${modals.addEdit.mode === "add" ? "added" : "updated"} successfully`);
        setModals((prev) => ({
          ...prev,
          addEdit: {
            isOpen: false,
            mode: "add",
            data: undefined,
            formData: {},
            isLoading: false,
            error: undefined,
          },
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to save provider";
        setModals((prev) => ({
          ...prev,
          addEdit: { ...prev.addEdit, isLoading: false, error: errorMessage },
        }));
      }
    },
    [modals.addEdit.mode, modals.addEdit.data?.id]
  );

  const testConnection = useCallback(async () => {
    setModals((prev) => ({
      ...prev,
      addEdit: { ...prev.addEdit, isLoading: true, error: undefined },
    }));

    try {
      console.log("!!!debug", "test connection");
      const existingId = modals.addEdit.mode === "edit" ? modals.addEdit.data?.id : undefined;
      const config = toSecretProviderConfig(modals.addEdit.formData || {}, existingId);
      const result = await secretsManagerService.testConnectionWithConfig(config);

      console.log("!!!debug", "result", result);
      if (result.type === "error") {
        setModals((prev) => ({
          ...prev,
          addEdit: { ...prev.addEdit, isLoading: false, error: result.error.message },
        }));
        return;
      }

      if (result.data) {
        toast.success("Connection successful");
      } else {
        toast.error("Connection failed. Please check your credentials.");
      }

      setModals((prev) => ({
        ...prev,
        addEdit: { ...prev.addEdit, isLoading: false, error: result.data ? undefined : "Connection test failed" },
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Connection test failed";
      setModals((prev) => ({
        ...prev,
        addEdit: { ...prev.addEdit, isLoading: false, error: errorMessage },
      }));
    }
  }, [modals.addEdit.formData, modals.addEdit.mode, modals.addEdit.data?.id]);

  const deleteProvider = useCallback(async () => {
    const providerId = modals.delete.selectedProviderId;
    if (!providerId) return;

    setModals((prev) => ({
      ...prev,
      delete: { ...prev.delete, isLoading: true, error: undefined },
    }));

    try {
      const result = await secretsManagerService.removeProviderConfig(providerId);

      if (result.type === "error") {
        setModals((prev) => ({
          ...prev,
          delete: { ...prev.delete, isLoading: false, error: result.error.message },
        }));
        return;
      }

      toast.success("Provider deleted successfully");
      setModals((prev) => ({
        ...prev,
        delete: {
          isOpen: false,
          selectedProviderId: undefined,
          selectedProviderName: undefined,
          isLoading: false,
          error: undefined,
        },
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete provider";
      setModals((prev) => ({
        ...prev,
        delete: { ...prev.delete, isLoading: false, error: errorMessage },
      }));
    }
  }, [modals.delete.selectedProviderId]);

  // Batch Actions
  const closeAllModals = useCallback(() => {
    setModals(initialState);
  }, []);

  const value: SecretsModalsContextValue = {
    modals,
    openAddProviderModal,
    openEditProviderModal,
    closeAddEditProviderModal,
    updateAddEditFormData,
    saveProvider,
    testConnection,
    openDeleteProviderModal,
    closeDeleteProviderModal,
    deleteProvider,
    closeAllModals,
  };

  return <SecretsModalsContext.Provider value={value}>{children}</SecretsModalsContext.Provider>;
};

/**
 * Custom hook to use the modals context
 * Throws error if used outside of provider
 */
export const useSecretsModals = (): SecretsModalsContextValue => {
  const context = useContext(SecretsModalsContext);

  if (!context) {
    throw new Error("useSecretsModals must be used within SecretsModalsProvider");
  }

  return context;
};
