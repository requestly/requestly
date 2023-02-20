import { useEffect } from "react";
import firebaseApp from "firebase.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initIntegrations } from "modules/analytics";

const useThirdPartyIntegrations = () => {
  useEffect(() => {
    const auth = getAuth(firebaseApp);
    onAuthStateChanged(auth, async (user) => {
      initIntegrations(user);
    });
  }, []);
};

export default useThirdPartyIntegrations;
