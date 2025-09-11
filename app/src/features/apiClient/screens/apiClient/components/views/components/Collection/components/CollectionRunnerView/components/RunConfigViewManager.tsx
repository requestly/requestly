import React, { useEffect, useState } from "react";
import { RQAPI } from "features/apiClient/types";
import { useCommand } from "features/apiClient/commands";
import { RunConfigStoreContextProvider } from "features/apiClient/store/collectionRunConfig/RunConfigStoreContextProvider";
import { toast } from "utils/Toast";
import { RunnerViewLoader } from "./RunnerViewLoader/RunnerViewLoader";
import * as Sentry from "@sentry/react";
import { FetchedRunConfig } from "features/apiClient/commands/collectionRunner/fetchOrCreateDefaultRunConfig.command";

interface Props {
  collectionId: RQAPI.CollectionRecord["id"];
}

export const RunConfigViewManager: React.FC<Props> = ({ collectionId }) => {
  const {
    runner: { fetchOrCreateDefaultRunConfig },
  } = useCommand();

  const [config, setConfig] = useState<FetchedRunConfig | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setConfig(null);
        const config = await fetchOrCreateDefaultRunConfig({ collectionId });
        setConfig(config);
      } catch (error) {
        toast.error("Something went wrong!");
        Sentry.captureException(error, { extra: { collectionId } });
      }
    })();
  }, [collectionId, fetchOrCreateDefaultRunConfig]);

  if (!config) {
    return <RunnerViewLoader />;
  }

  return (
    <RunConfigStoreContextProvider key={collectionId} runConfig={config}>
      {/* <RunConfigView id={props.id} /> */}
      <></>
    </RunConfigStoreContextProvider>
  );
};
