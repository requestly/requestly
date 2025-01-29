import { StorageRecord } from "~/types/entities/rules";
import { SyncEntity } from "../base";

export type RuleDataSyncEntity = Omit<StorageRecord, "status" | "isFavourite"> & SyncEntity;
