import ProTable from "@ant-design/pro-table";
import { getFunctions, httpsCallable } from "firebase/functions";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import APP_CONSTANTS from "config/constants";
import { redirectToFileViewer } from "utils/RedirectionUtils";
import { trackRQLastActivity } from "utils/AnalyticsUtils";
import { Typography, Button, Space, Tooltip, Input } from "antd";
import { IoLogoHtml5, IoLogoCss3, IoLogoJavascript, IoImage } from "react-icons/io5";
import UploadFileBtn from "../../UploadFileBtn";
import * as FilesService from "../../../../../utils/files/FilesService";
import { DeleteOutlined, EditOutlined, PlusOutlined, CopyOutlined } from "@ant-design/icons";
import moment from "moment";
import { toast } from "utils/Toast.js";
import CopyToClipboard from "react-copy-to-clipboard";
import { getMockUrl } from "utils/files/urlUtils";
import NewMockSelector from "./mockModal";
import { isEmpty } from "lodash";
import { trackDeleteMockEvent } from "modules/analytics/events/features/mockServer/mocks";
import { trackDeleteFileEvent } from "modules/analytics/events/features/mockServer/files";

const { Link } = Typography;

const Search = Input.Search;

const MyFilesView = ({ filesList = {}, updateCollection, mode, callback }) => {
  const navigate = useNavigate();

  //Search
  let allMocks = [];
  const [proData, setProData] = useState(allMocks);
  const [search, setSearch] = useState(false);

  const [copiedText, setCopiedText] = useState("");

  const deleteFile = (fileDetails, callback) => {
    if (!fileDetails.mockID) {
      FilesService.deleteFile(fileDetails).then(() => {
        toast.info("File deleted");
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

  const onCopyHandler = (fileDetails) => {
    setCopiedText(fileDetails.shortUrl || getMockUrl(fileDetails.mockID));
  };
  const renderFileExtensionLogo = (extension) => {
    switch (extension) {
      case "JS":
        return <IoLogoJavascript style={{ fontSize: "1.2rem" }} />;
      case "HTML":
        return <IoLogoHtml5 style={{ fontSize: "1.2rem" }} />;
      case "CSS":
        return <IoLogoCss3 style={{ fontSize: "1.2rem" }} />;
      case "IMAGE":
        return <IoImage style={{ fontSize: "1.2rem" }} />;
      default:
        return <IoLogoJavascript style={{ fontSize: "1.2rem" }} />;
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      width: "30%",
      textWrap: "word-break",
      ellipsis: true,
      render: (_, record) => {
        return <Link onClick={(e) => redirectToFileViewer(navigate, record.id)}>{record.name}</Link>;
      },
    },

    {
      title: "Mock Type",
      dataIndex: "contentType",
      align: "center",
      // width: "15%",
      render: (_, record) => {
        const { extension } = FilesService.getMockType(record);
        return <span>{renderFileExtensionLogo(extension)}</span>;
      },
    },

    {
      title: "Last Modified",
      align: "center",
      responsive: ["md"],
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
      // width: "10%",
      responsive: ["sm"],
      render: (_, record) => {
        if (mode === APP_CONSTANTS.FILES_TABLE_CONSTANTS.MODES.FILE_PICKER) {
          return (
            <Button size="small" type="secondary" onClick={() => callback(record.shortUrl)}>
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
                onClick={(e) => redirectToFileViewer(navigate, record.id || record.mockID)}
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
      columns.splice(3, 0, {
        title: "Copy Public URL",
        align: "center",
        // width: "15%",
        textWrap: "word-break",
        ellipsis: true,
        className: "fit-text-content",
        render: (_, record) => {
          return (
            <span style={{ cursor: "pointer" }}>
              <CopyToClipboard text={record.shortUrl || getMockUrl(record.mockID)} onCopy={() => onCopyHandler(record)}>
                <Tooltip
                  placement="topLeft"
                  title={copiedText === (record.shortUrl || getMockUrl(record.mockID)) ? "Copied" : "Click to Copy"}
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

  const [isNewRuleSelectorModalActive, setIsNewRuleSelectorModalActive] = useState(false);

  const toggleNewRuleSelectorModal = () => {
    setIsNewRuleSelectorModalActive(isNewRuleSelectorModalActive ? false : true);
  };

  return (
    <React.Fragment>
      <ProTable
        rowKey="id"
        headerTitle={
          <>
            File Server (HTML / CSS / JS){" "}
            <Search
              placeholder="Search Files"
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
          <Button type="primary" onClick={() => setIsNewRuleSelectorModalActive(true)} icon={<PlusOutlined />}>
            New File (HTML / CSS / JS)
          </Button>,
          <UploadFileBtn updateCollection={updateCollection} buttonType="secondary" />,
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
    </React.Fragment>
  );
};
export default MyFilesView;
