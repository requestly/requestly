import React from "react";
import ProCard from "@ant-design/pro-card";
import FilesTable from "./FilesTable";

const FilesLibraryTableContainer = ({ filesList = {}, updateCollection }) => {
  return (
    <>
      <ProCard className="primary-card github-like-border" title={null}>
        <FilesTable filesList={filesList} updateCollection={updateCollection} />
      </ProCard>
    </>
  );
};

export default FilesLibraryTableContainer;
