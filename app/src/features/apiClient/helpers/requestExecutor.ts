import { makeRequest } from "../screens/apiClient/utils";
import { RQAPI } from "../types";
import { APIClientWorkloadManager } from "./modules/scripts/APIClientWorkloadManager";
import { getPostResponseScriptWorkload, getPreRequestScriptWorkload } from "./modules/scripts/utils";

export class RequestExecutor {
  constructor(private appMode: string) {}

  private prepareRequest() {}

  async execute(entry: RQAPI.Entry) {
    this.prepareRequest();

    const workloadManager = new APIClientWorkloadManager();

    try {
      workloadManager.execute(getPreRequestScriptWorkload(entry));

      const response = await makeRequest(this.appMode, entry.request);

      // console.log("!!!debug", "make response", response);

      workloadManager.execute(
        getPostResponseScriptWorkload({
          ...entry,
          response: response,
        })
      );
    } catch (e) {
      console.log("!!!debug", "err", e);
    }
  }
}
