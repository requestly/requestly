import { getMocks } from "backend/mocks/getMocks";
import { fetchUserMocks } from "components/features/filesLibrary/FilesLibraryIndexPage/actions";
import SpinnerCard from "components/misc/SpinnerCard";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserAuthDetails } from "store/selectors";
import {
  redirectToFileMockEditorEditMock,
  redirectToFileViewer,
  redirectToMockEditorCreateMock,
  redirectToMockEditorEditMock,
} from "utils/RedirectionUtils";
import MockUploaderModal from "../MockUploaderModal";
import { DeleteMockModal } from "../DeleteMockModal";
import { MockListSource, MockType, RQMockMetadataSchema } from "../types";
import { oldFileMockToNewMockMetadataAdapter, oldMockToNewMockMetadataAdapter } from "../utils/oldMockAdapter";
import MocksTable from "./MocksTable";
import NewFileModal from "../NewFileModal";
import { GettingStartedWithMocks } from "./GettingStartedWithMocks";
import { trackMockUploadWorkflowStarted, trackNewMockButtonClicked } from "modules/analytics/events/features/mocksV2";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import MockPickerIndex from "../MockPickerModal/MockPickerIndex";

interface Props {
  source?: MockListSource;
  type?: MockType;
  mockSelectionCallback?: (url: string) => void;
}

const MockListIndex: React.FC<Props> = ({ source, mockSelectionCallback, type }) => {
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const workspace = useSelector(getCurrentlyActiveWorkspace);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mocksList, setMocksList] = useState<RQMockMetadataSchema[]>([]);
  const [oldMocksList, setOldMocksList] = useState<RQMockMetadataSchema[]>([]);
  const [selectedMock, setSelectedMock] = useState<RQMockMetadataSchema>(null);
  const [deleteModalVisibility, setDeleteModalVisibility] = useState<boolean>(false);

  const [fileModalVisibility, setFileModalVisibility] = useState<boolean>(false);

  const [uploadModalVisibility, setUploadModalVisibility] = useState<boolean>(false);

  // TODO: Remove this after all mocks are migrated to new schema
  const fetchOldMocks = useCallback(() => {
    fetchUserMocks().then((list: any[]) => {
      let mocksData = [];
      let filesData = [];
      let i = 0;
      for (i = 0; i < list.length; i++) {
        if (list[i]?.isMock === true) {
          mocksData.push(list[i]);
        } else {
          filesData.push(list[i]);
        }
      }

      let adaptedData: RQMockMetadataSchema[] = [];
      if (type === MockType.API) {
        // mocksData
        adaptedData = mocksData.map((oldData) => {
          return oldMockToNewMockMetadataAdapter(uid, oldData);
        });
      } else if (type === MockType.FILE) {
        // filesData
        adaptedData = filesData.map((oldData) => {
          return oldFileMockToNewMockMetadataAdapter(uid, oldData);
        });
      } else {
        // mocksData + filesData
        const mocksAdaptedData = mocksData.map((oldData) => {
          return oldMockToNewMockMetadataAdapter(uid, oldData);
        });
        const filesAdaptedData = filesData.map((oldData) => {
          return oldFileMockToNewMockMetadataAdapter(uid, oldData);
        });
        adaptedData = [...mocksAdaptedData, ...filesAdaptedData];
      }
      setOldMocksList([...adaptedData]);
    });
  }, [type, uid]);

  const fetchMocks = useCallback(() => {
    // API|FILE|null
    getMocks(uid, type, workspace?.id)
      .then((data) => {
        setMocksList(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setMocksList([]);
        setIsLoading(false);
      });
  }, [type, uid, workspace]);

  useEffect(() => {
    fetchMocks();
    /* only fetch old mocks in private workspace */
    if (!workspace?.id) {
      fetchOldMocks();
    } else {
      setOldMocksList([]);
    }
  }, [fetchMocks, fetchOldMocks, workspace, setOldMocksList]);

  const handleCreateNewMock = () => {
    if (source === MockListSource.PICKER_MODAL) {
      trackNewMockButtonClicked(type, "picker_modal");
      return redirectToMockEditorCreateMock(navigate, true);
    }
    // TODO: Change this to a constant
    if (type === MockType.FILE) {
      return setFileModalVisibility(true);
    }
    trackNewMockButtonClicked(type, "mock_list");
    return redirectToMockEditorCreateMock(navigate);
  };

  const handleNameClick = (mockId: string, isOldMock: boolean) => {
    handleEditAction(mockId, isOldMock);
  };

  const handleItemSelect = (mockId: string, url: string, isOldMock: boolean) => {
    if (source === MockListSource.PICKER_MODAL) {
      return handleSelectAction(url);
    }

    return handleEditAction(mockId, isOldMock);
  };

  const handleEditAction = (mockId: string, isOldMock: boolean) => {
    if (isOldMock) {
      return redirectToFileViewer(navigate, mockId);
    }
    if (type === MockType.FILE) {
      return redirectToFileMockEditorEditMock(navigate, mockId);
    }
    return redirectToMockEditorEditMock(navigate, mockId);
  };

  const handleSelectAction = (url: string) => {
    mockSelectionCallback(url);
  };

  const handleUploadAction = () => {
    trackMockUploadWorkflowStarted(type);
    setUploadModalVisibility(true);
  };

  const handleDeleteAction = (mock: RQMockMetadataSchema) => {
    setSelectedMock(mock);
    setDeleteModalVisibility(true);
  };

  if (isLoading) {
    return <SpinnerCard customLoadingMessage="Loading Mocks" />;
  } else {
    if (source === MockListSource.PICKER_MODAL) {
      return (
        <>
          <MockPickerIndex
            mocks={[...mocksList, ...oldMocksList]}
            handleUploadAction={handleUploadAction}
            handleItemSelect={handleItemSelect}
            handleSelectAction={handleSelectAction}
            handleNameClick={handleNameClick}
          />
          <MockUploaderModal
            mockType={type}
            visible={uploadModalVisibility}
            toggleModalVisibility={(visible) => setUploadModalVisibility(visible)}
            selectMockOnUpload={handleSelectAction}
          />
        </>
      );
    } else if (mocksList.length + oldMocksList.length === 0) {
      return (
        <>
          <GettingStartedWithMocks
            mockType={type}
            handleCreateNew={handleCreateNewMock}
            handleUploadAction={handleUploadAction}
          />
          <NewFileModal
            visible={fileModalVisibility}
            toggleModalVisiblity={(visible) => setFileModalVisibility(visible)}
          />
          <MockUploaderModal
            mockType={type}
            visible={uploadModalVisibility}
            toggleModalVisibility={(visible) => setUploadModalVisibility(visible)}
          />
        </>
      );
    } else {
      return (
        <>
          <MocksTable
            handleCreateNew={handleCreateNewMock}
            mocks={[...mocksList, ...oldMocksList]}
            mockType={type}
            handleItemSelect={handleItemSelect}
            handleNameClick={handleNameClick}
            handleEditAction={handleEditAction}
            handleUploadAction={handleUploadAction}
            handleDeleteAction={handleDeleteAction}
          />
          <NewFileModal
            visible={fileModalVisibility}
            toggleModalVisiblity={(visible) => setFileModalVisibility(visible)}
          />
          <MockUploaderModal
            mockType={type}
            visible={uploadModalVisibility}
            toggleModalVisibility={(visible) => setUploadModalVisibility(visible)}
          />
          <DeleteMockModal
            visible={deleteModalVisibility}
            toggleDeleteModalVisibility={(visible: boolean) => setDeleteModalVisibility(visible)}
            mock={selectedMock}
            callbackOnSuccess={selectedMock?.isOldMock ? fetchOldMocks : fetchMocks}
          />
        </>
      );
    }
  }
};

export default MockListIndex;
