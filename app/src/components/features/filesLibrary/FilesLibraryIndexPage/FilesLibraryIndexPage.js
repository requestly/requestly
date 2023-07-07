import React, { useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import isEmpty from "is-empty";
//SUB COMPONENTS
import FilesLibraryTableContainer from "../FilesLibraryTableContainer";
import SpinnerCard from "../../../misc/SpinnerCard";
import GetStartedWithFiles from "../GetStartedWithFiles";
//ACTIONS
import { fetchUserMocks, fetchFiles, checkMigrationDone, migrateAndUpdate } from "./actions";
//UTILS
import { getUserAuthDetails } from "../../../../store/selectors";
// import DataStoreUtils from "../../../../utils/DataStoreUtils";

const FilesLibraryIndexPage = () => {
  //Global State
  const user = useSelector(getUserAuthDetails);

  //Component State
  const [loadingFilesList, setLoadingFileList] = useState(true);
  const [filesList, setFilesList] = useState([]);

  const updateCollection = async () => {
    setLoadingFileList(true);
    setFilesList([]);
    const areFilesMigrated = await checkMigrationDone(user.details.profile.uid);
    let files;
    if (!areFilesMigrated) {
      files = await fetchFiles(user.details.profile.uid).then((result) => {
        for (const key in result) {
          setFilesList((prev) => [...prev, result[key]]);
        }
        return result;
      });
    }
    fetchUserMocks().then((list) => {
      if (files) {
        for (const key in list) {
          setFilesList((prev) => [...prev, ...list[key]]);
        }
      } else {
        let mocksData = [];
        let i = 0;
        for (i = 0; i < list.length; i++) {
          if (list[i].isMock === true) {
            mocksData.push(list[i]);
          }
        }
        setFilesList(mocksData);
      }

      setLoadingFileList(false);
    });
    if (!areFilesMigrated) {
      migrateAndUpdate(user.details.profile.uid);
    }
  };

  const stableUpdateCollection = useCallback(updateCollection, [user]);

  useEffect(() => {
    if (user.loggedIn && user.details.profile) stableUpdateCollection();
    else setLoadingFileList(false);
  }, [user, stableUpdateCollection]);

  return loadingFilesList ? (
    <SpinnerCard customLoadingMessage="Loading Mocks" />
  ) : !isEmpty(filesList) ? (
    <>
      <FilesLibraryTableContainer updateCollection={updateCollection} filesList={filesList} />
    </>
  ) : (
    <GetStartedWithFiles updateCollection={updateCollection} />
  );
};
export default FilesLibraryIndexPage;
