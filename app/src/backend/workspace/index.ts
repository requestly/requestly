import firebaseApp from "../../firebase";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";

export const renameWorkspace = async (teamId: string, newName: string) => {
  const db = getFirestore();
  const teamRef = doc(db, "teams", teamId);

  return updateDoc(teamRef, {
    name: newName,
  });
};

export const getOrganizationMembers = async (domain: string) => {
  const db = getFirestore(firebaseApp);
  try {
    const docRef = doc(db, "organisations", domain);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching domain details:", error);
    throw new Error("Error fetching domain details");
  }
};
