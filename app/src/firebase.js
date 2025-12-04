// import * as firebase from "firebase/app";
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { isBackendEnvEmulator } from "utils/EnvUtils";

const firebaseApp = initializeApp({
  apiKey: process.env.VITE_REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.VITE_REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
});

if (isBackendEnvEmulator()) {
  if (window.location.host.includes("localhost") || window.location.host.includes("127.0.0.1")) {
    const functions = getFunctions(firebaseApp);
    connectFunctionsEmulator(functions, "localhost", 5001);
    const storage = getStorage();
    connectStorageEmulator(storage, "localhost", 9199);
    const FireStoreDb = getFirestore();
    connectFirestoreEmulator(FireStoreDb, "localhost", 8080);
    const db = getDatabase();
    connectDatabaseEmulator(db, "localhost", 9000);
    const auth = getAuth();
    connectAuthEmulator(auth, "http://localhost:9099");

    console.log("CONNECTED TO EMULATOR");
  }
}

export default firebaseApp;
