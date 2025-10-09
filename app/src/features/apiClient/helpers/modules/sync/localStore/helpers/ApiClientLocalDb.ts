import Dexie from "dexie";
import { ApiClientLocalDbTable } from "./types";
import { ApiClientLocalStoreMeta } from "../../interfaces";

export class ApiClientLocalDb {
  db: Dexie;

  constructor(metadata: ApiClientLocalStoreMeta) {
    this.db = new Dexie("apiClientLocalStorageDB") as Dexie;

    this.db.version(metadata.version).stores({
      [ApiClientLocalDbTable.APIS]: "id", // indexed by id
      [ApiClientLocalDbTable.ENVIRONMENTS]: "id",
    });
  }
}
