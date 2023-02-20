import React from "react";
import { Table, Tag } from "antd";
import { getMockType } from "utils/files/FilesService";
import APP_CONSTANTS from "config/constants";

const FilesLibraryTable = ({ filesList, updateCollection, mode, callback }) => {
  //Convert files-list object into an array with properties that are required
  const createDataSource = (filesList) => {
    const dataList = Object.keys(filesList).map((fileId, index) => {
      return {
        key: index,
        id: fileId,
        name: filesList[fileId].name,
        description: filesList[fileId].description,
        lastUpdated: new Date(filesList[fileId].modifiedTime).toDateString(),
        tagType: getMockType(filesList[fileId]).extension,
        actions: filesList[fileId].shortUrl,
      };
    });
    return dataList;
  };
  const columns = [
    {
      title: "Name",
      key: "name",
      render: (data) => (
        <div>
          <a
            href={`/mock-server/viewer/${data.id}`}
            target={
              mode === APP_CONSTANTS.FILES_TABLE_CONSTANTS.MODES.FILE_PICKER
                ? "_blank"
                : null
            }
            rel="noreferrer"
          >
            {data.name}
          </a>
          {data.description !== "" ? (
            <div
              style={{
                maxWidth: "35ch",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {data.description}
            </div>
          ) : null}
        </div>
      ),
    },

    {
      title: "Last Updated",
      dataIndex: "lastUpdated",
      key: "lastUpdated",
    },
    {
      title: "Type",
      key: "tagType",
      dataIndex: "tagType",
      render: (tagType) => (
        <span>
          <Tag color={tagType === "API" ? "green" : "geekblue"}>
            {tagType.toUpperCase()}
          </Tag>
        </span>
      ),
      filters: [
        {
          text: "API",
          value: "API",
        },
        {
          text: "JS",
          value: "js",
        },
        {
          text: "HTML",
          value: "html",
        },
        {
          text: "CSS",
          value: "css",
        },
      ],
      onFilter: (value, record) => record.tagType === value,
    },
    {
      title: "Action",
      key: "actions",
      dataIndex: "actions",
      render: (url) => (
        <span>
          <a
            href="https://app.requestly.io"
            onClick={(e) => {
              e.preventDefault();
              callback(url);
              return false;
            }}
          >
            {" "}
            Select{" "}
          </a>
        </span>
      ),
    },
  ];
  const dataSource = createDataSource(filesList);

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      pagination={{ defaultPageSize: 4 }}
    />
  );
};

export default FilesLibraryTable;
