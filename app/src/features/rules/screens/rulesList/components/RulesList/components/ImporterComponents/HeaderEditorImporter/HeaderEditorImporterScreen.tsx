import React from "react";

import { HeaderEditorImporter } from "./HeaderEditorImporterComponent";
import "./headerEditorImporter.scss";

export const HeaderEditorImportScreen: React.FC<{}> = () => {
  return (
    <div className="header-importer-screen-container">
      <HeaderEditorImporter />
    </div>
  );
};
