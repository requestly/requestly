import React from "react";
//SUB COMPONENTS
//VIEWS
import FilesLibraryIndexPage from "../../../../components/features/filesLibrary/FilesLibraryIndexPage";
import ProtectedRoute from "../../../../components/authentication/ProtectedRoute";

export default class FilesListIndex extends React.Component {
  render() {
    return (
      <>
        <ProtectedRoute component={FilesLibraryIndexPage} />
      </>
    );
  }
}
