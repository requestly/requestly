import React, { useState } from "react";
import { useSelector } from "react-redux";
import ProTable from "@ant-design/pro-table";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getUserAuthDetails } from "store/selectors";
import { useNavigate } from "react-router-dom";
import APP_CONSTANTS from "config/constants";
import { redirectToFileViewer } from "utils/RedirectionUtils";
import { trackRQLastActivity } from "utils/AnalyticsUtils";
import { Typography, Button, Space, Tooltip, Input, Tag } from "antd";
import * as FilesService from "../../../../../utils/files/FilesService";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { toast } from "utils/Toast.js";
import CopyToClipboard from "react-copy-to-clipboard";
import { getMockUrl, getDelayMockUrl } from "utils/files/urlUtils";
import NewMockSelector from "./mockModal";
import { isEmpty } from "lodash";
import CreateNewRuleGroupModal from "../../../rules/CreateNewRuleGroupModal/";
import { redirectToCreateNewFile } from "utils/RedirectionUtils";
import { trackDeleteMockEvent } from "modules/analytics/events/features/mockServer/mocks";
import { trackDeleteFileEvent } from "modules/analytics/events/features/mockServer/files";

const { Link } = Typography;

const Search = Input.Search;

const FilesTable = ({ filesList = {}, updateCollection, mode, callback }) => {
  const navigate = useNavigate();

  //Global State
  const user = useSelector(getUserAuthDetails);

  //Search
  let allMocks = [];
  const [proData, setProData] = useState(allMocks);
  const [search, setSearch] = useState(false);

  const [
    isCreateNewRuleGroupModalActive,
    setIsCreateNewRuleGroupModalActive,
  ] = useState(false);
  const toggleCreateNewRuleGroupModal = () => {
    setIsCreateNewRuleGroupModalActive(
      isCreateNewRuleGroupModalActive ? false : true
    );
  };

  const deleteFile = (fileDetails, callback) => {
    if (!fileDetails.mockID) {
      FilesService.deleteFile(fileDetails).then(() => {
        toast.info("File deleted");
        //ANALYTICS
        trackRQLastActivity("file_deleted");
        trackDeleteFileEvent();
        if (callback) callback();
      });
    } else {
      const functions = getFunctions();
      const deleteMock = httpsCallable(functions, "deleteMock");

      deleteMock(fileDetails.mockID).then((res) => {
        if (res.data.success) {
          toast.info("Mock deleted");

          // delete the object from storage
          if (!fileDetails.isMock) {
            FilesService.deleteFileFromStorage(fileDetails.filePath);
          }
          trackRQLastActivity("mock_deleted");
          trackDeleteMockEvent();
          if (callback) callback();
        } else {
          toast.error("Mock cannot be deleted. Try again.");
        }
      });
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      textWrap: "word-break",
      ellipsis: true,
      render: (_, record) => {
        return (
          <Link onClick={(e) => redirectToFileViewer(navigate, record.id)}>
            {_}
          </Link>
        );
      },
    },

    {
      title: "Path",
      dataIndex: "path",
      width: "auto",
      align: "center",
      textWrap: "word-break",
      ellipsis: true,
      render: (_, record) => {
        if (!record.path) return "-";
        return <span style={{ fontWeight: "bold" }}>{"/" + record.path}</span>;
      },
    },

    {
      title: "Method",
      dataIndex: "method",
      align: "center",
      width: "auto",
      render: (_, record) => {
        const color = FilesService.getMethodType(record.method);
        if (!record.method) return "-";
        return (
          <span>
            <Tag color={color}>{record.method}</Tag>
          </span>
        );
      },
    },

    {
      title: "Last Modified",
      align: "center",
      width: "auto",
      responsive: ["lg"],
      valueType: "date",
      render: (_, record) => {
        const dateToDisplay = record.modifiedTime
          ? record.modifiedTime
          : record.creationDate
          ? record.creationDate
          : record.modificationDate;

        if (!dateToDisplay) return "-";

        return moment(dateToDisplay).format("MMM DD, YYYY");
      },
    },

    {
      title: "Actions",
      align: "right",
      render: (_, record) => {
        if (mode === APP_CONSTANTS.FILES_TABLE_CONSTANTS.MODES.FILE_PICKER) {
          return (
            <Button
              size="small"
              type="secondary"
              onClick={() => callback(record.shortUrl)}
            >
              Insert
            </Button>
          );
        }
        return (
          <Space>
            <Tooltip title="Edit">
              <Button
                size="small"
                type="secondary"
                icon={<EditOutlined />}
                onClick={(e) =>
                  redirectToFileViewer(navigate, record.id || record.mockID)
                }
              ></Button>
            </Tooltip>
            <Tooltip title="Delete">
              <Button
                size="small"
                type="secondary"
                icon={<DeleteOutlined />}
                onClick={() => {
                  deleteFile(record, updateCollection);
                  toast.loading("Deleting Mock");
                }}
              ></Button>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  const getFinalColumns = () => {
    if (mode !== APP_CONSTANTS.FILES_TABLE_CONSTANTS.MODES.FILE_PICKER) {
      columns.splice(4, 0, {
        title: "Copy Public URL",
        align: "center",
        // width: "15%",
        textWrap: "word-break",
        ellipsis: true,
        className: "fit-text-content",
        render: (_, record) => {
          return (
            <span style={{ cursor: "pointer" }}>
              <CopyToClipboard
                text={
                  record.delay
                    ? getDelayMockUrl(
                        record.path ? record.path : record.mockID,
                        record.delay,
                        record.path ? user.details.profile.uid : null
                      )
                    : record.shortUrl ||
                      getMockUrl(
                        record.path ? record.path : record.mockID,
                        record.path ? user.details.profile.uid : null
                      )
                }
                onCopy={() => toast.info("Copied!")}
              >
                <Tooltip
                  placement="topLeft"
                  title={"Click to Copy"}
                  // color="#0a48b3"
                >
                  <CopyOutlined />
                </Tooltip>
              </CopyToClipboard>
            </span>
          );
        },
      });
    }
    return columns;
  };

  const getMocksToShow = () => {
    if (!filesList || isEmpty(filesList)) return [];
    allMocks = Object.values(filesList);

    // Let's make mockID our id (primary key)
    return allMocks.map((object) => {
      if (!object.id) object.id = object.mockID;
      return object;
    });
  };

  const handleSearch = (searchText) => {
    let flag = 0;
    if (searchText !== "") {
      for (let i = 0; i < proData.length; i++) {
        if (proData[i].name.toLowerCase().includes(searchText.toLowerCase())) {
          setProData([proData[i]]);
          flag = 1;
          setSearch(true);
          break;
        }
      }
      if (flag === 0) {
        toast.error("No Mock found with given name");
      }
    }
  };

  const handleDataChange = (e) => {
    setProData(allMocks);
    setSearch(false);
  };

  const [
    isNewRuleSelectorModalActive,
    setIsNewRuleSelectorModalActive,
  ] = useState(false);

  const toggleNewRuleSelectorModal = () => {
    setIsNewRuleSelectorModalActive(
      isNewRuleSelectorModalActive ? false : true
    );
  };

  return (
    <React.Fragment>
      <ProTable
        rowKey="id"
        headerTitle={
          <>
            Mock APIs{" "}
            <Search
              placeholder="Enter Mock Name"
              onChange={(e) => {
                handleDataChange(e);
              }}
              onSearch={(e) => {
                handleSearch(e);
              }}
              style={{ width: 200, marginLeft: "10px" }}
            />
          </>
        }
        toolBarRender={() => [
          <Button
            type="primary"
            onClick={() => redirectToCreateNewFile(navigate, "API")}
            icon={<PlusOutlined />}
          >
            Create New
          </Button>,
        ]}
        options={false}
        pagination={false}
        search={false}
        dateFormatter={false}
        columns={getFinalColumns()}
        dataSource={search ? proData : getMocksToShow()}
      />
      {isNewRuleSelectorModalActive ? (
        <NewMockSelector
          isOpen={isNewRuleSelectorModalActive}
          toggle={toggleNewRuleSelectorModal}
          currentMocksCount={getMocksToShow().length}
        />
      ) : null}
      {isCreateNewRuleGroupModalActive ? (
        <CreateNewRuleGroupModal
          isOpen={isCreateNewRuleGroupModalActive}
          toggle={toggleCreateNewRuleGroupModal}
        />
      ) : null}
    </React.Fragment>
  );
};
export default FilesTable;
