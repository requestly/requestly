import { useCommand } from "features/apiClient/commands";
import { useCallback } from "react";
import { AIChat } from "../types";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { MdOutlineFolder } from "@react-icons/all-files/md/MdOutlineFolder";
import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";

export const useChatActions = () => {
  const { api, env } = useCommand();

  // TODO: Add commands for request and collection creation

  const handleAction = useCallback(
    async (action: AIChat.Action) => {
      switch (action.type) {
        case "create_request":
          return () => Promise.resolve();
        case "create_collection":
          return () => Promise.resolve();
        case "create_environment":
          return env.createEnvironment({
            newEnvironmentName: "NEW ENV FROM CHAT",
            variables: {},
          });
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
    },
    [env]
  );

  const getChatActionButtonProps = useCallback((action: AIChat.Action) => {
    switch (action.type) {
      case "create_request":
        return { children: "Create Request", icon: <MdAdd /> };
      case "create_collection":
        return { children: "Create Collection", icon: <MdOutlineFolder /> };
      case "create_environment":
        return { children: "Create Environment", icon: <MdHorizontalSplit /> };
      default:
        return {};
    }
  }, []);

  return {
    handleAction,
    getChatActionButtonProps,
  };
};
