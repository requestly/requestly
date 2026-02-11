import React, { createContext, useContext, useMemo } from "react";
import { RQAPI } from "features/apiClient/types";
import { NativeError } from "errors/NativeError";
import { OriginExists } from "features/apiClient/slices/entities/buffered/factory";
import { BufferedRunConfigEntity } from "features/apiClient/slices/entities/buffered/runConfig";
import { useBufferedEntity, useEntity } from "features/apiClient/slices/entities/hooks";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import { getRunnerConfigId } from "features/apiClient/slices/runConfig/utils";
import { LiveRunResultEntity } from "features/apiClient/slices/entities";

const CollectionViewContext = createContext<{
  collectionId: RQAPI.CollectionRecord["id"];
  bufferedEntity: OriginExists<BufferedRunConfigEntity>;
  liveRunResultEntity: LiveRunResultEntity;
} | null>(null);

export function useCollectionView() {
  const ctx = useContext(CollectionViewContext);

  if (!ctx) {
    throw new NativeError("useCollectionView must be used within CollectionViewContext");
  }

  return ctx;
}

export const CollectionViewContextProvider: React.FC<{
  children: React.ReactNode;
  collectionId: RQAPI.CollectionRecord["id"];
  configId: RQAPI.RunConfig["id"];
}> = ({ collectionId, children, configId }) => {
  const bufferedEntity = useBufferedEntity({
    id: getRunnerConfigId(collectionId, configId),
    type: ApiClientEntityType.RUN_CONFIG,
  });

  const liveRunResultEntity = useEntity({
    id: collectionId,
    type: ApiClientEntityType.LIVE_RUN_RESULT,
  });

  const value = useMemo(
    () => ({ collectionId, bufferedEntity, liveRunResultEntity }),
    [collectionId, liveRunResultEntity, bufferedEntity]
  );

  return <CollectionViewContext.Provider value={value}>{children}</CollectionViewContext.Provider>;
};
