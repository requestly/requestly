import React, { useCallback, useState } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { trackNewEnvironmentClicked } from "modules/analytics/events/features/apiClient";
import { toast } from "utils/Toast";
import { EnvironmentViewTabSource } from "features/apiClient/screens/environment/components/environmentView/EnvironmentViewTabSource";
import { useTabActions } from "componentsV2/Tabs/slice";
import { createEnvironment, useApiClientRepository } from "features/apiClient/slices";
import { useApiClientDispatch } from "features/apiClient/slices/hooks/base.hooks";
import "./emptyEnvironmentsCreateCard.scss";

interface EmptyEnvironmentsCreateCardProps {
  workspaceId: string | null;
  isValidPermission: boolean;
}

export const EmptyEnvironmentsCreateCard: React.FC<EmptyEnvironmentsCreateCardProps> = ({
  workspaceId,
  isValidPermission,
}) => {
  const dispatch = useApiClientDispatch();
  const { openBufferedTab } = useTabActions();
  const { environmentVariablesRepository } = useApiClientRepository();
  const [isCreatingEnvironment, setIsCreatingEnvironment] = useState(false);

  const handleCreateEnvironment = useCallback(async () => {
    if (isCreatingEnvironment || !isValidPermission) return;

    try {
      setIsCreatingEnvironment(true);
      trackNewEnvironmentClicked("environment_list_empty_state");
      const { id, name } = await dispatch(
        createEnvironment({ name: "New Environment", repository: environmentVariablesRepository })
      ).unwrap();

      openBufferedTab({
        source: new EnvironmentViewTabSource({
          id,
          title: name,
          isNewTab: true,
          context: workspaceId ? { id: workspaceId } : {},
        }),
      });
      toast.success("Environment created");
    } catch (error: any) {
      toast.error(error?.message || "Failed to create environment");
    } finally {
      setIsCreatingEnvironment(false);
    }
  }, [
    isCreatingEnvironment,
    isValidPermission,
    dispatch,
    environmentVariablesRepository,
    openBufferedTab,
    workspaceId,
  ]);

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
