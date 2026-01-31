import type React from "react";
import { EnvironmentView } from "./EnvironmentView";
import { useBufferedEntity } from "features/apiClient/slices/entities/hooks";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";

type EnvironmentViewManagerProps = {
  envId: string;
  isGlobal: boolean;
};

export const EnvironmentViewManager: React.FC<EnvironmentViewManagerProps> = (props) => {
  // In local-file mode, global env id is path-like (`.../environments/global.json`), not the constant "global".
  // Use the tab's source id as the buffer reference id.
  const environmentId = props.envId;
  const entityType = props.isGlobal ? ApiClientEntityType.GLOBAL_ENVIRONMENT : ApiClientEntityType.ENVIRONMENT;
  const entity = useBufferedEntity({ id: environmentId, type: entityType });
  return <EnvironmentView entity={entity} environmentId={environmentId} isGlobal={props.isGlobal} />;
};
