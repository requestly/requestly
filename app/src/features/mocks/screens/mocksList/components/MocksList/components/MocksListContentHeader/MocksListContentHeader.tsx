import React from "react";
import { useSelector } from "react-redux";
import { CloudUploadOutlined, PlusOutlined } from "@ant-design/icons";
import { ButtonProps } from "antd";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import { ContentListHeader } from "componentsV2/ContentList";
import { MockType } from "features/mocks/types";
import { RQButton } from "lib/design-system/components";
import { SOURCE } from "modules/analytics/events/common/constants";
import { getUserAuthDetails } from "store/selectors";

interface Props {
  mockType?: string;
  handleUploadAction?: () => void;
  handleCreateNew: () => void;
  searchValue: string;
  setSearchValue: (s: string) => void;
}

export const MocksListContentHeader: React.FC<Props> = ({
  mockType,
  handleCreateNew,
  handleUploadAction,
  searchValue,
  setSearchValue,
}) => {
  const user = useSelector(getUserAuthDetails);

  const actionbuttonsData = [
    {
      type: "primary" as ButtonProps["type"],
      icon: <PlusOutlined />,
      buttonText: "Create New",
      onClickHandler: () => (user?.loggedIn || mockType === MockType.FILE) && handleCreateNew?.(),
      isAuthRequired: true,
      authPopover: {
        title: "You need to sign up to create API mocks",
        disabled: mockType === MockType.FILE,
        callback: handleCreateNew,
        source: SOURCE.CREATE_API_MOCK,
      },
    },
    {
      hide: !handleUploadAction,
      type: "default" as ButtonProps["type"],
      icon: <CloudUploadOutlined />,
      buttonText: `Upload ${mockType === MockType.FILE ? "File" : "JSON"}`,
      onClickHandler: () => user?.details?.isLoggedIn && handleUploadAction(),
      isAuthRequired: true,
      authPopover: {
        title: "You need to sign up to upload mocks",
        callback: handleUploadAction,
        source: mockType === MockType.API ? SOURCE.CREATE_API_MOCK : SOURCE.CREATE_FILE_MOCK,
      },
    },
  ];

  const contentHeaderActions = actionbuttonsData
    .filter(({ hide = false }) => !hide)
    .map(({ type, icon, buttonText, onClickHandler, isAuthRequired, authPopover }) => {
      return !isAuthRequired ? (
        // @ts-ignore
        <RQButton type={type} onClick={onClickHandler} icon={icon}>
          {buttonText}
        </RQButton>
      ) : (
        <AuthConfirmationPopover
          title={authPopover.title}
          disabled={authPopover.disabled}
          callback={authPopover.callback}
          source={authPopover.source}
        >
          <RQButton
            // @ts-ignore
            type={type}
            onClick={onClickHandler}
            icon={icon}
          >
            {buttonText}
          </RQButton>
        </AuthConfirmationPopover>
      );
    });

  const contentListHeaderSearchProps = mockType ? { searchValue: searchValue, setSearchValue: setSearchValue } : {};

  const getMockTableTitle = () => {
    switch (mockType) {
      case MockType.API:
        return "Mocks";
      case MockType.FILE:
        return "Files";
      default:
        return "Mocks";
    }
  };

  return (
    <ContentListHeader {...contentListHeaderSearchProps} title={getMockTableTitle()} actions={contentHeaderActions} />
  );
};
