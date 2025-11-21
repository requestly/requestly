import React, { useState, useCallback } from "react";
import { Typography } from "antd";
import { captureException } from "@sentry/react";
import NoEnvironmentIllustration from "features/apiClient/screens/environment/assets/noEnvironment.svg?react";
import { RQButton } from "lib/design-system-v2/components";
import { toast } from "utils/Toast";
import { trackNewEnvironmentClicked } from "modules/analytics/events/features/apiClient";
import { createEnvironment } from "features/apiClient/commands/environments";
import { getApiClientFeatureContext } from "features/apiClient/commands/store.utils";
import { useContextId } from "features/apiClient/contexts/contextId.context";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { EnvironmentViewTabSource } from "features/apiClient/screens/environment/components/environmentView/EnvironmentViewTabSource";
import "./createEnvironmentPopup.scss";

/**
 * CreateEnvironmentPopup
 * A lightweight panel shown when the user has no environments yet.
 * (Opening / closing logic lives in the parent – this component just renders content.)
 */
export const CreateEnvironmentPopup: React.FC = () => {
  const contextId = useContextId();
  const [openTab] = useTabServiceWithSelector((state) => [state.openTab]);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = useCallback(
    async (e: React.MouseEvent) => {
      if (isCreating) return;

      try {
        setIsCreating(true);
        trackNewEnvironmentClicked("environment_dropdown");
        const context = getApiClientFeatureContext(contextId || undefined);
        if (!context) {
          const errorMessage = "Failed to create new environment";
          toast.error(errorMessage);
          captureException(new Error(errorMessage));
          return;
        }
        const { id, name } = await createEnvironment(context, { newEnvironmentName: "New Environment" });
        openTab(
          new EnvironmentViewTabSource({
            id,
            title: name,
            isNewTab: true,
            context: { id: context.id },
          })
        );
        toast.success(`Environment created`);
      } catch (error: any) {
        toast.error(error?.message || "Failed to create environment");
      } finally {
        setIsCreating(false);
      }
    },
    [contextId, isCreating, openTab]
  );

  return (
    <div
      className="create-environment-popup"
      role="dialog"
      aria-labelledby="create-env-title"
      aria-describedby="create-env-description"
    >
      <div className="create-environment-popup__inner">
        <div className="create-environment-popup__icon" aria-hidden>
          <NoEnvironmentIllustration />
        </div>
        <Typography.Title id="create-env-title" level={5} className="create-environment-popup__title">
          No environment created yet
        </Typography.Title>
        <Typography.Paragraph id="create-env-description" className="create-environment-popup__description">
          Create environments to switch variable values and test your API in different setups.
        </Typography.Paragraph>
        <RQButton
          type="primary"
          size="small"
          disabled={isCreating}
          loading={isCreating}
          className="create-environment-popup__cta"
          onClick={handleCreate}
        >
          {isCreating ? "Creating..." : "Create environment"}
        </RQButton>
      </div>
    </div>
  );
};

export default CreateEnvironmentPopup;
