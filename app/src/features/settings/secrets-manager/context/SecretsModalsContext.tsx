import {
  AWSSecretProviderConfig,
  SecretProviderConfig,
  SecretProviderType,
} from "@requestly/shared/types/entities/secretsManager";
import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { secretsManagerService, toSecretProviderConfig, toProviderData } from "services/secretsManagerService";
import { toast } from "utils/Toast";

export interface ProviderData {
  instanceName: SecretProviderConfig["name"];
  secretManagerType: SecretProviderConfig["type"];
  authMethod: "manual";
  accessKey: AWSSecretProviderConfig["credentials"]["accessKeyId"];
  secretKey: AWSSecretProviderConfig["credentials"]["secretAccessKey"];
  sessionToken?: AWSSecretProviderConfig["credentials"]["sessionToken"];
  region: AWSSecretProviderConfig["credentials"]["region"];
  createdAt?: SecretProviderConfig["createdAt"];
}

export const DEFAULT_FORM_DATA: ProviderData = {
  instanceName: "",
  secretManagerType: SecretProviderType.AWS_SECRETS_MANAGER,
  authMethod: "manual",
  accessKey: "",
  secretKey: "",
  region: "",
};

type AddEditModalState =
  | { isOpen: false }
  | {
      isOpen: true;
      mode: "add" | "edit";
      editingProviderId?: string;
      formData: ProviderData;
      isLoading: boolean;
      error?: string;
    };

type DeleteModalState =
  | { isOpen: false }
  | {
      isOpen: true;
      providerId: string;
      providerName: string;
      isLoading: boolean;
      error?: string;
    };

interface ModalState {
  addEdit: AddEditModalState;
  delete: DeleteModalState;
}

interface SecretsModalsContextValue {
  modals: ModalState;

  openAddProviderModal: () => void;
  openEditProviderModal: (providerId: string) => Promise<void>;
  closeAddEditProviderModal: () => void;
  updateAddEditFormData: (formData: Partial<ProviderData>) => void;
  saveProvider: (formData: ProviderData) => Promise<void>;
  testConnection: () => Promise<void>;

  openDeleteProviderModal: (providerId: string, providerName: string) => void;
  closeDeleteProviderModal: () => void;
  deleteProvider: () => Promise<void>;
}

const initialState: ModalState = {
  addEdit: { isOpen: false },
  delete: { isOpen: false },
};

const SecretsModalsContext = createContext<SecretsModalsContextValue | undefined>(undefined);

export const SecretsModalsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modals, setModals] = useState<ModalState>(initialState);
  const modalsRef = useRef(modals);
  modalsRef.current = modals;

  const openAddProviderModal = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      addEdit: {
        isOpen: true,
        mode: "add",
        formData: { ...DEFAULT_FORM_DATA },
        isLoading: false,
      },
    }));
  }, []);

  const openEditProviderModal = useCallback(async (providerId: string) => {
    setModals((prev) => ({
      ...prev,
      addEdit: {
        isOpen: true,
        mode: "edit",
        editingProviderId: providerId,
        formData: { ...DEFAULT_FORM_DATA },
        isLoading: true,
      },
    }));

    try {
      const result = await secretsManagerService.getProviderConfig(providerId);

      if (result.type === "error" || !result.data) {
        toast.error(result.type === "error" ? result.error.message : "Provider not found");
        setModals((prev) => ({ ...prev, addEdit: { isOpen: false } }));
        return;
      }

      const data = toProviderData(result.data);

      setModals((prev) => {
        const currentState = modalsRef.current.addEdit;
        if (!currentState.isOpen || currentState.mode !== "edit" || currentState.editingProviderId !== providerId) {
          return prev;
        }

        return {
          ...prev,
          addEdit: {
            isOpen: true,
            mode: "edit",
            editingProviderId: providerId,
            formData: { ...data },
            isLoading: false,
          },
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load provider configuration";
      toast.error(errorMessage);
      setModals((prev) => ({ ...prev, addEdit: { isOpen: false } }));
    }
  }, []);

  const closeAddEditProviderModal = useCallback(() => {
    setModals((prev) => ({ ...prev, addEdit: { isOpen: false } }));
  }, []);

  const updateAddEditFormData = useCallback((formData: Partial<ProviderData>) => {
    setModals((prev) => {
      if (!prev.addEdit.isOpen) {
        return prev;
      }
      return {
        ...prev,
        addEdit: {
          ...prev.addEdit,
          formData: { ...prev.addEdit.formData, ...formData },
          error: undefined,
        },
      };
    });
  }, []);

  const openDeleteProviderModal = useCallback((providerId: string, providerName: string) => {
    setModals((prev) => ({
      ...prev,
      delete: {
        isOpen: true,
        providerId,
        providerName,
        isLoading: false,
      },
    }));
  }, []);

  const closeDeleteProviderModal = useCallback(() => {
    setModals((prev) => ({ ...prev, delete: { isOpen: false } }));
  }, []);

  const setAddEditLoading = useCallback((isLoading: boolean, error?: string) => {
    setModals((prev) => {
      if (!prev.addEdit.isOpen) return prev;
      return { ...prev, addEdit: { ...prev.addEdit, isLoading, error } };
    });
  }, []);

  const handleAddEditError = useCallback(
    (error: unknown, defaultMessage: string) => {
      const errorMessage = error instanceof Error ? error.message : defaultMessage;
      setAddEditLoading(false, errorMessage);
    },
    [setAddEditLoading]
  );

  const saveProvider = useCallback(
    async (formData: ProviderData) => {
      setAddEditLoading(true, undefined);

      try {
        const addEditState = modalsRef.current.addEdit;
        const existingId =
          addEditState.isOpen && addEditState.mode === "edit" ? addEditState.editingProviderId : undefined;
        const mode = addEditState.isOpen ? addEditState.mode : "add";

        const config = toSecretProviderConfig(formData, existingId);
        const result = await secretsManagerService.setProviderConfig(config);

        if (result.type === "error") {
          setAddEditLoading(false, result.error.message);
          return;
        }

        toast.success(`Provider ${mode === "add" ? "added" : "updated"} successfully`);
        setModals((prev) => ({ ...prev, addEdit: { isOpen: false } }));
      } catch (error) {
        handleAddEditError(error, "Failed to save provider");
      }
    },
    [setAddEditLoading, handleAddEditError]
  );

  const testConnection = useCallback(async () => {
    setAddEditLoading(true, undefined);

    try {
      const addEditState = modalsRef.current.addEdit;
      if (!addEditState.isOpen) {
        return;
      }

      const existingId = addEditState.mode === "edit" ? addEditState.editingProviderId : undefined;
      const config = toSecretProviderConfig(addEditState.formData, existingId);
      const result = await secretsManagerService.testConnectionWithConfig(config);

      if (result.type === "error") {
        setAddEditLoading(false, result.error.message);
        return;
      }

      if (result.data) {
        toast.success("Connection successful");
      } else {
        toast.error("Connection failed. Please check your credentials.");
      }

      setAddEditLoading(false, result.data ? undefined : "Connection test failed");
    } catch (error) {
      handleAddEditError(error, "Connection test failed");
    }
  }, [setAddEditLoading, handleAddEditError]);

  const deleteProvider = useCallback(async () => {
    const deleteState = modalsRef.current.delete;
    if (!deleteState.isOpen) {
      return;
    }
    const providerId = deleteState.providerId;

    setModals((prev) => {
      if (!prev.delete.isOpen) {
        return prev;
      }
      return { ...prev, delete: { ...prev.delete, isLoading: true, error: undefined } };
    });

    try {
      const result = await secretsManagerService.removeProviderConfig(providerId);

      if (result.type === "error") {
        setModals((prev) => {
          if (!prev.delete.isOpen) {
            return prev;
          }
          return { ...prev, delete: { ...prev.delete, isLoading: false, error: result.error.message } };
        });
        return;
      }

      toast.success("Provider deleted successfully");
      setModals((prev) => ({ ...prev, delete: { isOpen: false } }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete provider";
      setModals((prev) => {
        if (!prev.delete.isOpen) {
          return prev;
        }
        return { ...prev, delete: { ...prev.delete, isLoading: false, error: errorMessage } };
      });
    }
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
  };

  return <SecretsModalsContext.Provider value={value}>{children}</SecretsModalsContext.Provider>;
};

export const useSecretsModals = (): SecretsModalsContextValue => {
  const context = useContext(SecretsModalsContext);

  if (!context) {
    throw new Error("useSecretsModals must be used within SecretsModalsProvider");
  }

  return context;
};
