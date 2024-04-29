import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { CloudUploadOutlined, PlusOutlined } from "@ant-design/icons";
import { Badge, ButtonProps } from "antd";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import { ContentListHeader, ContentListHeaderProps } from "componentsV2/ContentList";
import {
  MockType,
  MockTableHeaderFilter,
  RQMockMetadataSchema,
  MockListSource,
} from "components/features/mocksV2/types";
import { RQButton } from "lib/design-system/components";
import { SOURCE } from "modules/analytics/events/common/constants";
import { getUserAuthDetails } from "store/selectors";
import { MdOutlineCreateNewFolder } from "@react-icons/all-files/md/MdOutlineCreateNewFolder";
import { MdOutlineStarOutline } from "@react-icons/all-files/md/MdOutlineStarOutline";
import { isRecordMock } from "../MocksTable/utils";
import { useMocksActionContext } from "features/mocks/contexts/actions";
import { useLocation } from "react-router-dom";
import PATHS from "config/constants/sub/paths";

interface Props {
  source?: MockListSource;
  mockType?: MockType;
  allrecords?: RQMockMetadataSchema[];
  mocks?: RQMockMetadataSchema[];
  searchValue?: string;
  setSearchValue?: (s: string) => void;
  filter?: MockTableHeaderFilter;
  setFilter?: (filter: MockTableHeaderFilter) => void;
}

export const MocksListContentHeader: React.FC<Props> = ({
  source,
  mocks,
  allrecords,
  mockType,
  filter,
  searchValue,
  setSearchValue = () => {},
  setFilter,
}) => {
  const user = useSelector(getUserAuthDetails);
  const { pathname } = useLocation();
  const { createNewCollectionAction, mockUploaderModalAction, createNewMock } = useMocksActionContext() ?? {};
  const isRulesEditor = pathname.includes(PATHS.RULE_EDITOR.RELATIVE);

  const actionbuttonsData = [
    {
      hide: isRulesEditor,
      type: "text" as ButtonProps["type"],
      icon: <CloudUploadOutlined />,
      buttonText: `Upload ${mockType === MockType.FILE ? "File" : "JSON"}`,
      onClickHandler: () => user?.details?.isLoggedIn && mockUploaderModalAction(mockType),
      isAuthRequired: true,
      authPopover: {
        title: "You need to sign up to upload mocks",
        callback: () => mockUploaderModalAction(mockType),
        source: mockType === MockType.API ? SOURCE.CREATE_API_MOCK : SOURCE.CREATE_FILE_MOCK,
      },
    },
    {
      hide: isRulesEditor,
      type: "default" as ButtonProps["type"],
      icon: <MdOutlineCreateNewFolder className="anticon" />,
      buttonText: "New Collection",
      onClickHandler: () => user?.details?.isLoggedIn && createNewCollectionAction(mockType),
      isAuthRequired: true,
      authPopover: {
        title: "You need to sign up to create a collection!",
        callback: () => createNewCollectionAction(mockType),
        source: mockType === MockType.API ? SOURCE.CREATE_API_MOCK : SOURCE.CREATE_FILE_MOCK,
      },
    },
    {
      type: "primary" as ButtonProps["type"],
      icon: <PlusOutlined />,
      buttonText: mockType ? (mockType === MockType.API ? "New Mock" : "New File") : "New Mock",
      onClickHandler: () => (user?.loggedIn || mockType === MockType.FILE) && createNewMock?.(mockType, source),
      isAuthRequired: true,
      authPopover: {
        title: "You need to sign up to create API mocks",
        disabled: mockType === MockType.FILE,
        callback: () => createNewMock?.(mockType, source),
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
            {allrecords?.length ? (
              <Badge count={allrecords?.filter((record) => isRecordMock(record)).length} overflowCount={20} />
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
            {mocks?.length ? (
              <Badge
                overflowCount={20}
                count={mocks?.filter((record) => isRecordMock(record) && record.isFavourite).length}
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

  const contentListHeaderSearchProps = mockType
    ? {
        activeFilter: filter,
        searchValue: searchValue,
        setSearchValue: setSearchValue,
        title: getMockTableTitle(),
        filters: contentHeaderFilters,
      }
    : {};

  return <ContentListHeader {...contentListHeaderSearchProps} actions={contentHeaderActions} />;
};
