import firebaseApp from "firebase";
import { child, Database, get, getDatabase, ref, update } from "firebase/database";
import { SampleCollectionsImportDetails } from "./types";
import { SAMPLE_COLLECTIONS } from "./constants/samples";

class SampleCollections {
  private db: Database;
  private dbPath = "apiClientSampleCollections";

  constructor() {
    this.db = getDatabase(firebaseApp);
  }

  private getUserConfigsRef(uid: string) {
    return ref(this.db, `users/${uid}/configs`);
  }

  private getSampleCollectionsRef(uid: string) {
    return ref(this.db, `users/${uid}/configs/${this.dbPath}`);
  }

  /**
   * Converts sample collections into file like object, so existing import logic can be reused.
   */
  private convertSampleCollectionsIntoFile() {
    const FILE_NAME = "sampleCollections.json";
    const jsonString = JSON.stringify(SAMPLE_COLLECTIONS.collections, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const file = new File([blob], FILE_NAME, {
      type: "application/json",
      lastModified: Date.now(),
    });

    return file;
  }

  getSampleCollectionsFile(): File {
    return this.convertSampleCollectionsIntoFile();
  }

  async getImportDetails(uid: string): Promise<SampleCollectionsImportDetails> {
    const userConfigsRef = this.getUserConfigsRef(uid);
    const snapshot = await get(child(userConfigsRef, this.dbPath));

    if (!snapshot.exists()) {
      return { imported: false, version: SAMPLE_COLLECTIONS.version };
    }

    return snapshot.val();
  }

  async updateImportDetails(uid: string, details: Partial<SampleCollectionsImportDetails>) {
    const nodeRef = this.getSampleCollectionsRef(uid);
    await update(nodeRef, { ...details });
  }
}

const sampleCollections = new SampleCollections();
export default sampleCollections;
