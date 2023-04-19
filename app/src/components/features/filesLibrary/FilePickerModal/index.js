import React, { useCallback, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import isEmpty from "is-empty";
//UTILS
import { getUserAuthDetails } from "../../../../store/selectors";
//ACTIONS
import { fetchFiles, fetchUserMocks } from "../FilesLibraryIndexPage/actions";
//SUB COMPONENTS
import SpinnerCard from "../../../misc/SpinnerCard";
import FilesLibraryTable from "../../filesLibrary/FilesLibraryTable";
//CONSTANTS
import APP_CONSTANTS from "../../../../config/constants";
import { Link } from "react-router-dom";
import Jumbotron from "components/bootstrap-legacy/jumbotron";

const FilePickerModal = ({ isOpen, toggle: toggleFilePickerModal, callback }) => {
  //Global State
  const user = useSelector(getUserAuthDetails);

  //Component State
  const [loadingFilesList, setLoadingFileList] = useState(true);
  const [filesList, setFilesList] = useState({});
  const [showNewChangesInfo, setShowNewChangesInfo] = useState(false);

  const renderNotLoggedInError = () => {
    return (
      <Jumbotron style={{ background: "transparent" }} className="text-center">
        <p>You need to login first!</p>
      </Jumbotron>
    );
  };

  const renderNewChangesInfo = () => {
    if (!showNewChangesInfo) return null;
    return (
      <>
        <br />
        <p>Please close and reopen this for any changes to reflect.</p>
      </>
    );
  };

  const renderNoFilesFound = () => {
    return (
      <Jumbotron style={{ background: "transparent" }} className="text-center">
        <p>
          You haven't created any mock yet.{" "}
          <Link
            rel="noopener noreferrer"
            target="_blank"
            to={APP_CONSTANTS.PATHS.FILES.ABSOLUTE}
            onClick={() => {
              setShowNewChangesInfo(true);
              return true;
            }}
          >
            Create Now?
          </Link>
        </p>
        {renderNewChangesInfo()}
      </Jumbotron>
    );
  };

  const renderListOfFiles = () => {
    return (
      <FilesLibraryTable
        filesList={filesList}
        mode={APP_CONSTANTS.FILES_TABLE_CONSTANTS.MODES.FILE_PICKER}
        callback={callback}
      />
    );
  };

  const renderMainContent = () => {
    return loadingFilesList ? (
      <SpinnerCard customLoadingMessage="Loading Files" />
    ) : !isEmpty(filesList) ? (
      renderListOfFiles()
    ) : (
      renderNoFilesFound()
    );
  };

  const updateCollection = async () => {
    let fetchedFilesObj = await fetchFiles(user.details.profile.uid);
    if (!fetchedFilesObj) {
      fetchedFilesObj = {};
    }
    fetchUserMocks().then((mocksList) => {
      mocksList.forEach((mockServerObject) => {
        if (mockServerObject.isMock) {
          // Then use the short URL
          if (!isEmpty(mockServerObject?.path)) {
            mockServerObject.shortUrl = `https://${user.details.profile.uid.toLowerCase()}.requestly.me/${
              mockServerObject.path
            }`;
          } else {
            mockServerObject.shortUrl = `https://requestly.me/${mockServerObject.mockID}`;
          }
        }

        // Handle case when duplicate/migrated files gets returned.
        const key = mockServerObject.rId ? mockServerObject.rId : mockServerObject.mockID;
        fetchedFilesObj[key] = mockServerObject;
      });
      setFilesList(fetchedFilesObj);
      setLoadingFileList(false);
    });
  };

  const stableUpdateCollection = useCallback(updateCollection, [user]);
  const titleBar = (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      My Files{" "}
      <Button
        type="primary"
        href={APP_CONSTANTS.PATHS.FILES.ABSOLUTE}
        style={{ marginRight: "2rem" }}
        rel="noopener noreferrer"
        target="_blank"
        onClick={() => {
          setShowNewChangesInfo(true);
          return true;
        }}
      >
        <PlusOutlined />
        <span>New Mock</span>{" "}
      </Button>{" "}
    </div>
  );
  useEffect(() => {
    if (user.loggedIn && user.details.profile) stableUpdateCollection();
  }, [user, stableUpdateCollection]);

  return (
    <Modal visible={isOpen} onCancel={toggleFilePickerModal} footer={null} title={titleBar} width="80%">
      <div className="modal-body ">{user.loggedIn ? renderMainContent() : renderNotLoggedInError()}</div>
    </Modal>
  );
};

export default FilePickerModal;
