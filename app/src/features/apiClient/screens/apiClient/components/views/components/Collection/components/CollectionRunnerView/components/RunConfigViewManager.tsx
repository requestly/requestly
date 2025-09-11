import React, { useEffect, useState } from "react";
import { RQAPI } from "features/apiClient/types";
import { useCommand } from "features/apiClient/commands";
import { RunConfigStoreContextProvider } from "features/apiClient/store/collectionRunConfig/RunConfigStoreContextProvider";
import { toast } from "utils/Toast";
import { RunnerViewLoader } from "./RunnerViewLoader/RunnerViewLoader";
import { FetchedRunConfig } from "features/apiClient/commands/collectionRunner/getDefaultRunConfig.command";
import * as Sentry from "@sentry/react";

interface Props {
  collectionId: RQAPI.CollectionRecord["id"];
}

export const RunConfigViewManager: React.FC<Props> = ({ collectionId }) => {
  const {
    runner: { getDefaultRunConfig },
  } = useCommand();

  const [config, setConfig] = useState<FetchedRunConfig | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setConfig(null);
        const config = await getDefaultRunConfig({ collectionId });
        setConfig(config);
      } catch (error) {
        toast.error("Something went wrong!");
        Sentry.captureException(error, { extra: { collectionId } });
      }
    })();
  }, [collectionId, getDefaultRunConfig]);

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
