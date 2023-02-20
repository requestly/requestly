import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Row, Col } from "antd";
import { toast } from "utils/Toast.js";
//SUB COMPONENTS
import SpinnerColumn from "../../../misc/SpinnerColumn";
import FileEditor from "../FileEditor";
//ACTIONS
import { getFileIdFromURL, getMockDetailsFromDatabase } from "./actions";
import { getFunctions, httpsCallable } from "firebase/functions";
import { fetchUserMocks } from "../FilesLibraryIndexPage/actions";
//UTILS
import { getUserAuthDetails } from "../../../../store/selectors";
import * as FilesService from "../../../../utils/files/FilesService";
import {
  redirectTo403,
  redirectTo404,
  redirectToFileViewer,
} from "../../../../utils/RedirectionUtils";
import { trackRQLastActivity } from "../../../../utils/AnalyticsUtils";
import {
  trackCreateMockEvent,
  trackUpdateMockEvent,
} from "modules/analytics/events/features/mockServer/mocks";
import {
  trackCreateFileEvent,
  trackUpdateFileEvent,
} from "modules/analytics/events/features/mockServer/files";
import TeamFeatureComingSoon from "components/landing/TeamFeatureComingSoon";
import { getIsWorkspaceMode } from "store/features/teams/selectors";

const FileViewerIndexPage = () => {
  const navigate = useNavigate();
  //const mockURL = window.location.pathname.includes("API") ? true : false;
  //Global State
  const user = useSelector(getUserAuthDetails);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);

  //Component State
  const [isFileContentLoading, setIsFileContentLoading] = useState(true);
  const [isFileSaving, setIsFileSaving] = useState(false);
  const [fileDetails, setFileDetails] = useState(false);
  const [createNewFile, setCreateNewFile] = useState(false);
  const [currentFilesCount, setCurrentFilesCount] = useState(0);

  const fileId = getFileIdFromURL(window.location.pathname);
  const fetchData = async (uid) => {
    if (fileId === "create") {
      setCreateNewFile(true);
      setIsFileContentLoading(false);
    } else {
      await getMockDetailsFromDatabase(fileId).then((mockData) => {
        if (mockData.success) {
          setFileDetails(mockData.data);
          setIsFileContentLoading(false);
        } else if (mockData.unauthorized) {
          redirectTo403(navigate);
        } else {
          redirectTo404(navigate);
        }
      });
    }
    fetchUserMocks().then((result) => {
      if (result) setCurrentFilesCount(result.length);
    });
  };
  const stableFetchData = useCallback(fetchData, [fileId, navigate]);

  const saveFile = (fileDataReceived) => {
    const {
      name,
      contentType,
      description,
      body,
      headers,
      statusCode,
      isMock,
      method,
      path,
      delay,
      mockVersion,
    } = fileDataReceived;

    setIsFileSaving(true);
    // Ignore name type in updating data

    // update new data
    let fileDetailsCopy = { ...fileDetails };
    fileDetailsCopy.description = description;
    const headersFormatted = headers;

    const fileData = {
      name,
      contentType,
      description,
      headers: JSON.parse(headersFormatted), // TODO: fix bug: not always a object is sent to backend. Currently the case is temporarily handled in editMock cloud function
      statusCode: Number(statusCode),
      body,
      isMock,
      method,
      path,
      delay,
      mockVersion,
    };
    if (!isMock) {
      FilesService.updateFile(fileDetails.filePath, body, fileDetailsCopy).then(
        (result) => {
          setIsFileSaving(false);
          if (result.success) {
            toast.info("File Edited Successfully");
            trackRQLastActivity("file_edited");
            trackUpdateFileEvent();
            redirectToFileViewer(navigate, fileId);
          } else {
            toast.error("Unable to edit file");
          }
        }
      );
    } else {
      const functions = getFunctions();
      const editMock = httpsCallable(functions, "editMock");
      editMock({ ...fileData, id: fileId }).then((res) => {
        setIsFileSaving(false);
        if (res.data.success) {
          toast.info("Mock Edited Successfully");
          trackRQLastActivity("mock_updated");
          trackUpdateMockEvent();
          redirectToFileViewer(navigate, fileId);
        } else {
          toast.error(res.data.msg || "Unable to edit mock");
        }
      });
    }
  };
  // Save file for creating new files
  const saveNewFile = (fileDataReceived) => {
    const {
      name,
      contentType,
      description,
      body,
      headers,
      statusCode,
      extension,
      isMock,
      method,
      path,
      delay,
      mockVersion,
    } = fileDataReceived;

    setIsFileSaving(true);
    const headersFormatted = headers;

    const fullName = name + extension;
    const fileData = {
      name: isMock ? name : fullName,
      contentType,
      description,
      headers: JSON.parse(headersFormatted),
      statusCode: Number(statusCode),
      body,
      isMock,
      method,
      path,
      delay,
      mockVersion,
    };

    if (!isMock) {
      FilesService.createFile(fileData, body).then((result) => {
        setIsFileSaving(false);
        if (result.success) {
          toast.info("File Created Successfully");
          trackRQLastActivity("file_created");
          trackCreateFileEvent();
          redirectToFileViewer(navigate, result.data.id, result.data.shortUrl);
        } else {
          toast.error("Unable to create file");
        }
      });
    } else {
      const functions = getFunctions();
      const addMock = httpsCallable(functions, "addMock");
      const pathFormat = /[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/;
      if (path === "") {
        toast.warn("Please define a Public URL");
        setIsFileSaving(false);
        return;
      }
      if (pathFormat.test(path)) {
        toast.warn("Endpoint should not contain any special character");
        setIsFileSaving(false);
        return;
      }
      if (!method) {
        fileData.method = "GET";
      }
      addMock(fileData).then((res) => {
        setIsFileSaving(false);
        if (res.data && !res.data.err) {
          toast.info("Mock Created Successfully");
          trackRQLastActivity("mock_created");
          trackCreateMockEvent();
          redirectToFileViewer(navigate, res.data);
        } else {
          toast.error(res.data.err || "Unable to create Mock");
        }
      });
    }
  };

  useEffect(() => {
    if (
      user.loggedIn &&
      user.details &&
      user.details.profile &&
      user.details.profile.uid
    )
      stableFetchData(user.details.profile.uid);
  }, [stableFetchData, user]);

  useEffect(() => {
    if (fileDetails) {
      setCreateNewFile(false);
    }
  }, [fileDetails]);

  if (isWorkspaceMode) return <TeamFeatureComingSoon title="File server" />;

  return (
    <Row>
      <Col span={24}>
        {isFileContentLoading ? (
          <SpinnerColumn />
        ) : createNewFile ? (
          <FileEditor
            newFile={true}
            fileDetails={fileDetails}
            saveFile={saveNewFile}
            saving={isFileSaving}
            currentFilesCount={currentFilesCount}
          />
        ) : (
          <FileEditor
            fileDetails={fileDetails}
            saveFile={saveFile}
            saving={isFileSaving}
            currentFilesCount={currentFilesCount}
          />
        )}
      </Col>
    </Row>
  );
};

export default FileViewerIndexPage;
