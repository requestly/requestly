import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { CloudUploadOutlined, PlusOutlined } from "@ant-design/icons";
import { Badge, ButtonProps } from "antd";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import { ContentListHeader, ContentListHeaderProps } from "componentsV2/ContentList";
import { MockTableHeaderFilter, MockType, RQMockMetadataSchema } from "components/features/mocksV2/types";
import { RQButton } from "lib/design-system/components";
import { SOURCE } from "modules/analytics/events/common/constants";
import { getUserAuthDetails } from "store/selectors";
import { MdOutlineCreateNewFolder } from "@react-icons/all-files/md/MdOutlineCreateNewFolder";
import { MdOutlineStarOutline } from "@react-icons/all-files/md/MdOutlineStarOutline";
import { isRecordMock } from "../MocksTable/utils";

interface Props {
  mockType?: string;
  mocks: RQMockMetadataSchema[];
  handleUploadAction?: () => void;
  handleCreateNew: () => void;
  handleCreateNewCollection?: () => void;
  searchValue?: string;
  setSearchValue?: (s: string) => void;
  filter: MockTableHeaderFilter;
  setFilter: (filter: MockTableHeaderFilter) => void;
}

export const MocksListContentHeader: React.FC<Props> = ({
  mocks,
  mockType,
  filter,
  handleCreateNew,
  handleCreateNewCollection,
  handleUploadAction,
  searchValue,
  setSearchValue = () => {},
  setFilter,
}) => {
  const user = useSelector(getUserAuthDetails);

  const actionbuttonsData = [
    {
      hide: !handleUploadAction,
      type: "text" as ButtonProps["type"],
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
    {
      hide: !handleCreateNewCollection,
      type: "default" as ButtonProps["type"],
      icon: <MdOutlineCreateNewFolder className="anticon" />,
      buttonText: "New Collection",
      onClickHandler: () => user?.details?.isLoggedIn && handleCreateNewCollection?.(),
      isAuthRequired: true,
      authPopover: {
        title: "You need to sign up to create a collection!",
        callback: handleCreateNewCollection,
        source: mockType === MockType.API ? SOURCE.CREATE_API_MOCK : SOURCE.CREATE_FILE_MOCK,
      },
    },
    {
      type: "primary" as ButtonProps["type"],
      icon: <PlusOutlined />,
      buttonText: mockType === MockType.API ? "New Mock" : "New File",
      onClickHandler: () => (user?.loggedIn || mockType === MockType.FILE) && handleCreateNew?.(),
      isAuthRequired: true,
      authPopover: {
        title: "You need to sign up to create API mocks",
        disabled: mockType === MockType.FILE,
        callback: handleCreateNew,
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

  const contentHeaderFilters: ContentListHeaderProps["filters"] = useMemo(
    () => [
      {
        key: "all",
        label: (
          <div className="label">
            All{" "}
            {mocks.length ? (
              <Badge count={mocks.filter((record) => isRecordMock(record)).length} overflowCount={20} />
            ) : null}
          </div>
        ),
        onClick: () => {
          setFilter("all");
        },
      },
      {
        key: "starred",
        label: (
          <div className="label">
            <MdOutlineStarOutline className="icon" />
            Starred
            {mocks.length ? (
              <Badge
                overflowCount={20}
                count={mocks.filter((record) => isRecordMock(record) && record.isFavourite).length}
              />
            ) : null}
          </div>
        ),
        onClick: () => {
          setFilter("starred");
        },
      },
    ],
    [mocks, setFilter]
  );

  return (
    <ContentListHeader
      {...contentListHeaderSearchProps}
      title={getMockTableTitle()}
      actions={contentHeaderActions}
      activeFilter={filter}
      filters={contentHeaderFilters}
    />
  );
};
