import React from "react";
import { Snippet } from "componentsV2/Snippet/Snippet";
import { FsAccessError } from "features/apiClient/helpers/modules/sync/local/FsError/FsAccessError";
import "./fsAccessTroubleshoot.scss";

interface Props {
  error: FsAccessError;
}

export const FsAccessTroubleshoot: React.FC<Props> = ({ error }) => {
  return (
    <div className="fs-access-troubleshoot">
      <div className="fs-access-troubleshoot__text">
        The file operation that you tried to perform on path <span className="error-path">{error.meta.path}</span> has
        failed due to access issue
      </div>
      <div className="fs-access-troubleshoot__text text-center" style={{ margin: "16px 0" }}>
        You can try to give your user access to this by running the following command:
      </div>
      <Snippet>
        <code>chown user</code>
      </Snippet>
      <div className="fs-access-troubleshoot__text text-center" style={{ margin: "16px 0" }}>
        If the above command doesn't work, you can try the following:
      </div>
      <Snippet>
        <div>mkdir folder</div> sudo cp -r original_folder folder
      </Snippet>
    </div>
  );
};
