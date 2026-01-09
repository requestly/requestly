import { createAsyncThunk } from "@reduxjs/toolkit";
import { RQAPI } from "features/apiClient/types";
import { selectAllDescendantIds } from "../apiRecords/selectors";
import { RunResult } from "features/apiClient/store/collectionRunResult/runResult.store";
import { SavedRunConfig } from "features/apiClient/commands/collectionRunner/types";
import { API_CLIENT_RUNNER_CONFIG_SLICE_NAME } from "../common/constants";
import { Workspace } from "features/workspaces/types";
import { runCollection } from "features/apiClient/slices/runConfig/helpers/runCollection";
import { BatchRequestExecutor } from "features/apiClient/helpers/batchRequestExecutor";
import { ApiClientFeatureContext, getApiClientFeatureContext } from "../workspaceView/helpers/ApiClientContextRegistry";
import { BufferedRunConfigEntity } from "../entities/buffered/runConfig";
import { LiveRunResultEntity } from "../entities/liveRunResult";
import { DEFAULT_RUN_CONFIG_ID } from "./constants";

function getDefaultRunOrderByCollectionId(
  ctx: ApiClientFeatureContext,
  id: RQAPI.ApiClientRecord["collectionId"]
): RQAPI.RunOrder {
  if (!id) {
    return [];
  }

  const state = ctx.store.getState();
  const descendantIds = selectAllDescendantIds(state, id);
  const runOrder = descendantIds.map((id) => ({ id: id, isSelected: true }));
  return runOrder;
}

function getConfigFromSavedData(config: SavedRunConfig): SavedRunConfig {
  return {
    ...config,
  };
}

export const getDefaultRunConfig = createAsyncThunk<
  SavedRunConfig,
  {
    workspaceId: Workspace["id"];
    collectionId: RQAPI.ApiClientRecord["collectionId"];
  },
  { rejectValue: string }
>(
  `${API_CLIENT_RUNNER_CONFIG_SLICE_NAME}/getDefaultRunConfig`,
  async ({ workspaceId, collectionId }, { rejectWithValue }) => {
    try {
      const ctx = getApiClientFeatureContext(workspaceId);

      const result = await ctx.repositories.apiClientRecordsRepository.getRunConfig(
        collectionId,
        DEFAULT_RUN_CONFIG_ID
      );

      if (result.success) {
        return getConfigFromSavedData(result.data);
      }

      if (result.success === false && result.error.type === "INTERNAL_SERVER_ERROR") {
        return rejectWithValue("Something went wrong while fetching run config!");
      }

      const defaultConfig: SavedRunConfig = {
        id: DEFAULT_RUN_CONFIG_ID,
        runOrder: getDefaultRunOrderByCollectionId(ctx, collectionId),
        delay: 0,
        iterations: 1,
        dataFile: null,
      };

      return defaultConfig;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to get default run config");
    }
  }
);

export const saveRunConfig = createAsyncThunk<
  void,
  {
    workspaceId: Workspace["id"];
    collectionId: RQAPI.ApiClientRecord["collectionId"];
    configToSave: SavedRunConfig;
  },
  { rejectValue: string }
>(
  `${API_CLIENT_RUNNER_CONFIG_SLICE_NAME}/saveRunConfig`,
  async ({ workspaceId, collectionId, configToSave }, { rejectWithValue }) => {
    try {
      const ctx = getApiClientFeatureContext(workspaceId);
      const result = await ctx.repositories.apiClientRecordsRepository.upsertRunConfig(collectionId, configToSave);

      if (result.success === false && result.error.type === "INTERNAL_SERVER_ERROR") {
        return rejectWithValue("Something went wrong while saving run config!");
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to save run config");
    }
  }
);

export const getRunResults = createAsyncThunk<
  RunResult[],
  {
    workspaceId: Workspace["id"];
    collectionId: RQAPI.ApiClientRecord["collectionId"];
  },
  { rejectValue: string }
>(
  `${API_CLIENT_RUNNER_CONFIG_SLICE_NAME}/getRunResults`,
  async ({ workspaceId, collectionId }, { rejectWithValue }) => {
    try {
      const ctx = getApiClientFeatureContext(workspaceId);
      const result = await ctx.repositories.apiClientRecordsRepository.getRunResults(collectionId);

      if (result.success) {
        return result.data;
      }

      if (result.success === false && result.error.type === "INTERNAL_SERVER_ERROR") {
        return rejectWithValue("Something went wrong while fetching run results!");
      }

      return [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to get run results");
    }
  }
);

export const saveRunResult = createAsyncThunk<
  void,
  {
    workspaceId: Workspace["id"];
    collectionId: RQAPI.ApiClientRecord["collectionId"];
    runResult: RunResult;
  },
  { rejectValue: string }
>(
  `${API_CLIENT_RUNNER_CONFIG_SLICE_NAME}/saveRunResult`,
  async ({ workspaceId, collectionId, runResult }, { rejectWithValue }) => {
    try {
      const ctx = getApiClientFeatureContext(workspaceId);
      const result = await ctx.repositories.apiClientRecordsRepository.addRunResult(collectionId, runResult);

      if (result.success === false && result.error.type === "INTERNAL_SERVER_ERROR") {
        return rejectWithValue("Something went wrong while saving run result!");
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to save run result");
    }
  }
);

export interface RunContext {
  runConfigEntity: BufferedRunConfigEntity;
  liveRunResultEntity: LiveRunResultEntity;
}

export const runCollectionThunk = createAsyncThunk<
  void,
  {
    workspaceId: Workspace["id"];
    executor: BatchRequestExecutor;
    runContext: RunContext;
  },
  { rejectValue: string }
>(
  `${API_CLIENT_RUNNER_CONFIG_SLICE_NAME}/runCollection`,
  async ({ workspaceId, executor, runContext }, { rejectWithValue }) => {
    try {
      await runCollection({
        executor,
        runContext,
        ctx: getApiClientFeatureContext(workspaceId),
      });
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to run collection");
    }
  }
);

export const cancelRunThunk = createAsyncThunk<
  void,
  {
    runContext: RunContext;
  },
  { rejectValue: string }
>(`${API_CLIENT_RUNNER_CONFIG_SLICE_NAME}/cancelRun`, async ({ runContext }, { rejectWithValue }) => {
  try {
    runContext.liveRunResultEntity.cancelRun();
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to cancel run");
  }
});
