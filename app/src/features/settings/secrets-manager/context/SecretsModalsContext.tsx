import React, { createContext, useContext, useState, useCallback } from "react";

/**
 * Provider Data Interface
 */
export interface ProviderData {
  id?: string;
  instanceName: string;
  secretManager: string;
  authMethod: string;
  accessKey: string;
  secretKey: string;
  sessionToken?: string;
  region: string;
  [key: string]: any;
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
  openEditProviderModal: (data: ProviderData) => void;
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

  const openEditProviderModal = useCallback((data: ProviderData) => {
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

  // Async Actions - Save Provider
  const saveProvider = useCallback(async (formData: Partial<ProviderData>) => {
    setModals((prev) => ({
      ...prev,
      addEdit: { ...prev.addEdit, isLoading: true, error: undefined },
    }));

    try {
      // TODO: Replace with actual API call
      // const response = await api.providers[modals.addEdit.mode](formData);
      console.log("Saving provider:", formData);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

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
      throw error;
    }
  }, []);

  // Async Actions - Test Connection
  const testConnection = useCallback(async () => {
    setModals((prev) => ({
      ...prev,
      addEdit: { ...prev.addEdit, isLoading: true },
    }));

    try {
      // TODO: Replace with actual API call
      // const response = await api.providers.testConnection(modals.addEdit.formData);
      console.log("Testing connection with:", modals.addEdit.formData);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setModals((prev) => ({
        ...prev,
        addEdit: { ...prev.addEdit, isLoading: false, error: undefined },
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Connection test failed";
      setModals((prev) => ({
        ...prev,
        addEdit: { ...prev.addEdit, isLoading: false, error: errorMessage },
      }));
      throw error;
    }
  }, [modals.addEdit.formData]);

  // Async Actions - Delete Provider
  const deleteProvider = useCallback(async () => {
    setModals((prev) => ({
      ...prev,
      delete: { ...prev.delete, isLoading: true, error: undefined },
    }));

    try {
      // TODO: Replace with actual API call
      // const response = await api.providers.delete(modals.delete.selectedProviderId);
      console.log("Deleting provider:", modals.delete.selectedProviderId);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

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
      throw error;
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
