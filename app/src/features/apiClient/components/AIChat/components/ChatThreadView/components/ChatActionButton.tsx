import React, { useCallback, useState } from "react";
import { AIChat } from "../../../types";
import { useChatActions } from "../../../hooks/useChatActions";
import { RQButton } from "lib/design-system-v2/components";

interface Props {
  action: AIChat.Action;
}

export const ChatActionButton: React.FC<Props> = ({ action }) => {
  const { getChatActionButtonProps, handleAction } = useChatActions();
  const [isLoading, setIsLoading] = useState(false);
  const handleActionButtonClick = useCallback(
    async (action: AIChat.Action) => {
      try {
        setIsLoading(true);
        await handleAction(action);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [handleAction]
  );
  return (
    <RQButton
      loading={isLoading}
      onClick={() => handleActionButtonClick(action)}
      {...getChatActionButtonProps(action)}
    />
  );
};
