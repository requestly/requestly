import firebaseApp from "../firebase";
import { getBlob, getStorage, ref, uploadBytes } from "firebase/storage";

/**
 * Creates/Updates file in cloud bucket
 * @param name Name of the file. i.e responseId
 * @param type type of the file
 * @param data data of the file
 * @param path path of the file. /users/{uid}/mockBody/{mockId}/fileName
 */
export const createFile = async (name: string, type: string, data: string, filePath = "") => {
  const newFile = new File([data], name, {
    type: type,
    lastModified: Date.now(),
  });

  const uploadedFilePath = await uploadFile(newFile, filePath);
  return uploadedFilePath;
};

/**
 *
 * @param file File object
 * @param filePath /users/{uid}/mockBody/{mockId}/fileName
 */
export const uploadFile = async (file: File, filePath: string): Promise<string | null> => {
  const storage = getStorage(firebaseApp);
  const storageRef = ref(storage, filePath);

  try {
    const path = await uploadBytes(storageRef, file);
    return path.ref.fullPath;
  } catch {
    return null;
  }
};

export const getFile = async (filePath: string) => {
  const storage = getStorage(firebaseApp);
  const storageRef = ref(storage, filePath);

  try {
    const blob = await getBlob(storageRef);
    const data = new Blob([blob]).text();
    return data;
  } catch {
    return null;
  }
};
