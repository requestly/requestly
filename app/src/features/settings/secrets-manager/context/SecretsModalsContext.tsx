import {
  AWSSecretProviderConfig,
  SecretProviderConfig,
  SecretProviderType,
} from "@requestly/shared/types/entities/secretsManager";
import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { secretsManagerService, toSecretProviderConfig, toProviderData } from "services/secretsManagerService";
import {
  saveProvider as saveProviderThunk,
  deleteProvider as deleteProviderThunk,
  deleteSecret,
} from "features/apiClient/slices/secrets-manager";
import { toast } from "utils/Toast";
import { AppDispatch } from "store/types";
import { notification } from "antd";

export interface ProviderData {
  instanceName: SecretProviderConfig["name"];
  secretManagerType: SecretProviderConfig["type"];
  authMethod: "manual" | "aws";
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
      isFetchingConfig: boolean;
    };

type DeleteModalState =
  | { isOpen: false }
  | {
      isOpen: true;
      providerId: string;
      providerName: string;
      isLoading: boolean;
    };

type DeleteSecretModalState =
  | { isOpen: false }
  | {
      isOpen: true;
      providerId: string;
      secretReference: any;
      secretAlias: string;
      isLoading: boolean;
    };

interface ModalState {
  addEdit: AddEditModalState;
  delete: DeleteModalState;
  deleteSecret: DeleteSecretModalState;
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

  openDeleteSecretModal: (providerId: string, secretReference: any, secretAlias: string) => void;
  closeDeleteSecretModal: () => void;
  deleteSecretConfirmed: () => Promise<void>;
}

const initialState: ModalState = {
  addEdit: { isOpen: false },
  delete: { isOpen: false },
  deleteSecret: { isOpen: false },
};

const SecretsModalsContext = createContext<SecretsModalsContextValue | undefined>(undefined);

const notifyError = (message: string, description: string) => {
  notification.warn({
    message,
    description,
    placement: "bottomRight",
    className: "add-secrets-provider-notification",
  });
};

export const SecretsModalsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
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
        isFetchingConfig: false,
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
        isFetchingConfig: true,
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
            isFetchingConfig: false,
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

  const saveProvider = useCallback(
    async (formData: ProviderData) => {
      const addEditState = modalsRef.current.addEdit;
      const existingId =
        addEditState.isOpen && addEditState.mode === "edit" ? addEditState.editingProviderId : undefined;
      const mode = addEditState.isOpen ? addEditState.mode : "add";

      const result = await dispatch(saveProviderThunk({ formData, existingId, mode }));

      if (saveProviderThunk.rejected.match(result)) {
        notifyError(`Failed to save provider`, result.payload ?? "Failed to save provider");
        return;
      }

      toast.success(`Provider ${mode === "add" ? "added" : "updated"} successfully and is now active`);
      setModals((prev) => ({ ...prev, addEdit: { isOpen: false } }));
    },
    [dispatch]
  );

  const testConnection = useCallback(async () => {
    try {
      const addEditState = modalsRef.current.addEdit;
      if (!addEditState.isOpen) {
        return;
      }

      const existingId = addEditState.mode === "edit" ? addEditState.editingProviderId : undefined;
      const config = toSecretProviderConfig(addEditState.formData, existingId);
      const result = await secretsManagerService.testConnectionWithConfig(config);

      if (result.type === "error") {
        notifyError(`Connection failed`, result.error.message);
        return;
      }

      if (result.data) {
        toast.success("Connection successful");
      } else {
        notifyError(`Connection failed`, "Please check your credentials.");
      }
    } catch (error) {
      notifyError(`Connection failed`, error instanceof Error ? error.message : "Failed to test connection");
    }
  }, []);

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
      await dispatch(deleteProviderThunk(providerId));

      toast.success(`"${deleteState.providerName}" deleted`);
      setModals((prev) => ({ ...prev, delete: { isOpen: false } }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete provider";
      notifyError(`Failed to delete provider`, errorMessage);
    }
  }, [dispatch]);

  const openDeleteSecretModal = useCallback((providerId: string, secretReference: any, secretAlias: string) => {
    setModals((prev) => ({
      ...prev,
      deleteSecret: {
        isOpen: true,
        providerId,
        secretReference,
        secretAlias,
        isLoading: false,
      },
    }));
  }, []);

  const closeDeleteSecretModal = useCallback(() => {
    setModals((prev) => ({ ...prev, deleteSecret: { isOpen: false } }));
  }, []);

  const deleteSecretConfirmed = useCallback(async () => {
    const deleteSecretState = modalsRef.current.deleteSecret;
    if (!deleteSecretState.isOpen) {
      return;
    }

    const { providerId, secretReference } = deleteSecretState;

    setModals((prev) => {
      if (!prev.deleteSecret.isOpen) {
        return prev;
      }
      return { ...prev, deleteSecret: { ...prev.deleteSecret, isLoading: true } };
    });

    try {
      await dispatch(deleteSecret({ providerId, secretReference }));
      setModals((prev) => ({ ...prev, deleteSecret: { isOpen: false } }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete secret";
      notifyError(`Failed to delete secret`, errorMessage);
      setModals((prev) => {
        if (!prev.deleteSecret.isOpen) {
          return prev;
        }
        return { ...prev, deleteSecret: { ...prev.deleteSecret, isLoading: false } };
      });
    }
  }, [dispatch]);

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
    openDeleteSecretModal,
    closeDeleteSecretModal,
    deleteSecretConfirmed,
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
