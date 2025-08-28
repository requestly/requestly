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
    private _workspaceMap!: { [id: string]: Workspace };
    private _activeWorkspaceMap: {
        [id: string]: {
            disconnect: () => void;
        };
    } = {};

    initInProgress = false;

    init(dispatch: Dispatch<any>, workspaces: Workspace[], userId?: string) {
        this._dispatch = dispatch;
        this._userId = userId;
        this._workspaceMap = {};
        workspaces.forEach((workspace) => {
            this._workspaceMap[workspace.id] = workspace;
        });
    }

    async initActiveWorkspaces(workspaceIds: Workspace["id"][]) {
        if (this.initInProgress) {
            console.info("[WorkspaceManager.initActiveWorkspaces] initInProgress. Skipping", { workspaceIds });
            return;
        }
        console.info("[WorkspaceManager.initActiveWorkspaces] Start", { workspaceIds });

        this._dispatch(globalActions.toggleActiveModal({ modalName: "workspaceLoadingModal", newValue: true }));

        await this.resetActiveWorkspaces();
        await this.connectWorkspaces(workspaceIds);
        await clientStorageSyncManager.start(workspaceIds);

        this._dispatch(globalActions.toggleActiveModal({ modalName: "workspaceLoadingModal", newValue: false }));
        this.initInProgress = false;
        console.info("[WorkspaceManager.initActiveWorkspaces] End", { workspaceIds });
    }

    private async connectWorkspaces(workspaceIds: Workspace["id"][]) {
        console.debug("[WorkspaceManager.connectWorkspaces]", { workspaceIds });
        const connectedWorkspaceIds: string[] = [];

        // FIXME-syncing: Can be made parallel
        const promises = workspaceIds.map(async (workspaceId) => {
            const connected = await this.connectWorkspace(workspaceId);
            if (connected) {
                connectedWorkspaceIds.push(workspaceId);
            }
        });
        await Promise.all(promises);
    }

    private async connectWorkspace(workspaceId: Workspace["id"]): Promise<boolean> {
        const workspace = this._workspaceMap[workspaceId];
        console.debug("[WorkspaceManager.connectWorkspace]", { workspaceId, workspace });

        if (!hasAccessToWorkspace(this._userId, workspace)) {
            console.info("[WorkspaceManager.connectWorkspace] Skipping connect. Unauthorized", { workspaceId });
            this._dispatch(workspaceActions.removeActiveWorkspaceId(workspaceId));
            return false;
        }

        await syncEngine.init([workspace], this._userId);

        this._activeWorkspaceMap[workspaceId] = {
            disconnect: () => {
                console.debug(`[WorkspaceManager] workspaceId=${workspaceId} disconnect`);
                syncEngine.disconnectWorkspace(workspaceId);

                delete this._activeWorkspaceMap[workspaceId];
                this._dispatch(workspaceActions.removeActiveWorkspaceId(workspaceId));
                window.activeWorkspaceIds = window.activeWorkspaceIds
                    ? window.activeWorkspaceIds.filter((id: string) => id !== workspaceId)
                    : [];
            },
        };
        const connectedWorkspaceIds = Object.keys(this._activeWorkspaceMap);
        window.activeWorkspaceIds = connectedWorkspaceIds;
        this._dispatch(workspaceActions.setActiveWorkspaceIds(connectedWorkspaceIds));

        console.log("[WorkspaceManager.connectWorkspace] Connected", { workspaceId });
        return true;
    }

    async resetActiveWorkspaces() {
        console.debug("[WorkspaceManager.resetActiveWorkspaces]", {
            activeWorkspaces: clone(this._activeWorkspaceMap),
        });
        Object.values(this._activeWorkspaceMap).forEach((workspace) => {
            workspace.disconnect();
        });

        clientStorageSyncManager.stop();
        this._dispatch(workspaceActions.setActiveWorkspaceIds([]));
    }
}

export const workspaceManager = new WorkspaceManager();
