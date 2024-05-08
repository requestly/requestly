import SpinnerColumn from "components/misc/SpinnerColumn";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  redirectToFileMockEditorEditMock,
  redirectToFileMocksList,
  redirectToMockEditorEditMock,
  redirectToMocksList,
} from "utils/RedirectionUtils";
import { toast } from "utils/Toast";
import MockEditor from "./Editor/index";
import { MockEditorDataSchema } from "./types";
import { editorDataToMockDataConverter, generateFinalUrl, mockDataToEditorDataAdapter } from "../utils";
import { defaultCssEditorMock, defaultEditorMock, defaultHtmlEditorMock, defaultJsEditorMock } from "./constants";
import { FileType, MockType, RQMockCollection } from "../types";
import { getMock } from "backend/mocks/getMock";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { updateMock } from "backend/mocks/updateMock";
import { createMock } from "backend/mocks/createMock";
import { trackCreateMockEvent, trackUpdateMockEvent } from "modules/analytics/events/features/mocksV2";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";

interface Props {
  isNew?: boolean;
  mockType?: MockType;
  fileType?: FileType;
  //for mockpicker
  isEditorOpenInModal?: boolean;
  selectOnSave?: (url: string) => void;
  handleCloseEditorFromPicker?: () => void;
}

const MockEditorIndex: React.FC<Props> = ({
  isNew,
  mockType,
  fileType,
  selectOnSave,
  handleCloseEditorFromPicker,
  isEditorOpenInModal = false,
}) => {
  const { mockId } = useParams();
  let [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const teamId = workspace?.id;

  const [mockCollectionData, setMockCollectionData] = useState<RQMockCollection>(null);
  const [mockEditorData, setMockEditorData] = useState<MockEditorDataSchema>(null);
  const [isMockLoading, setIsMockLoading] = useState<boolean>(true);
  const [savingInProgress, setSavingInProgress] = useState<boolean>(false);

  const mockCollectionId = searchParams.get("cid");

  useEffect(() => {
    if (!mockId) {
      return;
    }

    setIsMockLoading(true);
    getMock(uid, mockId, teamId).then((data: any) => {
      if (data) {
        const editorData = mockDataToEditorDataAdapter(data);
        setMockEditorData(editorData);
      } else {
        // TODO: Handle case when No mock is found. Show a message that mock now found
        // Right now the UI will break
        setMockEditorData(null);
      }

      setIsMockLoading(false);
    });

    if (!mockCollectionId) {
      return;
    }

    getMock(uid, mockCollectionId, teamId).then((data: any) => {
      if (data) {
        setMockCollectionData(data);
      }
    });
  }, [mockId, uid, teamId, mockCollectionId]);

  const onMockSave = (data: MockEditorDataSchema) => {
    setSavingInProgress(true);

    const finalMockData = editorDataToMockDataConverter(data);
    if (isNew) {
      return createMock(uid, finalMockData, teamId).then((mockId) => {
        setSavingInProgress(false);
        if (mockId) {
          toast.success("Mock Created Successfully");
          trackCreateMockEvent(mockId, mockType, fileType, "editor");
          if (selectOnSave) {
            const url = generateFinalUrl({
              endpoint: finalMockData.endpoint,
              uid: user?.details?.profile?.uid,
              username: null,
              teamId: teamId,
              password: data?.password,
            });
            selectOnSave(url);
            return;
          }
          if (mockType === MockType.FILE) {
            return redirectToFileMockEditorEditMock(navigate, mockId);
          }
          return redirectToMockEditorEditMock(navigate, mockId);
        }
        toast.error("Mock Create Error");
      });
    }

    updateMock(uid, mockId, finalMockData, teamId).then((success) => {
      setSavingInProgress(false);
      if (success) {
        toast.success("Mock Updated Successfully");
        trackUpdateMockEvent(mockId, mockType, finalMockData?.fileType, finalMockData?.collectionId);
        return setMockEditorData(data);
      }
      toast.error("Mock Update Error");
    });

    return null;
  };

  const handleOnClose = () => {
    if (mockType === MockType.FILE) {
      return redirectToFileMocksList(navigate);
    }

    return redirectToMocksList(navigate);
  };

  if (isNew) {
    let mockData = defaultEditorMock;

    if (mockType === MockType.FILE) {
      switch (fileType) {
        case FileType.CSS: {
          mockData = defaultCssEditorMock;
          break;
        }
        case FileType.HTML: {
          mockData = defaultHtmlEditorMock;
          break;
        }
        default: {
          mockData = defaultJsEditorMock;
        }
      }
    }

    return (
      <MockEditor
        onSave={onMockSave}
        isNew
        mockType={mockType}
        onClose={handleCloseEditorFromPicker ?? handleOnClose}
        mockData={mockData}
        savingInProgress={savingInProgress}
        isEditorOpenInModal={isEditorOpenInModal}
      />
    );
  } else {
    if (isMockLoading) {
      return <SpinnerColumn />;
    }
    if (!mockEditorData) {
      return <h1>Mock Not Found</h1>;
    }

    return (
      <MockEditor
        mockType={mockType}
        onSave={onMockSave}
        mockData={mockEditorData}
        mockCollectionData={mockCollectionData}
        onClose={handleCloseEditorFromPicker ?? handleOnClose}
        savingInProgress={savingInProgress}
        isEditorOpenInModal={isEditorOpenInModal}
      />
    );
  }
};

export default MockEditorIndex;
