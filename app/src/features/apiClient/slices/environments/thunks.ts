import { createAsyncThunk } from "@reduxjs/toolkit";
import type { EnvironmentMap, EnvironmentVariables } from "backend/environment/types";
import type { EnvironmentInterface } from "../../helpers/modules/sync/interfaces";
import { entitySynced } from "../common/actions";
import { ApiClientEntityType } from "../entities/types";
import { GLOBAL_ENVIRONMENT_ID } from "../common/constants";
import { environmentsActions } from "./slice";

type Repository = EnvironmentInterface<Record<string, unknown>>;

export const updateEnvironmentVariables = createAsyncThunk<
  void,
  {
    environmentId: string;
    variables: EnvironmentVariables;
    repository: Repository;
  },
  { rejectValue: string }
>("environments/updateVariables", async ({ environmentId, variables, repository }, { dispatch, rejectWithValue }) => {
  try {
    // Persist to repository first
    await repository.updateEnvironment(environmentId, { variables });

    // Notify that environment was synced (slice will update via extraReducers)
    const isGlobal = environmentId === GLOBAL_ENVIRONMENT_ID;
    dispatch(
      entitySynced({
        entityType: isGlobal ? ApiClientEntityType.GLOBAL_ENVIRONMENT : ApiClientEntityType.ENVIRONMENT,
        entityId: environmentId,
        data: { variables },
      })
    );
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to update variables");
  }
});

export const updateEnvironmentName = createAsyncThunk<
  void,
  {
    environmentId: string;
    name: string;
    repository: Repository;
  },
  { rejectValue: string }
>("environments/updateName", async ({ environmentId, name, repository }, { dispatch, rejectWithValue }) => {
  try {
    await repository.updateEnvironment(environmentId, { name });

    const isGlobal = environmentId === GLOBAL_ENVIRONMENT_ID;
    dispatch(
      entitySynced({
        entityType: isGlobal ? ApiClientEntityType.GLOBAL_ENVIRONMENT : ApiClientEntityType.ENVIRONMENT,
        entityId: environmentId,
        data: { name },
      })
    );
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to update environment name");
  }
});

export const deleteEnvironment = createAsyncThunk<
  void,
  {
    environmentId: string;
    repository: Repository;
  },
  { rejectValue: string }
>("environments/delete", async ({ environmentId, repository }, { dispatch, rejectWithValue }) => {
  try {
    await repository.deleteEnvironment(environmentId);
    dispatch(environmentsActions.environmentDeleted(environmentId));
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to delete environment");
  }
});

export const duplicateEnvironment = createAsyncThunk<
  void,
  {
    environmentId: string;
    allEnvironments: EnvironmentMap;
    repository: Repository;
  },
  { rejectValue: string }
>("environments/duplicate", async ({ environmentId, allEnvironments, repository }, { dispatch, rejectWithValue }) => {
  try {
    const newEnvironment = await repository.duplicateEnvironment(environmentId, allEnvironments);
    dispatch(environmentsActions.environmentCreated(newEnvironment));
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to duplicate environment");
  }
});
