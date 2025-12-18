import FEATURES from "config/constants/sub/features";
import { useEffect, useMemo } from "react";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import {
  useApiClientMultiWorkspaceView,
  ApiClientViewMode,
} from "../store/multiWorkspaceView/multiWorkspaceView.store";
import { getActiveWorkspace } from "store/slices/workspaces/selectors";
import { useDispatch, useSelector } from "react-redux";
import { WorkspaceType } from "features/workspaces/types";
import { WindowsAndLinuxGatedHoc } from "componentsV2/WindowsAndLinuxGatedHoc";
import MandatoryUpdateScreen from "components/mode-specific/desktop/UpdateDialog/MandatoryUpdateScreen";
import ApiClientFeatureContainer from "../container";
import ApiClientErrorBoundary from "./ErrorBoundary/ErrorBoundary";
import { resetWorkspaceView, setupWorkspaceView } from "../slices/workspaceView/thunks";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useWorkspaceViewSelector, WorkspaceProvider } from "../common/WorkspaceProvider";
import { useEntitySelector } from "../slices/entities";
import { getAllSelectedWorkspaces, workspaceViewActions } from "../slices/workspaceView/slice";
import { selectAllRecords } from "../slices";
import { useEntity } from "../slices/entities/hooks";
import { ApiClientEntityType } from "../slices/entities/types";
import { EnvironmentVariableType } from "backend/environment/types";

// Function to test variables
// To test, remove the early return and use a correct collection id
function Updater() {
  return;
  const entity = useEntity({
    id: "9130594d-2515-47d6-9371-18febb62a8a2a",
    type: ApiClientEntityType.COLLECTION_RECORD,
  });

  return (
    <div>
    <button onClick={() => entity.variables.clearAll()}>clear variables</button>
    <button onClick={() => entity.variables.add({
      key: "ass",
      type: EnvironmentVariableType.String,
      localValue: "df",
      isPersisted: true,
    })}>add variable</button>
        <button onClick={() => entity.variables.set({
      id: 0,
      localValue: "df",
    })}>set variable</button>

    </div>
  );
}


const Inner = () => {
  const records = useWorkspaceViewSelector(selectAllRecords);

  return <div><code>{JSON.stringify(records, null, 2)}</code><br/>
    <Updater/>
    </div>;
};

const Test = () => {
  const isSetupDone = useSelector((s) => s.workspaceView.isSetupDone);
  const workspace = useSelector((s) => getAllSelectedWorkspaces(s.workspaceView)[0]);

  console.log({ workspace });

  return isSetupDone ? (
    <WorkspaceProvider workspaceId={workspace.id}>{<Inner />}</WorkspaceProvider>
  ) : (
    <h1>Loading...</h1>
  );
};

export const ApiClientRouteElement = () => {
  const currentViewMode = useApiClientMultiWorkspaceView((state) => state.viewMode);
  const user = useSelector(getUserAuthDetails);
  const dispatch = useDispatch();
  const activeWorkspace = useSelector(getActiveWorkspace);
  const isApiClientCompatible = useMemo(() => {
    const isOlderDesktopVersion = !isFeatureCompatible(FEATURES.LOCAL_WORKSPACE_COMPATIBILITY);
    const requiresLocalWorkspaceFeature =
      currentViewMode === ApiClientViewMode.MULTI || activeWorkspace?.workspaceType === WorkspaceType.LOCAL;
    const hasIncompatibleConfiguration = isOlderDesktopVersion && requiresLocalWorkspaceFeature;
    return !hasIncompatibleConfiguration;
  }, [currentViewMode, activeWorkspace?.workspaceType]);

  useEffect(() => {
    dispatch(resetWorkspaceView() as any);
    const promise = dispatch(
      setupWorkspaceView({
        userId: user.details?.profile?.uid,
      }) as any
    );

    return () => {
      promise.abort();
      dispatch(resetWorkspaceView as any);
    };
  }, [dispatch, user.details?.profile?.uid]);

  return (
    <WindowsAndLinuxGatedHoc featureName="API client">
      {isApiClientCompatible ? (
        <ApiClientErrorBoundary boundaryId="api-client-error-boundary">
          <Test />
          {/* <ApiClientFeatureContainer /> */}
        </ApiClientErrorBoundary>
      ) : (
        <MandatoryUpdateScreen
          title="Update Required for API Client"
          description="The API Client feature requires a newer version to work with local workspaces. Please update Requestly to access this functionality."
          ctaText="Update Requestly"
          handleCTAClick={() => {
            if (window.RQ?.DESKTOP?.SERVICES?.IPC) {
              window.RQ.DESKTOP.SERVICES.IPC.invokeEventInBG("open-external-link", {
                link: "https://requestly.com/desktop",
              });
            } else {
              console.error("This screen should not be accessed without the desktop environment");
            }
          }}
          independentComponent={true}
        />
      )}
    </WindowsAndLinuxGatedHoc>
  );
};
