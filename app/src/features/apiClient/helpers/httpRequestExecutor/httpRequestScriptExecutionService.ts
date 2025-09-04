import { NativeError } from "errors/NativeError";
import { parseEnvironmentState } from "../../commands/environments/utils";
import {
  getApiClientEnvironmentsStore,
  getApiClientRecordsStore,
  getApiClientRecordStore,
} from "../../commands/store.utils";
import { ApiClientFeatureContext } from "../../store/apiClientFeatureContext/apiClientFeatureContext.store";
import { getParsedRuntimeVariables } from "../../store/runtimeVariables/utils";
import { RQAPI } from "../../types";
import { BaseSnapshot, SnapshotForPostResponse, SnapshotForPreRequest } from "./snapshotTypes";
import { APIClientWorkloadManager } from "../modules/scriptsV2/workloadManager/APIClientWorkloadManager";
import {
  PostResponseScriptWorkload,
  PreRequestScriptWorkload,
} from "../modules/scriptsV2/workload-manager/workLoadTypes";

export class HttpRequestScriptExecutionService {
  constructor(
    private ctx: ApiClientFeatureContext,
    private workloadManager: APIClientWorkloadManager,
    private abortController: AbortController
  ) {}

  private buildBaseSnapshot(recordId: string): BaseSnapshot {
    const { activeEnvironment, globalEnvironment } = getApiClientEnvironmentsStore(this.ctx).getState();
    const globalEnvironmentState = globalEnvironment.getState();
    const globalVariables = parseEnvironmentState(globalEnvironmentState).variables;
    const environmentVariables = activeEnvironment ? parseEnvironmentState(activeEnvironment.getState()).variables : {};
    const variables = getParsedRuntimeVariables();
    const collectionVariables = (() => {
      const parent = getApiClientRecordsStore(this.ctx).getState().getParent(recordId);
      if (!parent) {
        return {};
      }
      const recordState = getApiClientRecordStore(this.ctx, parent)?.getState();
      if (!recordState || recordState.type !== RQAPI.RecordType.COLLECTION) {
        throw new NativeError("Expected value to be present and be a collection!").addContext({
          recordId: parent,
        });
      }

      return Object.fromEntries(recordState.collectionVariables.getState().getAll());
    })();
    return {
      global: globalVariables,
      collectionVariables,
      environment: environmentVariables,
      variables,
    };
  }

  private buildPreRequestSnapshot(recordId: string, entry: RQAPI.HttpApiEntry): SnapshotForPreRequest {
    return {
      ...this.buildBaseSnapshot(recordId),
      request: entry.request,
    };
  }

  private buildPostResponseSnapshot(recordId: string, entry: RQAPI.HttpApiEntry): SnapshotForPostResponse {
    const response = entry.response;
    if (!response) {
      throw new Error("Can not build post response snapshot without response!");
    }
    return {
      ...this.buildBaseSnapshot(recordId),
      request: entry.request,
      response,
    };
  }

  async executePreRequestScript(recordId: string, entry: RQAPI.HttpApiEntry, callback: (state: any) => Promise<void>) {
    return this.workloadManager.execute(
      new PreRequestScriptWorkload(entry.scripts.preRequest, this.buildPreRequestSnapshot(recordId, entry), callback),
      this.abortController.signal
    );
  }

  async executePostResponseScript(
    recordId: string,
    entry: RQAPI.HttpApiEntry,
    callback: (state: any) => Promise<void>
  ) {
    return this.workloadManager.execute(
      new PostResponseScriptWorkload(
        entry.scripts.postResponse,
        this.buildPostResponseSnapshot(recordId, entry),
        callback
      ),
      this.abortController.signal
    );
  }
}
