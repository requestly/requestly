import { Dispatch } from "react";
import { clone } from "lodash";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

import { Workspace } from "../types";
import { workspaceActions } from "store/slices/workspaces/slice";
import { RuleStorageModel, syncEngine } from "requestly-sync-engine";
import { getActiveWorkspaceId, hasAccessToWorkspace } from "../utils";
import { globalActions } from "store/slices/global/slice";

import PSMH from "../../../config/PageScriptMessageHandler";
import { clientStorageService } from "services/clientStorageService";
import clientRuleStorageService from "services/clientStorageService/features/rule";

class WorkspaceManager {
  initInProgress = false;
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
  async initActiveWorkspaces(workspaceIds: Workspace["id"][]) {
    if (this.initInProgress) {
      console.log("[WorkspaceManager.initActiveWorkspaces] initInProgress. Skipping", { workspaceIds });
      return;
    }

    this.dispatch(globalActions.toggleActiveModal({ modalName: "workspaceLoadingModal", newValue: true }));
    this.resetActiveWorkspaces();

    //#region - Extension Storage backup -> reset -> reinit
    // TODO-syncing: Take backups of extensions storage changes before clearing
    const storageDump = await clientStorageService.getStorageSuperObject();
    const rulesAndGroupsObject: Record<string, any> = {};
    const restOfTheThings: Record<string, any> = {};
    if (storageDump) {
      for (let key in storageDump) {
        if (storageDump[key]?.objectType === "rule" || storageDump[key]?.objectType === "group") {
          rulesAndGroupsObject[key] = storageDump[key];
        } else {
          restOfTheThings[key] = storageDump[key];
        }
      }

      console.log("[WorkspaceManager.initActiveWorkspaces] storageDump", {
        storageDump,
        rulesAndGroupsObject,
        restOfTheThings,
      });
    }

    console.log("[WorkspaceManager.initActiveWorkspaces] Clearing Extension Storage");
    clientStorageService.clearStorage();

    console.log("[WorkspaceManager.initActiveWorkspaces] Reinit Extension Storage");
    clientStorageService.saveStorageObject(restOfTheThings);
    //#endregion

    await this.connectWorkspaces(workspaceIds);
    this.dispatch(globalActions.toggleActiveModal({ modalName: "workspaceLoadingModal", newValue: false }));

    // Rules And Group Extension Changes Propogation
    // #region - Rules And Group Extension Changes Propogation
    console.log("[WorkspaceManager.initActiveWorkspaces] Extension Changes -> SyncEngine");
    Object.values(rulesAndGroupsObject).forEach((ruleOrGroup) => {
      // FIXME-syncing: Which workspaceId to sync to?
      RuleStorageModel.create(ruleOrGroup, getActiveWorkspaceId(workspaceIds)).save();
    });

    PSMH.addMessageListener(GLOBAL_CONSTANTS.EXTENSION_MESSAGES.NOTIFY_RECORD_UPDATED, (message: any) => {
      console.log("[workspaceManager] NOTIFY_RECORD_UPDATED", { message });
      const recordValue = message?.payload;
      if (recordValue?.objectType === "rule" || recordValue?.objectType === "group") {
        RuleStorageModel.create(recordValue, getActiveWorkspaceId(workspaceIds)).save();
      }
    });
    // #endregion

    this.initInProgress = false;
  }

  // append
  private async connectWorkspaces(workspaceIds: Workspace["id"][]) {
    console.log("[WorkspaceManager.connectWorkspaces]", { workspaceIds });
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

  // append
  private async connectWorkspace(workspaceId: Workspace["id"]): Promise<boolean> {
    const workspace = this.workspaceMap[workspaceId];
    console.log("[WorkspaceManager.connectWorkspace]", { workspaceId, workspace });

    //#region - Access Check
    if (!hasAccessToWorkspace(this.userId, workspace)) {
      console.log("[WorkspaceManager.connectWorkspace] Skipping connect. Unauthorized", { workspaceId });
      this.dispatch(workspaceActions.removeActiveWorkspaceId(workspaceId));
      return false;
    }
    //#endregion

    //#region - syncing init
    await syncEngine.init(
      [{ id: workspaceId, replication: this.workspaceMap[workspaceId]?.isSyncEnabled }],
      this.userId,
      this.userId
    );

    RuleStorageModel.registerOnUpdateHook((models: RuleStorageModel[]) => {
      console.log("[workspaceManager] onUpdateHook Custom");
      clientRuleStorageService.saveMultipleRulesOrGroups(models.map((model) => model.data));
    });

    RuleStorageModel.registerOnDeleteHook((models: RuleStorageModel[]) => {
      console.log("[workspaceManager] onDeleteHook Custom", { models });
      clientRuleStorageService.deleteMultipleRulesOrGroups(models.map((model) => model.data));
    });
    //#endregion

    //#region - Connect
    const disconnect = () => {
      console.log(`[WorkspaceManager] workspaceId=${workspaceId} disconnect`);
      delete this.activeWorkspaceMap[workspaceId];
      syncEngine.disconnectWorkspace(workspaceId);
      this.dispatch(workspaceActions.removeActiveWorkspaceId(workspaceId));
    };
    this.activeWorkspaceMap[workspaceId] = {
      disconnect: disconnect,
    };

    const connectedWorkspaceIds = Object.keys(this.activeWorkspaceMap);
    window.activeWorkspaceIds = connectedWorkspaceIds;
    this.dispatch(workspaceActions.setActiveWorkspaceIds(connectedWorkspaceIds));
    console.log("[WorkspaceManager.connectWorkspace] Connected", { workspaceId });
    //#endregion
    return true;
  }

  resetActiveWorkspaces() {
    console.log("[WorkspaceManager.resetActiveWorkspaces]", {
      activeWorkspaces: clone(this.activeWorkspaceMap),
    });
    Object.values(this.activeWorkspaceMap).forEach((iter) => {
      iter.disconnect();
    });
    this.dispatch(workspaceActions.setActiveWorkspaceIds([]));

    // Rules And Group Extension Changes Propogation remove old one
    console.log("[WorkspaceManager.resetActiveWorkspaces] Removing Message Listener");
    PSMH.removeMessageListener(GLOBAL_CONSTANTS.EXTENSION_MESSAGES.NOTIFY_RECORD_UPDATED);
  }
}

export const workspaceManager = new WorkspaceManager();
