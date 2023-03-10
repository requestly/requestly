import SpinnerColumn from "components/misc/SpinnerColumn";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  redirectToFileMockEditorEditMock,
  redirectToFileMocksList,
  redirectToMockEditorEditMock,
  redirectToMocksList,
} from "utils/RedirectionUtils";
import { toast } from "utils/Toast";
import MockEditor from "./Editor/index";
import { MockEditorDataSchema } from "./types";
import {
  editorDataToMockDataConverter,
  mockDataToEditorDataAdapter,
} from "../utils";
import {
  defaultCssEditorMock,
  defaultEditorMock,
  defaultHtmlEditorMock,
  defaultJsEditorMock,
} from "./constants";
import { FileType, MockType } from "../types";
import { getMock } from "backend/mocks/getMock";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { updateMock } from "backend/mocks/updateMock";
import { createMock } from "backend/mocks/createMock";
import {
  trackCreateMockEvent,
  trackMockEditorClosed,
  trackUpdateMockEvent,
} from "modules/analytics/events/features/mocksV2";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";

interface Props {
  isNew?: boolean;
  mockId?: string;
  mockType?: MockType;
  fileType?: FileType;
}

const MockEditorIndex: React.FC<Props> = ({
  isNew,
  mockId,
  mockType,
  fileType,
}) => {
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const teamId = workspace?.id;

  const [mockEditorData, setMockEditorData] = useState<MockEditorDataSchema>(
    null
  );
  const [isMockLoading, setIsMockLoading] = useState<boolean>(true);
  const [savingInProgress, setSavingInProgress] = useState<boolean>(false);

  useEffect(() => {
    if (mockId) {
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
    }
  }, [mockId, uid, teamId]);

  const onMockSave = (data: MockEditorDataSchema) => {
    setSavingInProgress(true);

    const finalMockData = editorDataToMockDataConverter(data);
    if (isNew) {
      return createMock(uid, finalMockData, teamId).then((mockId) => {
        setSavingInProgress(false);
        if (mockId) {
          toast.success("Mock Created Successfully");
          trackCreateMockEvent(mockId, mockType, fileType, "editor");
          if (mockType === MockType.FILE) {
            return redirectToFileMockEditorEditMock(navigate, mockId);
          }
          return redirectToMockEditorEditMock(navigate, mockId);
        }
        console.log("herererer");
        toast.error("Mock Create Error");
      });
    }

    updateMock(uid, mockId, finalMockData, teamId).then((success) => {
      setSavingInProgress(false);
      if (success) {
        toast.success("Mock Updated Successfully");
        trackUpdateMockEvent(mockId, mockType, finalMockData?.fileType);
        return setMockEditorData(data);
      }
      toast.error("Mock Update Error");
    });

    return null;
  };

  const handleOnClose = () => {
    // TODO: Create a constant for this
    trackMockEditorClosed(mockType, "cancel_button");
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
        onClose={handleOnClose}
        mockData={mockData}
        savingInProgress={savingInProgress}
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
        onClose={handleOnClose}
        savingInProgress={savingInProgress}
      />
    );
  }
};

export default MockEditorIndex;
