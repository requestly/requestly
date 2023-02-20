import React from "react";
//SUB COMPONENTS
//VIEWS
import FilesLib from "../../../../components/features/filesLibrary/MyFilesLibrary";
import ProtectedRoute from "../../../../components/authentication/ProtectedRoute";

export default class FilesLibIndex extends React.Component {
  render() {
    return (
      <>
        <ProtectedRoute component={FilesLib} />
      </>
    );
  }
}
