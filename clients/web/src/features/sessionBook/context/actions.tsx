import React, { createContext, useCallback, useContext } from "react";
import { Modal } from "antd";
import { RiErrorWarningLine } from "@react-icons/all-files/ri/RiErrorWarningLine";
import { deleteRecording } from "views/features/sessions/api";

type SessionsActionContextType = {
  handleDeleteSessionAction: (id: string, eventsFilePath: string, callback?: () => void) => void;
};

const SessionsActionContext = createContext<SessionsActionContextType>(null);

interface RulesProviderProps {
  children: React.ReactElement;
}

export const SessionsActionContextProvider: React.FC<RulesProviderProps> = ({ children }) => {
  const handleDeleteSessionAction = useCallback((id: string, eventsFilePath: string, callback?: () => void) => {
    Modal.confirm({
      title: "Confirm",
      icon: <RiErrorWarningLine className="anticon" />,
      content: (
        <div>
          <p>
            Are you sure to delete this recording?
            <br />
            <br />
            Users having the shared link will not be able to access it anymore.
          </p>
        </div>
      ),
      okText: "Delete",
      cancelText: "Cancel",
      onOk: async () => {
        await deleteRecording(id, eventsFilePath);
        callback?.();
      },
    });
  }, []);

  const value = { handleDeleteSessionAction };

  return <SessionsActionContext.Provider value={value}>{children}</SessionsActionContext.Provider>;
};

export const useSessionsActionContext = () => useContext(SessionsActionContext);
