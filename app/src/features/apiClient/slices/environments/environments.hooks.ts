import { useMemo } from "react";
import { EntityId } from "../types";
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
import { EnvironmentEntity } from "./types";
import { EnvironmentVariables } from "backend/environment/types";
import { useEntitySelector } from "../entities";
import { useEntity } from "../entities/hooks";
import { ApiClientEntityType } from "../entities/types";

export function useAllEnvironments(): EnvironmentEntity[] {
  return useApiClientSelector(selectAllEnvironments);
}

export function useEnvironmentById(id: EntityId): EnvironmentEntity | undefined {
  return useApiClientSelector((state) => selectEnvironmentById(state, id));
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
    id: "global_environment",
    type: ApiClientEntityType.GLOBAL_ENVIRONMENT,
  })
}
