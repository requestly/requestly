import React from "react";
//VIEWS
import ImportSharedListIndexPage from "../../../../components/features/sharedLists/ImportSharedListIndexPage";
import ProtectedRoute from "../../../../components/authentication/ProtectedRoute";

export default class SharedListImportView extends React.Component {
  render() {
    return (
      <>
        <ProtectedRoute component={ImportSharedListIndexPage} />
      </>
    );
  }
}
