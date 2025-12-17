import React, { useEffect } from "react";
import { RQButton } from "lib/design-system-v2/components";
import { ExampleCollectionsImportStatus, useExampleCollections } from "features/apiClient/exampleCollections/store";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useApiClientRepository } from "features/apiClient/contexts/meta";
import { useAPIRecordsStore } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import { toast } from "utils/Toast";
import "./exampleCollectionsNudge.scss";
import {
  trackExampleCollectionsNudgeCloseClicked,
  trackExampleCollectionsNudgeImportClicked,
  trackExampleCollectionsNudgeShown,
} from "modules/analytics/events/features/apiClient";
import { useCommand } from "features/apiClient/commands";

interface ExampleCollectionsNudgeProps {
  fallback?: React.ReactNode;
}

export const ExampleCollectionsNudge: React.FC<ExampleCollectionsNudgeProps> = ({ fallback = null }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;

  const syncRepository = useApiClientRepository();
  const {
    env: { createEnvironments },
  } = useCommand();

  const recordsStore = useAPIRecordsStore();
  const [
    isNudgePermanentlyClosed,
    importStatus,
    closeNudge,
    importExampleCollections,
  ] = useExampleCollections((state) => [
    state.isNudgePermanentlyClosed,
    state.importStatus,
    state.closeNudge,
    state.importExampleCollections,
  ]);

  const handleNoThanksClick = () => {
    trackExampleCollectionsNudgeCloseClicked();
    closeNudge();
  };

  const handleImportClick = async () => {
    trackExampleCollectionsNudgeImportClicked();
    try {
      const result = await importExampleCollections({
        ownerId: uid ?? null,
        respository: syncRepository,
        recordsStore: recordsStore,
        envsStore: { createEnvironments },
        dispatch,
      });

      if (result.success === false) {
        throw new Error(result.message);
      }

      toast.success("Example collections imported successfully!");
      closeNudge();
    } catch (error) {
      toast.error("Failed to import example collections, please try again.");
    }
  };

  const isImporting = importStatus === ExampleCollectionsImportStatus.IMPORTING;
  const showNudge = uid && !isNudgePermanentlyClosed && importStatus !== ExampleCollectionsImportStatus.IMPORTED;

  useEffect(() => {
    if (showNudge) {
      trackExampleCollectionsNudgeShown();
    }
  }, [showNudge]);

  return showNudge ? (
    <div className="example-collections-nudge-container">
      <div className="content">
        <img width={14} height={14} src={"/assets/media/common/sparkles.svg"} alt="sparkles" />
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
  ) : (
    fallback
  );
};
