import React from "react";
//SUB COMPONENTS
//VIEWS
import FileViewerIndexPage from "../../../../components/features/filesLibrary/FileViewerIndexPage";
import ProtectedRoute from "../../../../components/authentication/ProtectedRoute";

export default class FileViewer extends React.Component {
  render() {
    return (
      <>
        <ProtectedRoute component={FileViewerIndexPage} />
      </>
    );
  }
}
