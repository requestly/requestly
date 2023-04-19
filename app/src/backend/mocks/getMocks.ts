import firebaseApp from "../../firebase";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import { MockType, RQMockMetadataSchema } from "components/features/mocksV2/types";
import { getOwnerId } from "backend/utils";

export const getMocks = async (uid: string, type: MockType, teamId?: string): Promise<RQMockMetadataSchema[]> => {
  if (!uid) {
    return [];
  }

  const ownerId = getOwnerId(uid, teamId);
  const mocks = await getMocksFromFirebase(ownerId, type).catch(() => []);
  return mocks;
};

const getMocksFromFirebase = async (ownerId: string, type?: MockType): Promise<RQMockMetadataSchema[]> => {
  const db = getFirestore(firebaseApp);
  const rootMocksRef = collection(db, "mocks");

  let q = query(rootMocksRef, where("ownerId", "==", ownerId), where("deleted", "in", [false]));

  if (type) {
    q = query(q, where("type", "==", type));
  }

  const result: any = [];
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return [];
  }

  snapshot.forEach((doc: any) => {
    result.push(doc.data());
  });

  return result;
};
