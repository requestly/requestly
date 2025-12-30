import FEATURES from "config/constants/sub/features";
import { useEffect, useMemo, useRef } from "react";
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
import { useWorkspaceViewSelector, useWorkspaceViewStore, WorkspaceProvider } from "../common/WorkspaceProvider";
import { getAllSelectedWorkspaces, workspaceViewActions } from "../slices/workspaceView/slice";
import { selectAllEnvironments, selectAllRecords, useGlobalEnvironmentEntity } from "../slices";
import { useEntity, useEntitySelector } from "../slices/entities/hooks";
import { ApiClientEntityType } from "../slices/entities/types";
import { EnvironmentVariableType } from "backend/environment/types";
import { useTabsByEntityTypes, useTabs, tabsActions } from "componentsV2/Tabs/slice";
import { useTabById } from "componentsV2/Tabs/slice/hooks";
import { TabItem } from "componentsV2/Tabs/components/TabItem";
import { closeTab } from "componentsV2/Tabs/slice/thunks";
import { DraftRequestContainerTabSource } from "../screens/apiClient/components/views/components/DraftRequestContainer/draftRequestContainerTabSource";
import { useHostContext } from "hooks/useHostContext";
import { useApiClientSelector } from "../slices/hooks/base.hooks";
import {
  getScopedVariables,
  ScopedVariable,
  ScopedVariables,
  useScopedVariables,
  VariableHolder,
} from "../helpers/variableResolver/variable-resolver";
import { createSelector } from "@reduxjs/toolkit";
import { Select } from "antd";

function TabContent({ tabId }: { tabId: string }) {
  const { registerWorkflow, close, getSourceId, getIsActive } = useHostContext();
  const tab = useTabById(tabId);

  const handleTestWorkflow = () => {
    const abortController = new AbortController();
    const promise = fetch("https://jsonplaceholder.typicode.com/posts/1", {
      signal: abortController.signal,
    })
      .then((res) => res.json())
      .then(
        (v) =>
          new Promise((res) => {
            setTimeout(() => res(v), 1000 * 3);
          })
      );

    registerWorkflow({
      cancelWarning: "Request is still in progress. Close tab?",
      workflow: {
        abort: () => {
          abortController.abort();
        },
        then: (callback: () => void) => {
          promise.then(() => callback());
        },
        catch: (callback: () => void) => {
          promise.catch(() => callback());
        },
      },
    });
  };

  return (
    <div style={{ margin: "4px 0" }}>
      <span>{tab?.source.getSourceName()}</span>
      <span style={{ marginLeft: "8px", fontSize: "12px" }}>(Workflows: {tab?.activeWorkflows.size || 0})</span>
      <span style={{ marginLeft: "8px", fontSize: "10px" }}>
        (SourceId: {getSourceId()}, IsActive: {getIsActive() ? "Yes" : "No"})
      </span>
      <button onClick={handleTestWorkflow} style={{ marginLeft: "8px" }}>
        Register Workflow
      </button>
      <button onClick={close} style={{ marginLeft: "8px" }}>
        Close
      </button>
    </div>
  );
}

function TabTester() {
  const dispatch = useDispatch();
  // const tabs = useTabs();
  const tabs = useTabsByEntityTypes(["request", "collection"]);
  const workspace = useSelector((s: any) => getAllSelectedWorkspaces(s.workspaceView)[0]);

  const handleOpenTab = () => {
    dispatch(
      tabsActions.openTab({
        source: new DraftRequestContainerTabSource({
          context: { id: workspace.id },
        }),
        modeConfig: {
          entityId: `test-${Date.now()}`,
          entityType: "collection",
          mode: "buffer",
        },
      })
    );
  };

  return (
    <div>
      <button onClick={handleOpenTab}>Open Tab</button>

      <div>
        <strong>Tabs Count:</strong> {tabs.length}
      </div>
      {tabs.map((tab) => (
        <TabItem key={tab.id} tabId={tab.id}>
          <TabContent tabId={tab.id} />
        </TabItem>
      ))}
    </div>
  );
}

// Function to test variables
// To test, remove the early return and use a correct collection id
function Updater() {
  // const id = useRef<string>(null);
  // return;
  const entity = useGlobalEnvironmentEntity();
  // const variables = useEntitySelector({
  //   id: entity.id,
  //   type: entity.type,

  // }, (e, s) => {
  //   return e.variables.getAll(s);
  // });

  // const selector = useMemo(() => createSelector(
  //   getScopedVariables.bind(null,'9130594d-2515-47d6-9371-18febb62a8a2'),
  //   (v) => v
  // ), []);
  //

  // const vh = useMemo(() => new VariableHolder(), []);

  const last = useRef<ScopedVariables>(null);

  // const s = makeScopeChain('9130594d-2515-47d6-9371-18febb62a8a2', vh);
  const store = useWorkspaceViewStore();
  const scopedVariables = useScopedVariables("9130594d-2515-47d6-9371-18febb62a8a2");

  useEffect(() => {
    if (!last.current && scopedVariables) {
      last.current = scopedVariables;
    }
    // const areSame = s(store.getState()) === s(store.getState());
    debugger;
    // const as = s(store.getState()) === scopedVariables;
    debugger;
    const bs = last.current === scopedVariables;
    debugger;
  }, [store, scopedVariables]);

  debugger;
  return (
    <div>
      <br />
      <br />
      {JSON.stringify(scopedVariables, null, 2)}
      <button onClick={() => entity.variables.clearAll()}>clear variables</button>
      <button
        onClick={() => {
          const id1 = entity.variables.add({
            key: "ass",
            type: EnvironmentVariableType.String,
            localValue: "df",
            isPersisted: true,
          });
        }}
      >
        add variable
      </button>
      <button
        onClick={() =>
          entity.variables.set({
            id: 0,
            localValue: "dfaaa",
          })
        }
      >
        set variable
      </button>
    </div>
  );
}

function RecordView() {
  const entity = useEntity({
    id: "9130594d-2515-47d6-9371-18febb62a8a2",
    type: ApiClientEntityType.COLLECTION_RECORD,
  });

  const records = useApiClientSelector((s) => s.records.records.entities);

  return (
    <div>
      <br />
      <br />
      {JSON.stringify(records, null, 2)}
      <button onClick={() => entity.setName("tada")}>set variable</button>
    </div>
  );
}

const Inner = () => {
  // const records = useWorkspaceViewSelector(selectAllEnvironments);
  // <code>{JSON.stringify(records, null, 2)}</code><br />

  return (
    <div>
      <Updater />
      <br />
      <br />
      <RecordView />
    </div>
  );
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
          <ApiClientFeatureContainer />
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
