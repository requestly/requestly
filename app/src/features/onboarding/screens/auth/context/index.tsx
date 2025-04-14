import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import APP_CONSTANTS from "config/constants";
import { AuthProvider } from "../types";
import { useDispatch } from "react-redux";
import { globalActions } from "store/slices/global/slice";

interface AuthScreenContextType {
  email: string;
  authMode: string;
  ssoProviderId: string | null;
  isSendEmailInProgress: boolean;
  authProviders: AuthProvider[];
  setAuthProviders: (providers: AuthProvider[]) => void;
  handleEmailChange: (email: string) => void;
  setAuthMode: (mode: string) => void;
  setSSOProviderId: (id: string | null) => void;
  setIsSendEmailInProgress: (isInProgress: boolean) => void;
  toggleAuthModal: () => void;
}

const AuthScreenContext = createContext<AuthScreenContextType | undefined>(undefined);

interface AuthScreenContextProviderProps {
  children: ReactNode;
  initialAuthMode?: string;
}

export const AuthScreenContextProvider: React.FC<AuthScreenContextProviderProps> = ({
  children,
  initialAuthMode = APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
}) => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [authMode, setAuthMode] = useState(initialAuthMode);
  const [ssoProviderId, setSSOProviderId] = useState<string | null>(null);
  const [isSendEmailInProgress, setIsSendEmailInProgress] = useState(false);
  const [authProviders, setAuthProviders] = useState([]);

  const handleEmailChange = useCallback(
    (value: string) => {
      setEmail(value);
    },
    [setEmail]
  );

  const toggleAuthModal = useCallback(() => {
    dispatch(
      globalActions.toggleActiveModal({
        modalName: "authModal",
        newValue: false,
      })
    );
  }, [dispatch]);

  const value = {
    email,
    authMode,
    ssoProviderId,
    isSendEmailInProgress,
    authProviders,
    handleEmailChange,
    setAuthMode,
    setSSOProviderId,
    setIsSendEmailInProgress,
    setAuthProviders,
    toggleAuthModal,
  };

  return <AuthScreenContext.Provider value={value}>{children}</AuthScreenContext.Provider>;
};

export const useAuthScreenContext = () => {
  const context = useContext(AuthScreenContext);
  if (context === undefined) {
    throw new Error("useAuthScreenContext must be used within an AuthScreenContextProvider");
  }
  return context;
};
