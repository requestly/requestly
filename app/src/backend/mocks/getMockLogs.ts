import firebaseApp from "../../firebase";
import { getFirestore, query, collection, getDocs, orderBy, limit } from "firebase/firestore";
import type { Entry } from "har-format";

export interface Log {
  id: string;
  createdAt: number;
  har: Partial<Entry>;
}

export function getMockLogsQuery(mockId: string, numLogs: number = 10) {
  const db = getFirestore(firebaseApp);
  const logsRef = collection(db, "mocks", mockId, "logs");
  const q = query(logsRef, orderBy("createdAt", "desc"), limit(numLogs));

  return q;
}

/* POC for now: only showing last 10 logs */
export async function getMockLogs(mockId: string): Promise<Log[]> {
  const logDocuments = await getDocs(getMockLogsQuery(mockId));
  const logs: Log[] = logDocuments.docs.map((doc) => ({
    id: doc.id,
    createdAt: doc.data().createdAt,
    har: doc.data().HarEntry,
  }));
  return logs;
}
