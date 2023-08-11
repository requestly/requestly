import React, { useEffect, useState } from "react";
import MocksTable from "../MockList/MocksTable";
import { MockEditorDataSchema } from "../MockEditorIndex/types";
import MockEditorIndex from "../MockEditorIndex/MockEditorIndex";
import NewFileTypeSelector from "../NewFileModal/NewFileTypeSelector";
import { FileType, MockType, RQMockMetadataSchema } from "../types";
import { RQButton } from "lib/design-system/components";
import { trackNewMockButtonClicked } from "modules/analytics/events/features/mocksV2";
import {
  defaultCssEditorMock,
  defaultEditorMock,
  defaultHtmlEditorMock,
  defaultJsEditorMock,
} from "../MockEditorIndex/constants";
import { AUTH } from "modules/analytics/events/common/constants";
import { AiOutlineCloudUpload } from "@react-icons/all-files/ai/AiOutlineCloudUpload";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import { Row, Space, Typography } from "antd";
import { getUserAuthDetails } from "store/selectors";
import { useSelector } from "react-redux";

interface Props {
  mocks: RQMockMetadataSchema[];
  mockType?: string;
  handleItemSelect: (mockId: string, url: string, isOldMock: boolean) => void;
  handleNameClick: (mockId: string, isOldMock: boolean) => void;

  // actions
  handleSelectAction?: (url: string) => void;
  handleUploadAction?: () => void;
}

const MockPickerIndex: React.FC<Props> = ({
  mocks,
  handleItemSelect,
  handleSelectAction,
  handleUploadAction,
  handleNameClick,
}) => {
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [isNewMock, setIsNewMock] = useState<boolean>(false);
  const [selectedMockData, setSelectedMockData] = useState<MockEditorDataSchema>(null);
  const [showFileTypeSelector, setShowFileTypeSelector] = useState<boolean>(false);
  const [showCreateMockState, setShowCreateMockState] = useState<boolean>(false);

  const user = useSelector(getUserAuthDetails);

  const handleCreateNewMock = () => {
    trackNewMockButtonClicked(MockType.API, "picker_modal");
    setSelectedMockData(defaultEditorMock);
    setIsNewMock(true);
    setShowEditor(true);
  };

  const handleCreateNewFile = () => {
    setShowFileTypeSelector(true);
  };

  const handleTypeSelection = (type: string) => {
    switch (type) {
      case FileType.CSS:
        setSelectedMockData(defaultCssEditorMock);
        break;
      case FileType.HTML:
        setSelectedMockData(defaultHtmlEditorMock);
        break;
      default:
        setSelectedMockData(defaultJsEditorMock);
    }
    setIsNewMock(true);
    setShowFileTypeSelector(false);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setIsNewMock(false);
    setSelectedMockData(null);
  };

  useEffect(() => {
    setShowCreateMockState(!mocks?.length);
  }, [mocks?.length]);

  if (showFileTypeSelector) {
    return <NewFileTypeSelector handleTypeSelection={handleTypeSelection} />;
  }

  if (showEditor) {
    return (
      <MockEditorIndex
        isNew={isNewMock}
        mockType={selectedMockData?.type}
        fileType={selectedMockData?.fileType}
        selectOnSave={handleSelectAction}
        handleCloseEditorFromPicker={handleCloseEditor}
      />
    );
  }

  if (mocks.length && !showCreateMockState) {
    return (
      <MocksTable
        mocks={mocks}
        handleItemSelect={handleItemSelect}
        handleCreateNew={() => setShowCreateMockState(true)}
        handleNameClick={handleNameClick}
        handleSelectAction={handleSelectAction}
      />
    );
  } else if (showCreateMockState) {
    return (
      <Row className="empty-mocks-picker-container">
        <div className="text-center">
          <Typography.Title level={4}>{mocks?.length ? "Create mock" : "No mocks created yet"}</Typography.Title>
          <Typography.Text type="secondary" className="mt-8">
            Create mocks APIs or files with different status codes, delay, response headers or body.
          </Typography.Text>
          <Space className="mt-8">
            <AuthConfirmationPopover
              title="You need to sign up to upload mocks"
              callback={handleUploadAction}
              source={"upload_mock"}
            >
              <RQButton
                type="default"
                icon={<AiOutlineCloudUpload />}
                className="upload-btn"
                onClick={() => user?.loggedIn && handleUploadAction()}
              >
                <span> Upload file/JSON</span>
              </RQButton>
            </AuthConfirmationPopover>
            <AuthConfirmationPopover
              title="You need to sign up to create file mocks"
              callback={handleCreateNewFile}
              source={AUTH.SOURCE.CREATE_FILE_MOCK}
            >
              <RQButton type="default" className="getting-started-btn" onClick={user?.loggedIn && handleCreateNewFile}>
                Create new mock file
              </RQButton>
            </AuthConfirmationPopover>
            <AuthConfirmationPopover
              title="You need to sign up to create API mocks"
              callback={handleCreateNewMock}
              source={AUTH.SOURCE.CREATE_API_MOCK}
            >
              <RQButton type="primary" className="getting-started-btn" onClick={user?.loggedIn && handleCreateNewMock}>
                Create new mock API
              </RQButton>
            </AuthConfirmationPopover>
          </Space>
        </div>
      </Row>
    );
  }
};

export default MockPickerIndex;
