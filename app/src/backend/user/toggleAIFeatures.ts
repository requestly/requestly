import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import firebaseApp from "../../firebase";

export const toggleAIFeatures = async (
  userId: string | undefined,
  enabled: boolean
): Promise<{ success: boolean; message: string }> => {
  if (!userId) {
    return {
      success: false,
      message: "User ID is required",
    };
  }

  const db = getFirestore(firebaseApp);
  const docRef = doc(db, "users", userId);

  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return {
      success: false,
      message: "User not found",
    };
  }

  const data = snapshot.data();
  const currentMetadata = data?.metadata || {};

  await updateDoc(docRef, {
    metadata: {
      ...currentMetadata,
      ai_consent: enabled,
    },
  });

  return {
    success: true,
    message: enabled ? "AI features enabled successfully" : "AI features disabled successfully",
  };
};
