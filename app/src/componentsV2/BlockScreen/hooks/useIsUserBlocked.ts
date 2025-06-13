import firebaseApp from "firebase";
import { getDatabase, onValue, ref } from "firebase/database";
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";

export enum BlockType {
  GRR = "grr",
  COMPLIANCE_ISSUE = "compliance-issue",
}

export type BlockConfig = {
  [key in BlockType]?: {
    isBlocked: boolean;
    reason?: string;
    metadata?: Record<string, any>;
  };
};

export const useIsUserBlocked = () => {
  const user = useSelector(getUserAuthDetails);
  const isLoggedIn = user?.loggedIn;
  const uid = user?.details?.profile?.uid;
  const email = user?.details?.profile?.email;

  const [domainBlockConfig, setDomainBlockConfig] = useState<BlockConfig>({});
  const [userBlockConfig, setUserBlockConfig] = useState<BlockConfig>({});
  const [finalBlockConfig, setFinalBlockConfig] = useState<BlockConfig>({});

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const db = getFirestore(firebaseApp);
    const unsubscribeListener = onSnapshot(doc(db, "users", uid), (doc) => {
      if (doc.exists()) {
        const userDetails = doc.data();
        setUserBlockConfig(userDetails?.["block-config"] || {});
      }
    });

    return () => {
      unsubscribeListener?.();
    };
  }, [isLoggedIn, uid]);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const emailDomain = email?.split("@")[1];
    const emailDomainKey = emailDomain?.replaceAll(".", "_dot_");
    const rdb = getDatabase();
    const domainBlockConfigRef = ref(rdb, `globalBlockConfig/domain/${emailDomainKey}`);
    const unsubscribe = onValue(domainBlockConfigRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setDomainBlockConfig(data || {});
      } else {
        setDomainBlockConfig({});
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, [email, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !uid) {
      setFinalBlockConfig({});
      setDomainBlockConfig({});
      setUserBlockConfig({});
      return;
    }

    // console.log({ userBlockConfig, domainBlockConfig });

    for (const [key, value] of Object.entries(userBlockConfig)) {
      if (value?.isBlocked) {
        setFinalBlockConfig({
          [key]: {
            ...value,
          },
        });
        return;
      }
    }

    for (const [key, value] of Object.entries(domainBlockConfig)) {
      if (value?.isBlocked) {
        setFinalBlockConfig({
          [key]: {
            ...value,
          },
        });
        return;
      }
    }
  }, [domainBlockConfig, isLoggedIn, uid, userBlockConfig]);

  return {
    isBlocked: Object.values(finalBlockConfig).some((value) => value.isBlocked),
    blockConfig: finalBlockConfig,
  };
};
