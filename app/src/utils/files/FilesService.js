import firebaseApp from "../../firebase";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, remove } from "firebase/database";
import { getStorage, ref as storageRef, deleteObject, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";

//UTILS
import { getShortenedUrl } from "./urlUtils";

function deleteFileFromDatabase(fileId) {
  const auth = getAuth(firebaseApp);

  const database = getDatabase();
  return remove(ref(database, "/users/" + auth.currentUser.uid + "/files/" + fileId));
}

export function deleteFile(file) {
  const storage = getStorage(firebaseApp);
  return deleteObject(storageRef(storage, "/" + file.filePath)).then(
    () => {
      return deleteFileFromDatabase(file.id);
    },
    (error) => {
      if (error.code === "storage/object-not-found") {
        return deleteFileFromDatabase(file.id);
      }
    }
  );
}

export function deleteFileFromStorage(filePath) {
  const storage = getStorage(firebaseApp);
  return deleteObject(storageRef(storage, "/" + filePath)).catch((error) => {
    if (error.code === "storage/object-not-found") {
      return new Error("File not found");
    }
  });
}

function getFileMetadataObject(result, fileDetails, downloadURL) {
  fileDetails.size = result.metadata.size;
  fileDetails.contentType = result.metadata.contentType;
  fileDetails.webContentLink = downloadURL;
  fileDetails.createdTime = result.metadata.timeCreated;
  fileDetails.filePath = result.metadata.fullPath;
  fileDetails.modifiedTime = result.metadata.updated;
  return fileDetails;
}

export function uploadNewFile(file, fileDetails) {
  return uploadFile(file, fileDetails);
}

function uploadFile(newFile, fileDetails) {
  const functions = getFunctions();
  const addMock = httpsCallable(functions, "addMock");
  const supportedTypes = [
    "application/json",
    "application/javascript",
    "text/javascript",
    "text/css",
    "text/plain",
    "image/jpeg",
    "image/png",
    "image/svg+xml",
  ];

  const checkType = supportedTypes.reduce((acc, curr) => {
    return acc || curr === fileDetails.contentType;
  }, false);

  if (!checkType) {
    return new Promise(function (resolve, reject) {
      resolve({ success: false, msg: "Unsupported File Type" });
    });
  }
  const storage = getStorage(firebaseApp);
  const auth = getAuth(firebaseApp);

  return uploadBytes(
    storageRef(storage, "/users/" + auth.currentUser.uid + "/files/" + Date.now().toString() + fileDetails.name),
    newFile
  ).then((result) => {
    return getDownloadURL(result.ref).then((downloadURL) => {
      return getShortenedUrl(downloadURL).then((shortUrl) => {
        fileDetails.shortUrl = shortUrl;
        const fileObject = getFileMetadataObject(result, fileDetails, downloadURL);
        return addMock(fileObject).then((mockFileId) => {
          const data = {
            id: mockFileId.data,
            shortUrl,
          };
          return { success: true, data };
        });
      });
    });
  });
}

export function updateFile(filePath, fileData, file) {
  const storage = getStorage(firebaseApp);
  const blob = new Blob([fileData], { type: file.contentType });
  const metadata = {
    contentType: file.contentType,
  };
  return uploadBytes(storageRef(storage, filePath), blob, metadata).then((response) => {
    return getDownloadURL(response.ref).then((downloadURL) => {
      const fileObject = getFileMetadataObject(response, file, downloadURL);
      fileObject.id = file.id;
      return { success: true, data: fileObject };
      // updateFileDetailsInDatabase  not used as Files of all types are being stored in FireStore
      // Canbe Used for Testing
      // return updateFileDetailsInDatabase(fileObject).then(() => {
      //   return { success: true, data: fileObject };
      // });
    });
  });
}

export function createFile(fileDetails, fileData) {
  const newFile = new File([fileData], fileDetails.name, {
    type: fileDetails.contentType,
    lastModified: Date.now(),
  });
  return uploadNewFile(newFile, fileDetails);
}

export const getMockType = (record) => {
  if (record.isMock) {
    return {
      extension: "API",
      color: "green",
    };
  } else if (record.contentType === "text/html") {
    return {
      extension: "HTML",
      color: "orange",
    };
  } else if (record.contentType === "text/css") {
    return {
      extension: "CSS",
      color: "blue",
    };
  } else if (record.contentType.includes("javascript")) {
    return {
      extension: "JS",
      color: "yellow",
    };
  } else if (record.contentType.includes("image/")) {
    return {
      extension: "IMAGE",
      color: "cyan",
    };
  } else {
    return {
      extension: record.contentType,
      color: "green",
    };
  }
};

export const getMethodType = (record) => {
  if (record === "GET") {
    return "green";
  } else if (record === "POST") {
    return "orange";
  } else if (record === "PUT") {
    return "geekblue";
  } else if (record === "DELETE") {
    return "blue";
  } else if (record === "PATCH") {
    return "purple";
  }
};
