import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import moment from "moment";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { Button, Dropdown, MenuProps, Row, Tooltip, Typography, Table, TooltipProps } from "antd";
import { MockType, RQMockCollection, RQMockMetadataSchema, RQMockSchema } from "components/features/mocksV2/types";
import { ContentListTableProps } from "componentsV2/ContentList";
import { EditOutlined } from "@ant-design/icons";
import { UserAvatar } from "componentsV2/UserAvatar";
import { fileTypeColorMap, generateFinalUrl } from "components/features/mocksV2/utils";
import { MdOutlineFolder } from "@react-icons/all-files/md/MdOutlineFolder";
import { MdOutlineStarOutline } from "@react-icons/all-files/md/MdOutlineStarOutline";
import { MdOutlineMoreHoriz } from "@react-icons/all-files/md/MdOutlineMoreHoriz";
import { MdOutlineDriveFileMove } from "@react-icons/all-files/md/MdOutlineDriveFileMove";
import { MdOutlineRemoveCircleOutline } from "@react-icons/all-files/md/MdOutlineRemoveCircleOutline";
import { MdDownload } from "@react-icons/all-files/md/MdDownload";
import { RiInformationLine } from "@react-icons/all-files/ri/RiInformationLine";
import { RiFileCopy2Line } from "@react-icons/all-files/ri/RiFileCopy2Line";
import { RiDeleteBinLine } from "@react-icons/all-files/ri/RiDeleteBinLine";
import { RiEdit2Line } from "@react-icons/all-files/ri/RiEdit2Line";
import { RQButton } from "lib/design-system/components";
import { MocksTableProps } from "../MocksTable";
import { isMock, isCollection } from "../utils";
import { useMocksActionContext } from "features/mocks/contexts/actions";
import { REQUEST_METHOD_COLORS } from "../../../../../../../../../constants/requestMethodColors";
import PATHS from "config/constants/sub/paths";
import { getActiveWorkspaceId, isActiveWorkspaceShared } from "store/slices/workspaces/selectors";
import { useRBAC } from "features/rbac";
import { Conditional } from "components/common/Conditional";
import { copyToClipBoard } from "utils/Misc";

export const useMocksTableColumns = ({
  source,
  mockType,
  handleNameClick,
  handleEditAction,
  handleSelectAction,
  forceRender,
  allRecordsMap,
}: Partial<MocksTableProps> & { allRecordsMap: { [id: string]: RQMockMetadataSchema } }) => {
  // TODO: remove this when tooltip component is added in the design system
  const baseEllipsisTooltipConfig: TooltipProps = {
    overlayClassName: "mocks-table-ellipsis-tooltip",
    placement: "right",
    showArrow: false,
  };

  const user = useSelector(getUserAuthDetails);
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const { pathname } = useLocation();
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("mock_api", "create");
  const isOpenedInRuleEditor = pathname.includes(PATHS.RULE_EDITOR.RELATIVE);

  const {
    createNewMockAction,
    updateCollectionNameAction,
    deleteCollectionAction,
    deleteRecordsAction,
    updateMocksCollectionAction,
    toggleMockStarAction,
    removeMocksFromCollectionAction,
    exportMocksAction,
  } = useMocksActionContext() ?? {};

  const columns: ContentListTableProps<RQMockSchema>["columns"] = [
    Table.SELECTION_COLUMN,
    {
      key: "isFavourite",
      dataIndex: "isFavourite",
      width: 30,
      render: (_: any, record: RQMockSchema) => {
        return isOpenedInRuleEditor ? null : (
          <Button
            type="text"
            onClick={(e) => {
              e.stopPropagation();
              toggleMockStarAction(record, forceRender);
            }}
            className="mock-star-btn"
          >
            <MdOutlineStarOutline className={record.isFavourite ? "starred" : "unstarred"} />
          </Button>
        );
      },
    },
    Table.EXPAND_COLUMN,
    {
      key: "id",
      title: <div className="rq-col-title">Name</div>,
      dataIndex: "name",
      ellipsis: true,
      width: isSharedWorkspaceMode ? (isOpenedInRuleEditor ? 110 : 290) : isOpenedInRuleEditor ? 290 : 360,
      render: (_: any, record: RQMockSchema) => {
        const collectionPath = ((record as unknown) as RQMockCollection)?.path ?? "";

        return isCollection(record) ? (
          <div className="mock-collection-details-container">
            <span className="collection-icon">
              <MdOutlineFolder />
            </span>
            <Typography.Text
              ellipsis={{
                tooltip: {
                  title: record.name,
                  ...baseEllipsisTooltipConfig,
                },
              }}
              className="mock-collection-name"
            >
              {record.name}
            </Typography.Text>

            {collectionPath ? (
              <Typography.Text
                className="collection-path"
                ellipsis={{
                  tooltip: {
                    title: `/${collectionPath}`,
                    ...baseEllipsisTooltipConfig,
                  },
                }}
              >
                {"/" + collectionPath}
              </Typography.Text>
            ) : null}

            {record?.desc ? (
              <Tooltip
                showArrow={false}
                placement="right"
                title={<span className="mock-collection-description">{record?.desc}</span>}
              >
                <span className="mock-description-icon">
                  <RiInformationLine />
                </span>
              </Tooltip>
            ) : null}

            <Conditional condition={isValidPermission && !isOpenedInRuleEditor}>
              <Button
                className="add-mock-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  createNewMockAction(mockType, source, record.id);
                }}
              >
                <span>+</span> <span>Add {mockType === MockType.API ? "mock" : "file"}</span>
              </Button>
            </Conditional>
          </div>
        ) : (
          <div className="mock-name-details-container">
            <div
              className="mock-details-container"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                if (!isCollection(record)) {
                  handleNameClick(record.id, record.isOldMock);
                }
              }}
            >
              <div className="mock-name-container">
                <span
                  className="mock-type"
                  style={{
                    color:
                      record?.type === MockType.API
                        ? REQUEST_METHOD_COLORS[record.method]
                        : fileTypeColorMap[record.fileType],
                  }}
                >
                  {record?.type === MockType.API ? record.method : record.fileType}
                </span>

                <Typography.Text
                  ellipsis={{
                    tooltip: {
                      title: record.name,
                      ...baseEllipsisTooltipConfig,
                    },
                  }}
                  className="primary-cell mock-name"
                >
                  {record.name}
                </Typography.Text>

                {record?.desc ? (
                  <Tooltip
                    showArrow={false}
                    placement="right"
                    title={<span className="mock-description">{record?.desc}</span>}
                  >
                    <span className="mock-description-icon">
                      <RiInformationLine />
                    </span>
                  </Tooltip>
                ) : null}
              </div>
              <div className="mock-endpoint">
                <Typography.Text ellipsis={true}>{"/" + record.endpoint}</Typography.Text>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "createdBy",
      title: <div className="rq-col-title">Created by</div>,
      width: 65,
      className: "text-gray",
      render: (_: any, record: RQMockSchema) => {
        return (
          <div className="mock-table-user-icon">
            <UserAvatar uid={record.createdBy ?? record.lastUpdatedBy} />
          </div>
        );
      },
    },
    {
      key: "lastUpdatedBy",
      title: <div className="rq-col-title">Last Modified</div>,
      width: 110,
      className: "text-gray",
      render: (_: any, record: RQMockSchema) => {
        return (
          <div className="last-modified">
            {moment(record.updatedTs).format("MMM DD, YYYY") + (record.isOldMock ? "." : "")}{" "}
            {isSharedWorkspaceMode && (
              <>
                by <UserAvatar uid={record.lastUpdatedBy ?? record.createdBy} />
              </>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      align: "right",
      width: isSharedWorkspaceMode ? (isOpenedInRuleEditor ? 50 : 90) : 90,
      render: (_: any, record: RQMockSchema) => {
        if (!isValidPermission) {
          return null;
        }

        const collectionPath =
          isMock(record) && record.collectionId
            ? ((allRecordsMap[record.collectionId] as unknown) as RQMockCollection).path
            : "";

        const collectionActions: MenuProps["items"] = [
          {
            key: 0,
            onClick: (info) => {
              info.domEvent?.stopPropagation?.();
              updateCollectionNameAction(mockType, (record as unknown) as RQMockCollection);
            },
            label: (
              <Row>
                <RiEdit2Line /> Edit
              </Row>
            ),
          },
          {
            key: 1,
            disabled: ((record as unknown) as RQMockCollection)?.children?.length === 0,
            onClick: (info) => {
              info.domEvent?.stopPropagation?.();
              exportMocksAction([record]);
            },
            label: (
              <div className="mock-action">
                <MdDownload /> Export
              </div>
            ),
          },
          {
            key: 2,
            danger: true,
            onClick: (info) => {
              info.domEvent?.stopPropagation?.();
              deleteCollectionAction(record);
            },
            label: (
              <Row>
                <RiDeleteBinLine />
                Delete
              </Row>
            ),
          },
        ];

        const mockActions: MenuProps["items"] = [
          {
            key: 0,
            onClick: (info) => {
              info.domEvent?.stopPropagation?.();

              // TODO: Refactor this into separate action and use that
              const copyText = record.isOldMock
                ? record.url
                : generateFinalUrl({
                    endpoint: record.endpoint,
                    uid: user?.details?.profile?.uid,
                    username: user?.details?.username,
                    teamId: activeWorkspaceId,
                    password: record?.password,
                    collectionPath,
                  });

              copyToClipBoard(copyText, "Link copied!");
            },
            label: (
              <div className="mock-action">
                <RiFileCopy2Line />
                Copy URL
              </div>
            ),
          },
          {
            key: 1,
            onClick: (info) => {
              info.domEvent?.stopPropagation?.();
              handleEditAction?.(record.id, record.isOldMock);
            },
            label: (
              <div className="mock-action">
                <EditOutlined />
                Edit
              </div>
            ),
          },
          {
            key: 2,
            onClick: (info) => {
              info.domEvent?.stopPropagation?.();
              updateMocksCollectionAction([record]);
            },
            label: (
              <div className="mock-action">
                <MdOutlineDriveFileMove /> Move
              </div>
            ),
          },
          {
            key: 3,
            disabled: !record.collectionId,
            onClick: (info) => {
              info.domEvent?.stopPropagation?.();
              removeMocksFromCollectionAction([record], forceRender);
            },
            label: (
              <div className="mock-action">
                <MdOutlineRemoveCircleOutline /> Remove from collection
              </div>
            ),
          },
          {
            key: 4,
            onClick: (info) => {
              info.domEvent?.stopPropagation?.();
              exportMocksAction([record]);
            },
            label: (
              <div className="mock-action">
                <MdDownload /> Export
              </div>
            ),
          },
          {
            key: 5,
            danger: true,
            onClick: (info) => {
              info.domEvent?.stopPropagation?.();
              deleteRecordsAction([record]);
            },
            label: (
              <div className="mock-action">
                <RiDeleteBinLine />
                Delete
              </div>
            ),
          },
        ];

        const updatedMockActions = mockActions.filter((action) => (record.collectionId ? true : action.key !== 3));

        return handleSelectAction ? (
          isCollection(record) ? null : (
            <RQButton
              size="small"
              type="primary"
              onClick={(e) => {
                e.stopPropagation();
                let url = "";
                if (record.isOldMock) {
                  url = record.url;
                } else {
                  // Not sending username as it might change
                  url = generateFinalUrl({
                    endpoint: record.endpoint,
                    uid: user?.details?.profile?.uid,
                    username: null,
                    teamId: activeWorkspaceId,
                    password: record?.password,
                    collectionPath,
                  });
                }
                handleSelectAction(url);
              }}
            >
              Select
            </RQButton>
          )
        ) : (
          <Dropdown
            menu={{ items: isCollection(record) ? collectionActions : updatedMockActions }}
            trigger={["click"]}
            overlayClassName="mocks-more-actions-dropdown"
          >
            <Button
              type="text"
              className="more-rule-actions-btn"
              icon={<MdOutlineMoreHoriz />}
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
          </Dropdown>
        );
      },
    },
  ];

  if (!isSharedWorkspaceMode) {
    //remove created by column from mock table in private workspace
    columns.splice(4, 1);
  }

  if (isOpenedInRuleEditor) {
    // remove star mock column in modal view
    columns.splice(2, 1);
  }

  return columns;
};
