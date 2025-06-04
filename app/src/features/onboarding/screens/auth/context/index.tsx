import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import APP_CONSTANTS from "config/constants";
import { AuthProvider, AuthScreenMode } from "../types";

interface AuthScreenContextType {
  email: string;
  authMode: string;
  ssoProviderId: string | null;
  isSendEmailInProgress: boolean;
  authProviders: AuthProvider[];
  authScreenMode: AuthScreenMode;
  isOnboardingScreenVisible: boolean;
  isOnboarding: boolean;
  setAuthProviders: (providers: AuthProvider[]) => void;
  handleEmailChange: (email: string) => void;
  setAuthMode: (mode: string) => void;
  setSSOProviderId: (id: string | null) => void;
  setIsSendEmailInProgress: (isInProgress: boolean) => void;
  toggleAuthModal: (value?: boolean) => void;
  eventSource: string;
  isClosable: boolean;
  setEventSource: (source: string) => void;
  setIsOnboardingScreenVisible: (visible: boolean) => void;
  redirectURL: string;
}

const AuthScreenContext = createContext<AuthScreenContextType | undefined>(undefined);

interface AuthScreenContextProviderProps {
  children: ReactNode;
  initialAuthMode?: string;
  screenMode: AuthScreenMode;
  initialEventSource?: string;
  isOnboarding?: boolean;
  toggleModal?: () => void;
  isClosable?: boolean;
  redirectURL?: string;
}

export const AuthScreenContextProvider: React.FC<AuthScreenContextProviderProps> = ({
  children,
  screenMode,
  initialEventSource,
  initialAuthMode = APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
  isOnboarding = false,
  toggleModal,
  isClosable = false,
  redirectURL = window.location.href,
}) => {
  const [email, setEmail] = useState("");
  const [authMode, setAuthMode] = useState(initialAuthMode);
  const [eventSource, setEventSource] = useState(initialEventSource);
  const [ssoProviderId, setSSOProviderId] = useState<string | null>(null);
  const [isSendEmailInProgress, setIsSendEmailInProgress] = useState(false);
  const [authProviders, setAuthProviders] = useState([]);
  const [isOnboardingScreenVisible, setIsOnboardingScreenVisible] = useState(isOnboarding);

  const handleEmailChange = useCallback(
    (value: string) => {
      setEmail(value);
    },
    [setEmail]
  );

  const value = {
    email,
    authMode,
    ssoProviderId,
    isSendEmailInProgress,
    authProviders,
    authScreenMode: screenMode,
    isOnboarding,
    isOnboardingScreenVisible,
    eventSource,
    handleEmailChange,
    setAuthMode,
    setSSOProviderId,
    setIsSendEmailInProgress,
    setAuthProviders,
    toggleAuthModal: toggleModal,
    setEventSource,
    setIsOnboardingScreenVisible,
    isClosable,
    redirectURL,
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
