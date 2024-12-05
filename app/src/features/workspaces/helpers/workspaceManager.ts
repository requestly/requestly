import { Dispatch } from "react";
import { Workspace } from "../types";
import { workspaceActions } from "store/slices/workspaces/slice";
import { RuleStorageModel, syncEngine } from "requestly-sync-engine";
import { LocalStorageService } from "services/localStorageService";
import { hasAccessToWorkspace } from "../utils";
import { clone } from "lodash";

class WorkspaceManager {
  dispatch!: Dispatch<any>;
  workspaceMap!: {
    [id: string]: Workspace;
  };
  userId?: string;
  appMode?: string;

  activeWorkspaceMap: {
    [id: string]: {
      disconnect: () => void;
    };
  } = {};

  init(dispatch: Dispatch<any>, workspaces: Workspace[], userId?: string, appMode?: string) {
    this.dispatch = dispatch;
    this.userId = userId;
    this.appMode = appMode;

    this.workspaceMap = {};
    workspaces.forEach((workspace) => {
      this.workspaceMap[workspace.id] = workspace;
    });
  }

  // Reset
  initActiveWorkspaces(workspaceIds: Workspace["id"][]) {
    this.resetActiveWorkspaces();
    this.connectWorkspaces(workspaceIds);
  }

  // append
  private connectWorkspaces(workspaceIds: Workspace["id"][]) {
    console.log("[WorkspaceManager.connectWorkspaces]", { workspaceIds });
    const connectedWorkspaceIds: string[] = [];
    workspaceIds.forEach((workspaceId) => {
      const connected = this.connectWorkspace(workspaceId);
      if (connected) {
        connectedWorkspaceIds.push(workspaceId);
      }
    });

    window.activeWorkspaceIds = connectedWorkspaceIds;
    this.dispatch(workspaceActions.setActiveWorkspaceIds(connectedWorkspaceIds));
  }

  // append
  private connectWorkspace(workspaceId: Workspace["id"]): boolean {
    const workspace = this.workspaceMap[workspaceId];
    console.log("[WorkspaceManager.connectWorkspace]", { workspaceId, workspace });

    //#region - Access Check
    if (!hasAccessToWorkspace(this.userId, workspace)) {
      console.log("[WorkspaceManager.connectWorkspace] Skipping connect. Unauthorized", { workspaceId });
      return false;
    }
    //#endregion

    //#region - syncing init
    syncEngine.init([workspaceId], this.userId);

    RuleStorageModel.registerOnUpdateHook((models: RuleStorageModel[]) => {
      console.log("onUpdateHook Custom");
      LocalStorageService(this.appMode).saveMultipleRulesOrGroups(models.map((model) => model.data));
    });
    //#endregion

    //#region - Disconnection Steps
    const disconnect = () => {
      console.log(`[WorkspaceManager] workspaceId=${workspaceId} disconnect`);
      delete this.activeWorkspaceMap[workspaceId];
      syncEngine.disconnectWorkspace(workspaceId);
    };
    this.activeWorkspaceMap[workspaceId] = {
      disconnect: disconnect,
    };
    //#endregion

    // For Future. Right now we only support one workspace. Handled in connectWorkspaces
    // this.dispatch(workspaceActions.appendActiveWorkspaceId());
    return true;
  }

  resetActiveWorkspaces() {
    console.log("[WorkspaceManager.resetActiveWorkspaces]", {
      activeWorkspaces: clone(this.activeWorkspaceMap),
    });
    Object.values(this.activeWorkspaceMap).forEach((iter) => {
      iter.disconnect();
    });
  }
}

export const workspaceManager = new WorkspaceManager();
