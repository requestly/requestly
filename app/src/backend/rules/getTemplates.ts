import firebaseApp from "../../firebase";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { RuleTemplate } from "features/rules";

export const getTemplates = async (): Promise<RuleTemplate[]> => {
  const templates = await getTemplatesFromFirebase();
  return templates;
};

const getTemplatesFromFirebase = async (): Promise<RuleTemplate[]> => {
  const db = getFirestore(firebaseApp);
  const querySnapshot = await getDocs(collection(db, "templates"));

  if (!querySnapshot.empty) {
    const templates: RuleTemplate[] = [];

    querySnapshot.forEach((doc) => {
      templates.push({ ...doc.data(), id: doc.id } as RuleTemplate);
    });

    return templates;
  } else {
    return null;
  }
};
