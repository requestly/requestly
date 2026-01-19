import { useMemo } from "react";
import { EntityNotFound, EntityId } from "../types";
import {
  selectAllEnvironments,
  selectEnvironmentById,
  selectActiveEnvironment,
  selectActiveEnvironmentId,
  selectGlobalEnvironment,
  selectEnvironmentVariables,
  selectActiveEnvironmentVariables,
  selectGlobalEnvironmentVariables,
  selectTotalEnvironments,
  makeSelectEnvironmentById,
  makeSelectEnvironmentVariables,
} from "./selectors";
import { useApiClientSelector } from "../hooks/base.hooks";
import type { EnvironmentEntity } from "./types";
import type { EnvironmentVariables } from "backend/environment/types";
import { useEntity } from "../entities/hooks";
import { ApiClientEntityType } from "../entities/types";
import { GLOBAL_ENVIRONMENT_ID } from "../common/constants";

export function useAllEnvironments(): EnvironmentEntity[] {
  return useApiClientSelector(selectAllEnvironments);
}

export function useEnvironmentById(id: EntityId): EnvironmentEntity {
  const env = useApiClientSelector((state) => selectEnvironmentById(state, id));

  if (!env) {
    throw new EntityNotFound(id, "environment");
  }

  return env;
}

export function useEnvironmentByIdMemoized(id: EntityId): EnvironmentEntity | null {
  const selectEnvironment = useMemo(makeSelectEnvironmentById, []);
  return useApiClientSelector((state) => selectEnvironment(state, id));
}

export function useActiveEnvironmentId(): string | null {
  return useApiClientSelector(selectActiveEnvironmentId);
}

export function useActiveEnvironment(): EnvironmentEntity | null {
  return useApiClientSelector(selectActiveEnvironment);
}

export function useGlobalEnvironment(): EnvironmentEntity {
  return useApiClientSelector(selectGlobalEnvironment);
}

export function useEnvironmentVariables(id: EntityId): EnvironmentVariables {
  return useApiClientSelector((state) => selectEnvironmentVariables(state, id));
}

export function useEnvironmentVariablesMemoized(id: EntityId): EnvironmentVariables {
  const selectVariables = useMemo(makeSelectEnvironmentVariables, []);
  return useApiClientSelector((state) => selectVariables(state, id));
}

export function useActiveEnvironmentVariables(): EnvironmentVariables {
  return useApiClientSelector(selectActiveEnvironmentVariables);
}

export function useGlobalEnvironmentVariables(): EnvironmentVariables {
  return useApiClientSelector(selectGlobalEnvironmentVariables);
}

export function useTotalEnvironments(): number {
  return useApiClientSelector(selectTotalEnvironments);
}

export function useGlobalEnvironmentEntity() {
  return useEntity({
    id: GLOBAL_ENVIRONMENT_ID,
    type: ApiClientEntityType.GLOBAL_ENVIRONMENT,
  });
}
