import { createRxDatabase, deepEqual, RxCollection, RxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { replicateRxCollection, RxReplicationState } from "rxdb/plugins/replication";
import { Observable, Subject, Subscription } from "rxjs";
import { omit } from "lodash";

import { ruleDataSchema } from "./entities/ruleData";
import { ruleMetadataSchema } from "./entities/ruleMetadata";
import { SyncEntityType, syncTypeToEntityMap } from "@requestly/shared/types/syncEntities";
import { ReplicationConfig } from "./types";

class SyncWorkspace {
  userId: string | undefined;
  authToken: string = "";
  workspaceId: string;
  replicationConfig?: ReplicationConfig;
  database: RxDatabase | null;
  collections: {
    [key in SyncEntityType]?: RxCollection<syncTypeToEntityMap[key]> | null;
  };

  /** Subscriptions */
  commonPullStream$?: Subject<any>;
  collectionPullStreamMap: {
    [key in SyncEntityType]?: Subject<any>;
  } = {};
  pullStreamEventSource?: EventSource;
  replicationState: {
    [key in SyncEntityType]?: RxReplicationState<any, any> | null;
  } = {};

  // Don't use this constructor to instantiate. Use static create method instead.
  constructor(
    workspaceId: string,
    replicationConfig?: ReplicationConfig,
    userId: string | undefined = undefined,
    authToken: string = ""
  ) {
    this.userId = userId;
    this.authToken = authToken;
    this.workspaceId = workspaceId;
    this.database = null;
    this.collections = {};
    this.replicationConfig = replicationConfig;
  }

  static async create(
    workspaceId: string,
    replication?: ReplicationConfig,
    userId?: string,
    authToken?: string
  ): Promise<SyncWorkspace> {
    const syncWorkspace = new SyncWorkspace(workspaceId, replication, userId, authToken);
    await syncWorkspace.init();
    return syncWorkspace;
  }

  async init() {
    console.log("[SyncWorkspace.init] Start", {
      workspaceId: this.workspaceId,
      replication: this.replicationConfig,
    });
    await this.initRxDB();
    await this.connect();
    console.log("[SyncWorkspace.init] Done", { workspaceId: this.workspaceId });
  }

  async initRxDB() {
    console.log("[SyncWorkspace.initRxDB] Start", {
      workspaceId: this.workspaceId,
    });
    // #region - Database Init
    this.database = await createRxDatabase({
      name: `sync-db${this.userId ? "-" + this.userId : ""}-${this.workspaceId}`,
      storage: getRxStorageDexie(),
      // ignoreDuplicate: true,
    });

    this.collections = await this.database.addCollections({
      [SyncEntityType.RULE_DATA]: {
        schema: ruleDataSchema,
      },
      [SyncEntityType.RULE_METADATA]: {
        schema: ruleMetadataSchema,
      },
    });
    // #endregion

    // #region - PreInsert and PreSave Hooks
    Object.values(SyncEntityType).forEach((entityType) => {
      this.collections[entityType]?.preInsert((plainData) => {
        console.log(`[SyncWorkspace.collections.${entityType}.preinsert]`, { plainData });

        // New Document
        if (!plainData?.createdAt || !plainData?.createdBy) {
          // TODO-syncing: Change this to userId;
          plainData.createdBy = this.authToken;
          plainData.updatedBy = this.authToken;
          plainData.createdAt = Date.now();
          plainData.updatedAt = Date.now();
          console.log(`[SyncWorkspace.collections.${entityType}.preinsert] New`, { plainData });
        }
      }, false);

      this.collections[entityType]?.preSave((plainData, rxDocument) => {
        console.log(`[SyncWorkspace.collections.${entityType}.preSave]`, { plainData, rxDocument });
        const _plainData = omit(plainData, [
          "createdAt",
          "updatedAt",
          "createdBy",
          "updatedBy",
          "_meta",
          "_rev",
          "_attachments",
        ]);
        const _rxDocument = omit(rxDocument, [
          "createdAt",
          "updatedAt",
          "createdBy",
          "updatedBy",
          "_meta",
          "_rev",
          "_attachments",
        ]);
        const isEqual = deepEqual(_plainData, _rxDocument);
        if (isEqual) {
          console.log(`[SyncWorkspace.collections.${entityType}.preSave] Stop`, {
            plainData,
            _plainData,
            rxDocument,
            _rxDocument,
            isEqual,
          });
          throw new Error("stop");
        }

        // Updated
        plainData.updatedBy = this.authToken;
        plainData.updatedAt = Date.now();
        console.log(`[SyncWorkspace.collections.${entityType}.preSave] Updated`, { plainData });
      }, false);
    });

    // #endregion

    console.log("[SyncWorkspace.initRxDB] Done", {
      database: this.database,
      collections: this.collections,
    });
  }

  async connect() {
    console.log("[SyncWorkspace.connect] Start", this.workspaceId);
    await Promise.all(
      Object.values(SyncEntityType).map(async (collectionType) => {
        await this._setupReplication(collectionType);
      })
    );
    console.log("[SyncWorkspace.connect] Done");
  }

  async disconnect() {
    // Disconnect from the workspace for Sync
    console.log("[SyncWorkspace.disconnect] Start", this.workspaceId);
    this.pullStreamEventSource?.close();
    this.commonPullStream$?.complete();
    Object.values(this.collectionPullStreamMap).forEach((collectionSubject) => {
      collectionSubject.complete();
    });
    this.replicationState[SyncEntityType.RULE_DATA]?.cancel();
    this.replicationState[SyncEntityType.RULE_METADATA]?.cancel();
    console.log("[SyncWorkspace.disconnect] Done", this.workspaceId);
  }

  _setupCommonPullStream() {
    console.log(`[SyncWorkspace._setupCommonPullStream] Start`);
    const pullStreamUrl = `${this.replicationConfig?.baseUrl}/${this.workspaceId}/pull-stream/?authToken=${this.authToken}`;

    const pullStream$ = new Subject();
    const eventSource = new EventSource(pullStreamUrl, {
      withCredentials: false,
    });
    eventSource.onerror = () => pullStream$.next("RESYNC");
    eventSource.onmessage = (event) => {
      const eventData = JSON.parse(event.data);
      console.log("[SyncWorkspace._setupReplication] commonPullStream onMessage", { eventData });
      pullStream$.next(eventData);
    };
    this.commonPullStream$ = pullStream$;
    this.pullStreamEventSource = eventSource;
    console.log(`[SyncWorkspace._setupCommonPullStream] End`);
  }

  _createCollectionReplicationStream(collectionType: SyncEntityType): Subject<any> {
    if (!this.commonPullStream$) {
      this._setupCommonPullStream();
    }

    const collectionStream$ = new Subject<any>();

    this.commonPullStream$?.subscribe((event) => {
      console.log(`[SyncWorkspace._setupReplication] collectionType:${collectionType} pullStream`, { event });
      if (event === "RESYNC") {
        collectionStream$.next(event);
      } else {
        if (event && event?.data?.[collectionType] && event?.data[collectionType].documents.length > 0) {
          const filteredDocuments = event.data[collectionType].documents;
          const checkpoint = event.data[collectionType].checkpoint;
          console.log(
            `[SyncWorkspace._setupReplication] collectionType:${collectionType} pullStream filteredDocuments`,
            { event, filteredDocuments }
          );
          collectionStream$.next({
            documents: filteredDocuments,
            checkpoint: checkpoint,
          });
        }
      }
    });
    return collectionStream$;
  }

  async _setupReplication(entityType: SyncEntityType) {
    console.log("[SyncWorkspace._setupReplication]", { collectionType: entityType });

    if (!this.authToken) {
      console.log("[SyncWorkspace._setupReplication]", "No authToken. Skipping Replication");
      return;
    }

    if (!this.replicationConfig?.enabled) {
      console.log("[SyncWorkspace._setupReplication]", "Replication is off");
      return;
    }

    if (!this.collections[entityType]) {
      console.error("[SyncWorkspace._setupReplication] Collection not found", {
        collectionType: entityType,
      });
      return;
    }

    // TODO: Make it generic and use API_GATEWAY_URL
    const pushUrl = `${this.replicationConfig.baseUrl}/${this.workspaceId}/push/`;
    const pullUrl = `${this.replicationConfig.baseUrl}/${this.workspaceId}/pull/`;

    const collectionStream$ = this._createCollectionReplicationStream(entityType);
    const authToken = this.authToken;

    this.replicationState[entityType] = replicateRxCollection({
      autoStart: false,
      collection: this.collections[entityType],
      replicationIdentifier: `${this.workspaceId}-${entityType}-replication`,
      push: {
        async handler(changedRows) {
          console.log("[SyncWorkspace] Push start", {
            entityType,
            changedRows,
          });
          const rawResponse = await fetch(pushUrl, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: authToken ?? "",
            },
            body: JSON.stringify({
              entityType,
              changedRows,
            }),
          });
          const conflictsArray = await rawResponse.json();
          console.log("[SyncWorkspace] Push end", { conflictsArray });
          return conflictsArray;
        },
      },
      pull: {
        async handler(checkpointOrNull: any, batchSize: number) {
          console.log("[SyncWorkspace] Pull start", {
            checkpointOrNull,
            batchSize,
          });
          const updatedAt = checkpointOrNull && checkpointOrNull.updatedAt ? checkpointOrNull.updatedAt : 0;
          // const id = checkpointOrNull ? checkpointOrNull.id : "";
          // Only full collectionType so that we don't fetch redundant data
          const response = await fetch(
            `${pullUrl}?checkpointUpdatedAt=${updatedAt}&limit=${batchSize}&entityType=${entityType}`,
            {
              headers: {
                Authorization: authToken ?? "",
              },
            }
          );
          const data = await response.json();
          const collectionData = data[entityType];
          console.log("[SyncWorkspace] Pull end", { data, collectionData });
          return {
            documents: collectionData.documents,
            checkpoint: collectionData.checkpoint,
          };
        },
        stream$: collectionStream$.asObservable() as Observable<any>,
      },
    });

    // Causing Multiple Push Calls thats why removed; But not if autostart is false
    console.log("[SyncWorkspace._setupReplication] Starting Replication", { entityType });
    this.replicationState[entityType].start();
    // replicationState.received$.subscribe(doc => console.log({ doc }));
  }

  async subscribeToCollection(
    entityType: SyncEntityType,
    callback: (docs: any[]) => void
  ): Promise<undefined | Subscription> {
    console.log("[SyncWorkspace.subscribeToCollection] Start", { entityType }, this.workspaceId);
    const collection = this.collections[entityType];
    if (!collection) {
      console.error("[SyncWorkspace.subscribeToCollection] Collection not found", { entityType });
      return;
    }

    const subscription: Subscription = collection
      ?.find()
      // @ts-expect-error - Ignore
      .$.subscribe(async (docs) => {
        console.log("observable", this.workspaceId, docs);
        callback(docs);
      });

    return subscription;
  }
}

export default SyncWorkspace;
