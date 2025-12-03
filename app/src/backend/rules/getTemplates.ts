import firebaseApp from "../../firebase";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import { RuleTemplate } from "features/rules";

export const getTemplates = async (templateIds: string[]): Promise<RuleTemplate[] | null> => {
  const templates = await getTemplatesFromFirebase(templateIds);
  return templates;
};

const getTemplatesFromFirebase = async (templateIds: string[]): Promise<RuleTemplate[] | null> => {
  const db = getFirestore(firebaseApp);
  const templateQuery = query(collection(db, "templates"), where("id", "in", templateIds));
  const querySnapshot = await getDocs(templateQuery);

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
