import React, { createContext, useCallback, useContext } from "react";
import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { deleteRecording } from "views/features/sessions/api";

type SessionsActionContextType = {
  handleDeleteSessionAction: (id: string, eventsFilePath: string, handleForceRender: () => void) => void;
};

const SessionsActionContext = createContext<SessionsActionContextType>(null);

interface RulesProviderProps {
  children: React.ReactElement;
}

export const SessionsActionContextProvider: React.FC<RulesProviderProps> = ({ children }) => {
  const handleDeleteSessionAction = useCallback((id: string, eventsFilePath: string, handleForceRender: () => void) => {
    Modal.confirm({
      title: "Confirm",
      /* antD modal by default applied warining and size styles to antd icons
      TODO: use react-icons instead of antd icons when revamping sessions UI
      */
      icon: <ExclamationCircleOutlined />,
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
        handleForceRender();
      },
    });
  }, []);

  const value = { handleDeleteSessionAction };

  return <SessionsActionContext.Provider value={value}>{children}</SessionsActionContext.Provider>;
};

export const useSessionsActionContext = () => useContext(SessionsActionContext);
