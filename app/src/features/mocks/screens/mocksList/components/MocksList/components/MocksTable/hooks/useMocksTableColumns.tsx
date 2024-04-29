import { useSelector } from "react-redux";
import moment from "moment";
import { getUserAuthDetails } from "store/selectors";
import { Button, Dropdown, MenuProps, Row, Table, Typography, message } from "antd";
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
import { RiFileCopy2Line } from "@react-icons/all-files/ri/RiFileCopy2Line";
import { RiDeleteBinLine } from "@react-icons/all-files/ri/RiDeleteBinLine";
import { RiEdit2Line } from "@react-icons/all-files/ri/RiEdit2Line";
import { RQButton } from "lib/design-system/components";
import { MocksTableProps } from "../MocksTable";
import { isRecordMockCollection } from "../utils";
import { useMocksActionContext } from "features/mocks/contexts/actions";
import { REQUEST_METHOD_COLORS } from "../../../../../../../../../constants/requestMethodColors";

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

  const {
    updateCollectionNameAction,
    deleteCollectionModalAction,
    deleteMockModalAction,
    updateMockCollectionModalAction,
    toggleMockStarAction,
  } = useMocksActionContext();

  const columns: ContentListTableProps<RQMockSchema>["columns"] = [
    {
      ...Table.SELECTION_COLUMN,
      width: 0,
    },
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
      width: 320,
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

            <Typography.Text ellipsis={true} className="mock-collection-description">
              {record.desc}
            </Typography.Text>
          </div>
        ) : (
          <div className="mock-name-details-container">
            {isCollection ? null : (
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
            )}
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
      width: 70,
      responsive: ["lg"],
      className: "text-gray",
      render: (_: any, record: RQMockSchema) => {
        return (
          <div className="mock-table-user-icon">
            <UserIcon uid={record.createdBy} />
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
      width: 120,
      responsive: ["lg"],
      className: "text-gray",
      render: (_: any, record: RQMockSchema) => {
        return (
          <>
            {moment(record.updatedTs).format("MMM DD, YYYY") + (record.isOldMock ? "." : "")}{" "}
            {isWorkspaceMode && (
              <>
                by <UserIcon uid={record.lastUpdatedBy ?? record.createdBy} />
              </>
            )}
          </>
        );
      },
    },
    {
      key: "actions",
      align: "right",
      width: 70,
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
              <Row>
                <RiFileCopy2Line />
                Copy
              </Row>
            ),
          },
          {
            key: 1,
            onClick: (info) => {
              info.domEvent?.stopPropagation?.();
              handleEditAction?.(record.id, record.isOldMock);
            },
            label: (
              <Row>
                <EditOutlined />
                Edit
              </Row>
            ),
          },
          {
            key: 2,
            onClick: (info) => {
              info.domEvent?.stopPropagation?.();
              updateMockCollectionModalAction(record);
            },
            label: (
              <Row>
                <MdOutlineDriveFileMove /> Move
              </Row>
            ),
          },
          {
            key: 3,
            danger: true,
            onClick: (info) => {
              info.domEvent?.stopPropagation?.();
              deleteMockModalAction(record);
            },
            label: (
              <Row>
                <RiDeleteBinLine />
                Delete
              </Row>
            ),
          },
        ];

        return handleSelectAction ? (
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
        ) : (
          <Dropdown
            menu={{ items: isRecordMockCollection(record) ? collectionActions : mockActions }}
            trigger={["click"]}
            overlayClassName="rule-more-actions-dropdown"
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
    columns.splice(2, 1);
  }

  return columns;
};
