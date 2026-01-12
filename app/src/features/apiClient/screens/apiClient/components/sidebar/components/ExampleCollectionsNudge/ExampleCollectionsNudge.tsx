// app/src/features/apiClient/screens/apiClient/components/sidebar/components/ExampleCollectionsNudge/ExampleCollectionsNudge.tsx

import type { EnvironmentData } from "backend/environment/types";
import exampleEnvironments from "features/apiClient/exampleCollections/examples/environments.json";
import { useApiClientRepository } from "features/apiClient/slices";
import {
  exampleCollectionsActions,
  importExampleCollections,
  selectIsImporting,
  selectShouldShowNudge,
  ImportDependencies,
  ImportResult,
} from "features/apiClient/slices/exampleCollections";
import { useApiClientDispatch } from "features/apiClient/slices/hooks/base.hooks";
import { RQButton } from "lib/design-system-v2/components";
import {
  trackExampleCollectionsNudgeCloseClicked,
  trackExampleCollectionsNudgeImportClicked,
  trackExampleCollectionsNudgeShown,
} from "modules/analytics/events/features/apiClient";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { toast } from "utils/Toast";
import "./exampleCollectionsNudge.scss";
import { AppDispatch } from "store/types";

interface ExampleCollectionsNudgeProps {
  readonly fallback?: React.ReactNode;
}

export const ExampleCollectionsNudge: React.FC<ExampleCollectionsNudgeProps> = ({ fallback = null }) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;

  const syncRepository = useApiClientRepository();
  const apiClientDispatch = useApiClientDispatch();
  const showNudge = useSelector((state: any) => selectShouldShowNudge(state, uid));
  const isImporting = useSelector(selectIsImporting);

  const handleNoThanksClick = () => {
    trackExampleCollectionsNudgeCloseClicked();
    dispatch(exampleCollectionsActions.nudgeClosed());
  };

  const handleImportClick = async () => {
    trackExampleCollectionsNudgeImportClicked();

    // Prepare environments
    const environmentsToCreate: EnvironmentData[] = exampleEnvironments.environments.map((env) => ({
      ...env,
      isExample: true,
    }));

    // Prepare dependencies
    const dependencies: ImportDependencies = {
      repository: syncRepository,
      ownerId: uid ?? null,
      environmentsToCreate,
      apiClientDispatch,
    };

    try {
      const result = await dispatch(importExampleCollections(dependencies)).unwrap();

      toast.success(`Example collections imported successfully! (${result.recordCount} records)`);
      dispatch(exampleCollectionsActions.nudgeClosed());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to import example collections";
      toast.error(message);
    }
  };

  useEffect(() => {
    if (showNudge) {
      trackExampleCollectionsNudgeShown();
    }
  }, [showNudge]);

  if (!showNudge) {
    return <>{fallback}</>;
  }

  return (
    <div className="example-collections-nudge-container">
      <div className="content">
        <img width={14} height={14} src="/assets/media/common/sparkles.svg" alt="sparkles" />
        <div className="description">Explore all API client features in action with example collections.</div>
      </div>
      <div className="actions">
        <RQButton size="small" onClick={handleNoThanksClick} disabled={isImporting}>
          No thanks
        </RQButton>
        <RQButton size="small" type="primary" onClick={handleImportClick} loading={isImporting}>
          Try samples
        </RQButton>
      </div>
    </div>
  );
};
