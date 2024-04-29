import React, { useEffect, useState } from "react";
import NewFileTypeSelector from "../NewFileModalWrapper/NewFileModal/NewFileTypeSelector";
import { RQButton } from "lib/design-system/components";
import { trackNewMockButtonClicked } from "modules/analytics/events/features/mocksV2";
import { SOURCE } from "modules/analytics/events/common/constants";
import { AiOutlineCloudUpload } from "@react-icons/all-files/ai/AiOutlineCloudUpload";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import { Space, Typography } from "antd";
import { getUserAuthDetails } from "store/selectors";
import { useSelector } from "react-redux";
import { FileType, MockType, RQMockMetadataSchema } from "components/features/mocksV2/types";
import { MocksListContentHeader, MocksTable } from "features/mocks/screens/mocksList/components/MocksList/components";
import { MockEditorDataSchema } from "components/features/mocksV2/MockEditorIndex/types";
import {
  defaultCssEditorMock,
  defaultEditorMock,
  defaultHtmlEditorMock,
  defaultJsEditorMock,
} from "components/features/mocksV2/MockEditorIndex/constants";
import MockEditorIndex from "components/features/mocksV2/MockEditorIndex";
import { useMocksActionContext } from "features/mocks/contexts/actions";

interface Props {
  mocks: RQMockMetadataSchema[];
  mockType?: MockType;
  handleItemSelect: (mockId: string, url: string, isOldMock: boolean) => void;
  handleNameClick: (mockId: string, isOldMock: boolean) => void;

  // actions
  handleSelectAction?: (url: string) => void;
}

const MockPickerIndex: React.FC<Props> = ({
  mocks,
  mockType,
  handleItemSelect,
  handleSelectAction,
  handleNameClick,
}) => {
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [isNewMock, setIsNewMock] = useState<boolean>(false);
  const [selectedMockData, setSelectedMockData] = useState<MockEditorDataSchema>(null);
  const [showFileTypeSelector, setShowFileTypeSelector] = useState<boolean>(false);
  const [showCreateMockState, setShowCreateMockState] = useState<boolean>(false);
  const { mockUploaderModalAction } = useMocksActionContext() ?? {};

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
      <>
        <MocksListContentHeader />

        <MocksTable
          mocks={mocks}
          handleItemSelect={handleItemSelect}
          handleNameClick={handleNameClick}
          handleSelectAction={handleSelectAction}
        />
      </>
    );
  } else if (showCreateMockState) {
    return (
      <div className="empty-mocks-picker-container">
        <Typography.Title level={4}>{mocks?.length ? "Create mock" : "No mocks created yet"}</Typography.Title>
        <Typography.Text type="secondary" className="mt-8">
          Create mocks APIs or files with different status codes, delay, response headers or body.
        </Typography.Text>
        <Space className="mt-8">
          <AuthConfirmationPopover
            title="You need to sign up to upload mocks"
            callback={() => mockUploaderModalAction(mockType)}
            source={"upload_mock"}
          >
            <RQButton
              type="default"
              icon={<AiOutlineCloudUpload />}
              className="upload-btn"
              onClick={() => user?.loggedIn && mockUploaderModalAction(mockType)}
            >
              <span> Upload file/JSON</span>
            </RQButton>
          </AuthConfirmationPopover>
          <AuthConfirmationPopover
            title="You need to sign up to create file mocks"
            callback={handleCreateNewFile}
            source={SOURCE.CREATE_FILE_MOCK}
          >
            <RQButton type="default" className="getting-started-btn" onClick={user?.loggedIn && handleCreateNewFile}>
              Create new mock file
            </RQButton>
          </AuthConfirmationPopover>
          <AuthConfirmationPopover
            title="You need to sign up to create API mocks"
            callback={handleCreateNewMock}
            source={SOURCE.CREATE_API_MOCK}
          >
            <RQButton type="primary" className="getting-started-btn" onClick={user?.loggedIn && handleCreateNewMock}>
              Create new mock API
            </RQButton>
          </AuthConfirmationPopover>
        </Space>
      </div>
    );
  }
};

export default MockPickerIndex;
