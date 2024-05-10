import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import moment from "moment";
import { getUserAuthDetails } from "store/selectors";
import { Button, Dropdown, MenuProps, Row, Tooltip, Typography, message, Table } from "antd";
import { MockType, RQMockSchema } from "components/features/mocksV2/types";
import { ContentListTableProps } from "componentsV2/ContentList";
import { getCurrentlyActiveWorkspace, getIsWorkspaceMode } from "store/features/teams/selectors";
import { CalendarOutlined, EditOutlined } from "@ant-design/icons";
import { UserIcon } from "components/common/UserIcon";
import { fileTypeColorMap, generateFinalUrl } from "components/features/mocksV2/utils";
import { HiOutlineBookOpen } from "@react-icons/all-files/hi/HiOutlineBookOpen";
import { MdOutlineFolder } from "@react-icons/all-files/md/MdOutlineFolder";
import { MdOutlineStarOutline } from "@react-icons/all-files/md/MdOutlineStarOutline";
import { MdOutlineMoreHoriz } from "@react-icons/all-files/md/MdOutlineMoreHoriz";
import { MdOutlineDriveFileMove } from "@react-icons/all-files/md/MdOutlineDriveFileMove";
import { MdOutlineRemoveCircleOutline } from "@react-icons/all-files/md/MdOutlineRemoveCircleOutline";
import { RiInformationLine } from "@react-icons/all-files/ri/RiInformationLine";
import { RiFileCopy2Line } from "@react-icons/all-files/ri/RiFileCopy2Line";
import { RiDeleteBinLine } from "@react-icons/all-files/ri/RiDeleteBinLine";
import { RiEdit2Line } from "@react-icons/all-files/ri/RiEdit2Line";
import { RQButton } from "lib/design-system/components";
import { MocksTableProps } from "../MocksTable";
import { isRecordMockCollection } from "../utils";
import { useMocksActionContext } from "features/mocks/contexts/actions";
import { REQUEST_METHOD_COLORS } from "../../../../../../../../../constants/requestMethodColors";
import PATHS from "config/constants/sub/paths";

// TODO: move all actions in a hook and use that
export const useMocksTableColumns = ({
  mockType,
  handleNameClick,
  handleEditAction,
  handleSelectAction,
  forceRender,
}: Partial<MocksTableProps>) => {
  const user = useSelector(getUserAuthDetails);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const teamId = workspace?.id;
  const { pathname } = useLocation();
  const isRuleEditor = pathname.includes(PATHS.RULE_EDITOR.RELATIVE);

  const {
    updateCollectionNameAction,
    deleteCollectionModalAction,
    deleteRecordsModalAction,
    updateMocksCollectionModalAction,
    toggleMockStarAction,
    removeMocksFromCollectionAction,
  } = useMocksActionContext() ?? {};

  const columns: ContentListTableProps<RQMockSchema>["columns"] = [
    Table.SELECTION_COLUMN,
    {
      key: "isFavourite",
      dataIndex: "isFavourite",
      width: isWorkspaceMode ? 25 : isRuleEditor ? 40 : 25,
      render: (_: any, record: RQMockSchema) => {
        const isCollection = isRecordMockCollection(record);

        return isCollection || isRuleEditor ? null : (
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
      title: (
        <div className="rq-col-title">
          <HiOutlineBookOpen />
          Name
        </div>
      ),
      dataIndex: "name",
      ellipsis: true,
      width: isWorkspaceMode ? (isRuleEditor ? 110 : 310) : isRuleEditor ? 290 : 410,
      render: (_: any, record: RQMockSchema) => {
        const isCollection = isRecordMockCollection(record);

        return isCollection ? (
          <div className="mock-collection-details-container">
            <span className="collection-icon">
              <MdOutlineFolder />
            </span>
            <Typography.Text ellipsis={true} className="mock-collection-name">
              {record.name}
            </Typography.Text>

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
          </div>
        ) : (
          <div className="mock-name-details-container">
            <div
              className="mock-details-container"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                if (!isRecordMockCollection(record)) {
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

                <Typography.Text ellipsis={true} className="primary-cell mock-name">
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
            <UserIcon uid={record.createdBy ?? record.lastUpdatedBy} />
          </div>
        );
      },
    },
    {
      key: "lastUpdatedBy",
      title: (
        <div className="rq-col-title">
          <CalendarOutlined />
          Last Modified
        </div>
      ),
      width: 110,
      className: "text-gray",
      render: (_: any, record: RQMockSchema) => {
        return (
          <div className="last-modified">
            {moment(record.updatedTs).format("MMM DD, YYYY") + (record.isOldMock ? "." : "")}{" "}
            {isWorkspaceMode && (
              <>
                by <UserIcon uid={record.lastUpdatedBy ?? record.createdBy} />
              </>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      align: "right",
      width: isWorkspaceMode ? (isRuleEditor ? 50 : 90) : 90,
      render: (_: any, record: RQMockSchema) => {
        const collectionActions: MenuProps["items"] = [
          {
            key: 0,
            onClick: (info) => {
              info.domEvent?.stopPropagation?.();
              updateCollectionNameAction(mockType, record);
            },
            label: (
              <Row>
                <RiEdit2Line /> Rename
              </Row>
            ),
          },
          {
            key: 1,
            danger: true,
            onClick: (info) => {
              info.domEvent?.stopPropagation?.();
              deleteCollectionModalAction(record);
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
                : generateFinalUrl(
                    record.endpoint,
                    user?.details?.profile?.uid,
                    user?.details?.username,
                    teamId,
                    record?.password
                  );

              navigator.clipboard.writeText(copyText).then(() => {
                message.success("Link copied!");
              });
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
              updateMocksCollectionModalAction([record]);
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
            danger: true,
            onClick: (info) => {
              info.domEvent?.stopPropagation?.();
              deleteRecordsModalAction([record]);
            },
            label: (
              <div className="mock-action">
                <RiDeleteBinLine />
                Delete
              </div>
            ),
          },
        ];

        return handleSelectAction ? (
          isRecordMockCollection(record) ? null : (
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
                  url = generateFinalUrl(record.endpoint, user?.details?.profile?.uid, null, teamId, record?.password);
                }
                handleSelectAction(url);
              }}
            >
              Select
            </RQButton>
          )
        ) : (
          <Dropdown
            menu={{ items: isRecordMockCollection(record) ? collectionActions : mockActions }}
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

  if (!isWorkspaceMode) {
    //remove created by column from mock table in private workspace
    columns.splice(4, 1);
  }

  if (isRuleEditor) {
    // remove star mock column in modal view
    columns.splice(2, 1);
  }

  return columns;
};
