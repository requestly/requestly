import React from "react";
import ProCard from "@ant-design/pro-card";
import MyFilesView from "./FilesTable/myFilesView";

const MyFilesLibraryView = ({ filesList = {}, updateCollection }) => {
  return (
    <>
      <ProCard className="primary-card" title={null}>
        <MyFilesView
          filesList={filesList}
          updateCollection={updateCollection}
        />
      </ProCard>
    </>
  );
};

export default MyFilesLibraryView;
