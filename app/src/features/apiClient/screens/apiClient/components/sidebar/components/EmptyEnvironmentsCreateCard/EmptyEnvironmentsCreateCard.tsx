import React, { useCallback, useState } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { trackNewEnvironmentClicked } from "modules/analytics/events/features/apiClient";
import { toast } from "utils/Toast";
import { EnvironmentViewTabSource } from "features/apiClient/screens/environment/components/environmentView/EnvironmentViewTabSource";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { useCommand } from "features/apiClient/commands";
import "./emptyEnvironmentsCreateCard.scss";

interface EmptyEnvironmentsCreateCardProps {
  contextId: string | null;
  isValidPermission: boolean;
}

export const EmptyEnvironmentsCreateCard: React.FC<EmptyEnvironmentsCreateCardProps> = ({
  contextId,
  isValidPermission,
}) => {
  const {
    env: { createEnvironment },
  } = useCommand();
  const [openTab] = useTabServiceWithSelector((state) => [state.openTab]);
  const [isCreatingEnvironment, setIsCreatingEnvironment] = useState(false);

  const handleCreateEnvironment = useCallback(async () => {
    if (isCreatingEnvironment || !isValidPermission) return;

    try {
      setIsCreatingEnvironment(true);
      trackNewEnvironmentClicked("environment_list_empty_state");
      const { id, name } = await createEnvironment({ newEnvironmentName: "New Environment" });
      openTab(
        new EnvironmentViewTabSource({
          id,
          title: name,
          isNewTab: true,
          context: contextId ? { id: contextId } : {},
        })
      );
      toast.success("Environment created");
    } catch (error: any) {
      toast.error(error?.message || "Failed to create environment");
    } finally {
      setIsCreatingEnvironment(false);
    }
  }, [createEnvironment, openTab, contextId, isCreatingEnvironment, isValidPermission]);

  return (
    <div className="environments-empty-create-card">
      <div className="environments-empty-create-card__text">No environment created yet</div>
      <RQButton
        size="small"
        type="secondary"
        onClick={handleCreateEnvironment}
        loading={isCreatingEnvironment}
        disabled={isCreatingEnvironment}
      >
        {isCreatingEnvironment ? "Creating..." : "Create environment"}
      </RQButton>
    </div>
  );
};
