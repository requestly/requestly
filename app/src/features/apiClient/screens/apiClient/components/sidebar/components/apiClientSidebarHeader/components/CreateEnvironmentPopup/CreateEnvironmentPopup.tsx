import React, { useState, useCallback } from "react";
import { Typography } from "antd";
import { captureException } from "@sentry/react";
import NoEnvironmentIllustration from "features/apiClient/screens/environment/assets/noEnvironment.svg?react";
import { RQButton } from "lib/design-system-v2/components";
import { toast } from "utils/Toast";
import { trackNewEnvironmentClicked } from "modules/analytics/events/features/apiClient";
import { useTabActions } from "componentsV2/Tabs/slice";
import { EnvironmentViewTabSource } from "features/apiClient/screens/environment/components/environmentView/EnvironmentViewTabSource";
import { useApiClientFeatureContext } from "features/apiClient/slices";
import { createEnvironment } from "features/apiClient/slices/environments/thunks";
import { useApiClientDispatch } from "features/apiClient/slices/hooks/base.hooks";
import "./createEnvironmentPopup.scss";

/**
 * CreateEnvironmentPopup
 * A lightweight panel shown when the user has no environments yet.
 * (Opening / closing logic lives in the parent – this component just renders content.)
 */
export const CreateEnvironmentPopup: React.FC = () => {
  const context = useApiClientFeatureContext();
  const { openBufferedTab } = useTabActions();
  const dispatch = useApiClientDispatch();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = useCallback(
    async (e: React.MouseEvent) => {
      if (isCreating) return;

      try {
        setIsCreating(true);
        trackNewEnvironmentClicked("environment_dropdown");
        if (!context) {
          const errorMessage = "Failed to create new environment";
          toast.error(errorMessage);
          captureException(new Error(errorMessage));
          return;
        }

        const { environmentVariablesRepository } = context.repositories;
        const { id, name } = await dispatch(
          createEnvironment({
            name: "New Environment",
            repository: environmentVariablesRepository,
          })
        ).unwrap();

        openBufferedTab({
          isNew: true,
          source: new EnvironmentViewTabSource({
            id,
            title: name,
            isNewTab: true,
            context: { id: context.workspaceId },
            isGlobal: false,
          }),
        });
        toast.success(`Environment created`);
      } catch (error: any) {
        toast.error(error?.message || "Failed to create environment");
      } finally {
        setIsCreating(false);
      }
    },
    [isCreating, context, dispatch, openBufferedTab]
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
