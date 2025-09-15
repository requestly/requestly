import { Dispatch } from "react";
import { clone } from "lodash";

import { Workspace } from "../types";
import { workspaceActions } from "store/slices/workspaces/slice";
import { syncEngine } from "lib/syncing";
import { hasAccessToWorkspace } from "../utils";
import { globalActions } from "store/slices/global/slice";

import clientStorageSyncManager from "./clientStorageSyncManager";

class WorkspaceManager {
  private _dispatch!: Dispatch<any>;
  private _userId?: string;
  private _availableWorkspacesMap!: { [id: string]: Workspace };
  private _activeWorkspacesMap: {
    [id: string]: {
      deactivate: () => Promise<void>;
    };
  } = {};

  initInProgress = false;

  get activeWorkspaceIds() {
    return this._activeWorkspacesMap ? Object.keys(this._activeWorkspacesMap) : [];
  }

  init(dispatch: Dispatch<any>, workspaces: Workspace[], userId?: string) {
    this._dispatch = dispatch;
    this._userId = userId;
    this._availableWorkspacesMap = Object.fromEntries(workspaces.map((workspace) => [workspace.id, workspace]));
  }

  async initActiveWorkspaces(workspaceIds: Workspace["id"][]) {
    if (this.initInProgress) {
      console.info("[WorkspaceManager.initActiveWorkspaces] initInProgress. Skipping", { workspaceIds });
      return;
    }
    console.info("[WorkspaceManager.initActiveWorkspaces] Start", { workspaceIds });

    this.initInProgress = true;
    this._dispatch(globalActions.toggleActiveModal({ modalName: "workspaceLoadingModal", newValue: true }));

    await this.resetActiveWorkspaces();
    await this.activateWorkspaces(workspaceIds);
    await clientStorageSyncManager.start(workspaceIds);

    this._dispatch(globalActions.toggleActiveModal({ modalName: "workspaceLoadingModal", newValue: false }));
    this.initInProgress = false;
    console.info("[WorkspaceManager.initActiveWorkspaces] End", { workspaceIds });
  }

  private async activateWorkspaces(workspaceIds: Workspace["id"][]) {
    console.debug("[WorkspaceManager.connectWorkspaces]", { workspaceIds });
    const connectedWorkspaceIds: string[] = [];

    // FIXME-syncing: Can be made parallel
    const promises = workspaceIds.map(async (workspaceId) => {
      const connected = await this.activateWorkspace(workspaceId);
      if (connected) {
        connectedWorkspaceIds.push(workspaceId);
      }
    });
    await Promise.all(promises);
  }

  private async activateWorkspace(workspaceId: Workspace["id"]): Promise<boolean> {
    const workspace = this._availableWorkspacesMap[workspaceId];
    console.debug("[WorkspaceManager.connectWorkspace]", { workspaceId, workspace });

    if (!hasAccessToWorkspace(this._userId, workspace)) {
      console.info("[WorkspaceManager.connectWorkspace] Skipping connect. Unauthorized", { workspaceId });
      return false;
    }

    await syncEngine.init([workspace], this._userId);

    this._activeWorkspacesMap[workspaceId] = {
      deactivate: this.deactivateWorkspace.bind(this, workspaceId),
    };
    const connectedWorkspaceIds = Object.keys(this._activeWorkspacesMap);
    window.activeWorkspaceIds = connectedWorkspaceIds;
    this._dispatch(workspaceActions.setActiveWorkspaceIds(connectedWorkspaceIds));

    console.log("[WorkspaceManager.connectWorkspace] Connected", { workspaceId });
    return true;
  }

  private async deactivateWorkspace(workspaceId: Workspace["id"]): Promise<void> {
    console.debug(`[WorkspaceManager.deactivateWorkspace] workspaceId=${workspaceId} deactivate`);
    await syncEngine.disconnectWorkspace(workspaceId);
    delete this._activeWorkspacesMap[workspaceId];
    this._dispatch(workspaceActions.removeActiveWorkspaceId(workspaceId));
    window.activeWorkspaceIds = window.activeWorkspaceIds
      ? window.activeWorkspaceIds.filter((id: string) => id !== workspaceId)
      : [];
  }

  async resetActiveWorkspaces() {
    console.debug("[WorkspaceManager.resetActiveWorkspaces]", {
      activeWorkspaces: clone(this._activeWorkspacesMap),
    });

    const promises = Object.values(this._activeWorkspacesMap).map(async (workspace) => {
      return workspace.deactivate();
    });
    await Promise.all(promises)
      .then(() => {
        console.log("[WorkspaceManager.resetActiveWorkspaces] All workspaces deactivated");
      })
      .catch((error) => {
        console.error("[WorkspaceManager.resetActiveWorkspaces] Error deactivating workspaces", error);
      });
    await clientStorageSyncManager.stop();
    this._dispatch(workspaceActions.setActiveWorkspaceIds([]));
  }
}

export const workspaceManager = new WorkspaceManager();
