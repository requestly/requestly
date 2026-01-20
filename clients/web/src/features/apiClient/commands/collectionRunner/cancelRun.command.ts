import { RunContext } from "features/apiClient/screens/apiClient/components/views/components/Collection/components/CollectionRunnerView/run.context";
import { ApiClientFeatureContext } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";

export async function cancelRun(
  ctx: ApiClientFeatureContext,
  params: {
    runContext: RunContext;
  }
) {
  const { runContext } = params;
  runContext.runResultStore.getState().abortController.abort();
}
