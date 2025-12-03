import React from "react";
import { importHeaderEditor } from "alternative-importers-beta-sd";

import { CommonRulesImporter } from "../CommonRulesImporter/CommonRulesImporter";

export const HeaderEditorImporter: React.FC<{}> = (props) => {
  return (
    <CommonRulesImporter
      productName="Header Editor"
      supportedFileTypes={["text/plain"]}
      importer={importHeaderEditor}
      docsLink="https://docs.requestly.com/general/imports/header-editor"
      shareLink="https://app.requestly.io/import-from-header-editor"
    />
  );
};
