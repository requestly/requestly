import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Typography, Tooltip, Space, Input, message, Button } from "antd";
import DeleteSharedListModal from "../DeleteSharedListModal";
//UTILS
import { getUserAuthDetails, getAppMode } from "../../../../store/selectors";
import { trackRQLastActivity } from "../../../../utils/AnalyticsUtils";

import {
  //redirectToPricingPlans,
  redirectToSharedListViewer,
} from "../../../../utils/RedirectionUtils";
//CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
//import APP_CONSTANTS from "../../../../config/constants";
import ProCard from "@ant-design/pro-card";
import ProTable from "@ant-design/pro-table";
import { ImportOutlined, DeleteOutlined, CopyOutlined, EyeOutlined } from "@ant-design/icons";
import { CopyToClipboard } from "react-copy-to-clipboard";
import moment from "moment";
import ReactHoverObserver from "react-hover-observer";
import ImportSharedListFromURLModal from "../ImportSharedListFromURLModal";
import { trackSharedListDeleteClicked, trackSharedListUrlCopied } from "modules/analytics/events/features/sharedList";
import { getSharedListURL } from "utils/PathUtils";

const { Link } = Typography;
const Search = Input.Search;

const SharedListTableContainer = ({ sharedLists }) => {
  //Global State
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);

  // Component State
  const [copiedText, setCopiedText] = useState("");
  const [sharedListsToDeleteIdArray, setSharedListsToDeleteIdArray] = useState([]);
  const [isImportSharedListFromURLModalVisible, setIsImportSharedListFromURLModalVisible] = useState(false);
  const [size, setSize] = useState(window.innerWidth);

  //CONSTANTS
  const navigate = useNavigate();
  //Component State
  const [isDeleteSharedListModalActive, setIsDeleteSharedListModalActive] = useState(false);

  const toggleDeleteSharedListModal = () => {
    setIsDeleteSharedListModalActive(isDeleteSharedListModalActive ? false : true);
  };

  const handleDeleteSharedListOnClick = (id) => {
    setSharedListsToDeleteIdArray([id]);
    setIsDeleteSharedListModalActive(true);
    trackSharedListDeleteClicked(id);
    trackRQLastActivity("sharedList_deleted");
  };

  const sharedListsToShow = useMemo(() => Object.values(sharedLists).sort((a, b) => b.creationDate - a.creationDate), [
    sharedLists,
  ]);

  //Search
  const [proData, setProData] = useState(sharedListsToShow);
  const [search, setSearch] = useState(false);

  const onCopyHandler = (urlOfList) => {
    trackSharedListUrlCopied("shared_list_list");
    setCopiedText(urlOfList);
    trackRQLastActivity("sharedList_url_copied");
  };

  const handleViewSharedListOnClick = (id, name) => {
    redirectToSharedListViewer(navigate, id, name);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "listName",
      width: "30%",
      textWrap: "word-break",
      ellipsis: true,
      render: (_, record) => {
        return <Link onClick={(e) => redirectToSharedListViewer(navigate, record.shareId, record.listName)}>{_}</Link>;
      },
    },
    {
      title: "Copy URL",
      dataIndex: "size",
      width: "25%",
      textWrap: "word-break",
      ellipsis: true,
      align: "center",
      // width: "8%",
      render: (_, record) => {
        const urlOfList = getSharedListURL(record.shareId, record.listName);

        return (
          <span>
            <span style={{ marginRight: "1%", cursor: "pointer" }}>
              <CopyToClipboard text={urlOfList} onCopy={() => onCopyHandler(urlOfList)}>
                <Tooltip title={copiedText === urlOfList ? "Copied!" : "Copy To Clipboard"}>
                  <CopyOutlined />
                </Tooltip>
              </CopyToClipboard>
            </span>
          </span>
        );
      },
    },

    {
      title: "Created on",
      align: "center",
      width: "25%",
      dataIndex: "creationDate",
      responsive: ["md"],
      valueType: "date",
      render: (_, record) => {
        const dateToDisplay = record.creationDate;

        return moment(dateToDisplay).format("MMM DD, YYYY");
      },
    },
    {
      title: "Imported",
      align: "center",
      width: "12%",
      responsive: ["xl"],
      dataIndex: "importCount",
      render: (_, record) => {
        if (Object.prototype.hasOwnProperty.call(record, "importCount")) {
          if (record.importCount > 1) {
            let e = record.importCount + " times";
            return e;
          } else {
            let e = "Not yet";
            return e;
          }
        } else {
          let e = "Not yet";
          return e;
        }
      },
    },

    {
      title: "Actions",
      align: "center",
      width: "20%",
      render: (_, record) => {
        return (
          <ReactHoverObserver>
            {({ isHovering }) => (
              <Space>
                <Button size="small" onClick={() => handleViewSharedListOnClick(record.shareId, record.listName)}>
                  <Tooltip title="View shared list">
                    <EyeOutlined />
                    {size > 1100 ? " View" : null}
                  </Tooltip>
                </Button>
                <Button size="small" onClick={() => handleDeleteSharedListOnClick(record.shareId)}>
                  <Tooltip title="Delete shared list">
                    <DeleteOutlined />
                    {size > 1100 ? " Delete" : null}
                  </Tooltip>
                </Button>
              </Space>
            )}
          </ReactHoverObserver>
        );
      },
    },
  ];

  const handleSearch = (searchText) => {
    let flag = 0;
    if (searchText !== "") {
      for (let i = 0; i < proData.length; i++) {
        if (proData[i].listName.toLowerCase().includes(searchText.toLowerCase())) {
          setProData([proData[i]]);
          flag = 1;
          setSearch(true);
          break;
        }
      }
      if (flag === 0) {
        message.error("No List found with given name");
      }
    }
  };

  const handleDataChange = (e) => {
    setProData(sharedListsToShow);
    setSearch(false);
  };
  useEffect(() => {
    window.addEventListener("resize", () => {
      setSize(window.innerWidth);
    });

    return () => {
      window.removeEventListener("resize", () => {
        setSize(window.innerWidth);
      });
    };
  }, []);

  return (
    <>
      <ProCard className="primary-card github-like-border" title={null}>
        <ProTable
          rowKey="shareId"
          dataSource={search ? proData : sharedListsToShow}
          options={false}
          pagination={false}
          search={false}
          dateFormatter={false}
          headerTitle={
            <>
              Manage Shared Lists{" "}
              <Search
                placeholder="Enter List Name"
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
            <>
              {appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP && (
                <Button
                  type="secondary"
                  onClick={() => setIsImportSharedListFromURLModalVisible(true)}
                  icon={<ImportOutlined />}
                >
                  Import from URL
                </Button>
              )}
            </>,
          ]}
          columns={columns}
        />
      </ProCard>
      {/* Modals */}
      {isDeleteSharedListModalActive ? (
        <DeleteSharedListModal
          isOpen={isDeleteSharedListModalActive}
          toggle={toggleDeleteSharedListModal}
          sharedListIdsToDeleteArray={sharedListsToDeleteIdArray}
          userId={user.details.profile.uid}
        />
      ) : null}
      {isImportSharedListFromURLModalVisible ? (
        <ImportSharedListFromURLModal
          isOpen={isImportSharedListFromURLModalVisible}
          toggle={() => setIsImportSharedListFromURLModalVisible(!isImportSharedListFromURLModalVisible)}
        />
      ) : null}
    </>
  );
};

export default SharedListTableContainer;
