import React from "react";
import { Snippet } from "componentsV2/Snippet/Snippet";
import { FsAccessError } from "features/apiClient/errors/FsError/FsAccessError/FsAccessError";
import "./fsAccessTroubleshoot.scss";

interface Props {
  error: FsAccessError;
}

export const FsAccessTroubleshoot: React.FC<Props> = ({ error }) => {
  return (
    <div className="fs-access-troubleshoot">
      <div className="fs-access-troubleshoot__text" style={{ margin: "16px 0" }}>
        You can try to give your user access to this by running the following command:
      </div>
      <Snippet code={`chown $(whoami) ${error.path}`} allowCopy />
      <div className="fs-access-troubleshoot__text" style={{ margin: "16px 0" }}>
        To learn more about <span className="error-path">chown</span> refer{" "}
        <a
          href="https://pubs.opengroup.org/onlinepubs/9799919799/utilities/chown.html"
          target="_blank"
          rel="noreferrer"
        >
          here
        </a>
      </div>
      <br />
      <div className="fs-access-troubleshoot__text" style={{ margin: "16px 0" }}>
        If the above command doesn't work, you can try creating a new folder of which you will have write access and
        copying the files to it :
      </div>
      <Snippet
        code={`mkdir folder
        sudo cp -r original_folder folder`}
        allowCopy
      />
    </div>
  );
};
