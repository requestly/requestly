import { RQAPI } from "../../types";
import { APIClientWorkloadManager } from "../modules/scriptsV2/workloadManager/APIClientWorkloadManager";
import {
  PostResponseScriptWorkload,
  PreRequestScriptWorkload,
} from "../modules/scriptsV2/workloadManager/workLoadTypes";
import { ScriptExecutionContext } from "./scriptExecutionContext";

export class HttpRequestScriptExecutionService {
  constructor(
    private readonly executionContext: ScriptExecutionContext,
    private readonly workloadManager: APIClientWorkloadManager
  ) {}

  async executePreRequestScript(entry: RQAPI.HttpApiEntry, abortController: AbortController) {
    return this.workloadManager.execute(
      new PreRequestScriptWorkload(
        entry.scripts?.preRequest,
        this.executionContext.getContext(),
        (snapshot: ScriptExecutionContext["context"]) => {
          this.executionContext.updateContext(snapshot);
        }
      ),
      abortController.signal
    );
  }

  async executePostResponseScript(entry: RQAPI.HttpApiEntry, abortController: AbortController) {
    return this.workloadManager.execute(
      new PostResponseScriptWorkload(
        entry.scripts?.postResponse,
        this.executionContext.getContext(),
        (snapshot: ScriptExecutionContext["context"]) => {
          this.executionContext.updateContext(snapshot);
        }
      ),
      abortController.signal
    );
  }
}
