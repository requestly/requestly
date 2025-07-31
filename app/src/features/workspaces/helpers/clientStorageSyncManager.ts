import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

import { RuleStorageModel } from "lib/syncing";
import { clientStorageService } from "services/clientStorageService";
import clientRuleStorageService from "services/clientStorageService/features/rule";
import PSMH from "../../../config/PageScriptMessageHandler";
import { getActiveWorkspaceId } from "../utils";

class ClientStorageSyncManager {
  _running: boolean = false;
  _initialBackupDone: boolean = false;

  ruleSyncUnsub: () => void = () => {};

  async start(workspaceIds: string[]) {
    console.log("[ClientStorageSyncManager.init] Start", { workspaceIds });
    this._running = true;
    await this.initExtensionBackup(workspaceIds);
    await this.initExtensionListeners(workspaceIds);
    await this.initSyncHooks(workspaceIds);
    await this.initSyncSubscribers(workspaceIds);
    console.log("[ClientStorageSyncManager.init] End", { workspaceIds });
  }

  async stop() {
    console.log("[ClientStorageSyncManager.deinit] Start");

    this._running = false;
    this.ruleSyncUnsub();
    await this.deinitExtensionListeners();

    console.log("[ClientStorageSyncManager.deinit] End");
  }

  /** Backward: App <- Extension */
  async initExtensionBackup(workspaceIds: string[]) {
    console.debug("[ClientStorageSyncManager.initExtensionBackup] Start");
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

      console.debug("[ClientStorageSyncManager.initExtensionBackup] storageDump", {
        storageDump,
        rulesAndGroupsObject,
        restOfTheThings,
      });
    }

    console.debug("[ClientStorageSyncManager.initExtensionBackup] Clearing Extension Storage");
    await clientStorageService.clearStorage();

    // #region - Rules And Group Extension Changes propogation when app is CLOSED.
    await clientStorageService.saveStorageObject(restOfTheThings);

    if (!this._initialBackupDone) {
      console.debug("[ClientStorageSyncManager.initExtensionBackup]Initial Rules Backup");
      Object.values(rulesAndGroupsObject).forEach((ruleOrGroup) => {
        // FIXME-multiple-workspaces-support
        RuleStorageModel.create(ruleOrGroup, getActiveWorkspaceId(workspaceIds)).save();
      });
    } else {
      console.debug("[ClientStorageSyncManager.initExtensionBackup] Initial Rules Backup already Done");
    }
    // #endregion

    this._initialBackupDone = true;
    console.debug("[ClientStorageSyncManager.initExtensionBackup] End");
  }

  async initExtensionListeners(workspaceIds: string[]) {
    console.debug("[ClientStorageSyncManager.initExtensionListeners] Start");
    PSMH.addMessageListener(GLOBAL_CONSTANTS.EXTENSION_MESSAGES.NOTIFY_RECORD_UPDATED, (message: any) => {
      console.debug("[ClientStorageSyncManager.initExtensionListeners] NOTIFY_RECORD_UPDATED", { message });
      const recordValue = message?.payload;
      if (recordValue?.objectType === "rule" || recordValue?.objectType === "group") {
        RuleStorageModel.create(recordValue, getActiveWorkspaceId(workspaceIds)).save();
      }
    });
    console.debug("[ClientStorageSyncManager.initExtensionListeners] End");
  }

  async deinitExtensionListeners() {
    console.debug("[ClientStorageSyncManager.deinitExtensionListeners] Start");
    PSMH.removeMessageListener(GLOBAL_CONSTANTS.EXTENSION_MESSAGES.NOTIFY_RECORD_UPDATED);
    console.log("[ClientStorageSyncManager.deinitExtensionListeners] End");
  }

  /** Forward: App -> Extension */
  async initSyncHooks(workspaceIds: string[]) {
    console.debug("[ClientStorageSyncManager.initSyncHooks] Start");
    RuleStorageModel.registerOnUpdateHook((models: RuleStorageModel[]) => {
      console.debug("[ClientStorageSyncManager.initSyncHooks] onUpdateHook Custom");
      clientRuleStorageService.saveMultipleRulesOrGroups(models.map((model) => model.data));
    });

    RuleStorageModel.registerOnDeleteHook((models: RuleStorageModel[]) => {
      console.debug("[ClientStorageSyncManager.initSyncHooks] onDeleteHook Custom", { models });
      clientRuleStorageService.deleteMultipleRulesOrGroups(models.map((model) => model.data));
    });
    console.debug("[ClientStorageSyncManager.initSyncHooks] End");
  }

  async initSyncSubscribers(workspaceIds: string[]) {
    console.debug("[ClientStorageSyncManager.initSyncSubscribers] Start");
    const unsub = await RuleStorageModel.subscribe(async (ruleStorageModels: RuleStorageModel[]) => {
      const rulesAndGroups = ruleStorageModels.map((ruleStorageModel) => {
        return ruleStorageModel.data;
      });
      // Needed so that deleted rules can be cleaned up
      await clientRuleStorageService.resetRulesAndGroups();
      await clientRuleStorageService.saveMultipleRulesOrGroups(rulesAndGroups);
    });
    this.ruleSyncUnsub = unsub;
    console.debug("[ClientStorageSyncManager.initSyncSubscribers] End");
  }
}

const clientStorageSyncManager = new ClientStorageSyncManager();
export default clientStorageSyncManager;
