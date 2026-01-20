import { useHasChanged } from "hooks";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import {
  getFirestore,
  collection,
  orderBy,
  query as firebaseQuery,
  limit,
  where,
  onSnapshot,
} from "firebase/firestore";
import firebaseApp from "../../../../../../../firebase";
import { getOwnerId } from "backend/utils";
import { SessionRecording } from "../../../../../types";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";

// TODO: ADD PAGINATION

const pageSize = 15;
// let unsubscribeListener: any;

export const useFetchSessions = (forceRender: boolean) => {
  const user = useSelector(getUserAuthDetails);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const hasUserChanged = useHasChanged(user?.details?.profile?.uid);
  const [isSessionsListLoading, setIsSessionsListLoading] = useState(false);
  const [sessions, setSessions] = useState([]);

  const fetchRecordings = (lastDoc: unknown = null) => {
    setIsSessionsListLoading(true);
    setSessions([]);
    const records: SessionRecording[] = [];
    const db = getFirestore(firebaseApp);
    const collectionRef = collection(db, "session-recordings");
    const ownerId = getOwnerId(user?.details?.profile?.uid, activeWorkspaceId);

    let query = null;

    // if (lastDoc) {
    //   query = firebaseQuery(
    //     collectionRef,
    //     where("ownerId", "==", ownerId),
    //     orderBy("sessionAttributes.startTime", "desc"),
    //     startAfter(lastDoc),
    //     limit(pageSize)
    //   );
    // } else {
    query = firebaseQuery(
      collectionRef,
      where("ownerId", "==", ownerId),
      orderBy("sessionAttributes.startTime", "desc"),
      limit(pageSize)
    );
    // }

    onSnapshot(query, (documentSnapshots) => {
      if (!documentSnapshots.empty) {
        documentSnapshots.forEach((doc) => {
          const recordData = doc.data();
          if (!recordData?.isInternal && !recordData?.testThisRuleMetadata) {
            records.push({
              id: doc.id,
              name: recordData.name,
              duration: recordData.sessionAttributes.duration,
              startTime: recordData.sessionAttributes.startTime,
              url: recordData.sessionAttributes.url,
              visibility: recordData.visibility,
              eventsFilePath: recordData.eventsFilePath,
              createdBy: recordData.createdBy || recordData.author,
            });
          }
        });

        setSessions(records);

        if (records.length > 0) {
          //   setQs(documentSnapshots); // Handles pagination
        }
      } else {
        setSessions([]);
        // setReachedEnd(true);
      }
      setIsSessionsListLoading(false);
    });
  };

  const resetAndFetchSessions = () => {
    setSessions([]);
    stableFetchSessions();
  };

  const stableFetchSessions = useCallback(fetchRecordings, [user?.details?.profile?.uid, activeWorkspaceId]);

  useEffect(() => {
    if (user?.details?.profile?.uid) {
      // if (hasUserChanged) {
      //   setSessions([]);
      //   // setReachedEnd(false);
      //   stableFetchSessions();
      // } else {
      stableFetchSessions();
      // }
    }
  }, [hasUserChanged, activeWorkspaceId, stableFetchSessions, user?.details?.profile?.uid, forceRender]);

  return {
    sessions,
    isSessionsListLoading,
    resetAndFetchSessions,
  };
};
