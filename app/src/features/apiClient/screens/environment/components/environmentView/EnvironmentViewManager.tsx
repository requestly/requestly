import type React from "react";
import { EnvironmentView } from "./EnvironmentView";
import { useBufferedEntity } from "features/apiClient/slices/entities/hooks";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import { GLOBAL_ENVIRONMENT_ID } from "features/apiClient/slices/common/constants";

type EnvironmentViewManagerProps =
  | {
      envId: string;
      isGlobal: false;
    }
  | {
      isGlobal: true;
    };

export const EnvironmentViewManager: React.FC<EnvironmentViewManagerProps> = (props) => {
  const environmentId = props.isGlobal ? GLOBAL_ENVIRONMENT_ID : props.envId;
  const entityType = props.isGlobal ? ApiClientEntityType.GLOBAL_ENVIRONMENT : ApiClientEntityType.ENVIRONMENT;
  const entity = useBufferedEntity({ id: environmentId, type: entityType });
  return <EnvironmentView entity={entity} environmentId={environmentId} isGlobal={props.isGlobal} />;
};
