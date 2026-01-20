import React from "react";
import MockEditorIndex from "components/features/mocksV2/MockEditorIndex";
import { useSearchParams } from "react-router-dom";
import { FileType, MockType } from "components/features/mocksV2/types";

const FileMockEditorCreateView = () => {
  const [searchParams] = useSearchParams();
  const fileType = searchParams.get("file_type") || FileType.JS;

  return <MockEditorIndex isNew={true} mockType={MockType.FILE} fileType={fileType} />;
};

export default FileMockEditorCreateView;
