import React, { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Input } from "antd";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
//ACTIONS
import { handleFileInput } from "./actions";
import { actions } from "store";

//UTILS
import { getUserAuthDetails } from "../../../../store/selectors";

//CONSTANTS
import APP_CONSTANTS from "config/constants";
import { AUTH } from "modules/analytics/events/common/constants";

import { CloudUploadOutlined } from "@ant-design/icons";

const UploadFileBtn = ({ updateCollection, buttonType = "primary" }) => {
  //Component State
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const [showFileInputBox, setShowFileInputBox] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const openAuthModal = useCallback(() => {
    dispatch(
      actions.toggleActiveModal({
        modalName: "authModal",
        newValue: true,
        newProps: {
          redirectURL: window.location.href,
          userActionMessage: "Sign up to upload files to server",
          authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
          eventSource: AUTH.SOURCE.UPLOAD_FILES,
        },
      })
    );
  }, [dispatch]);

  const handleUploadBtnOnClick = (e) => {
    if (user.loggedIn) {
      setShowFileInputBox(true);
    } else {
      openAuthModal();
    }
  };

  const handleFileInputOnChange = (e) => {
    setUploadingFile(true);
    handleFileInput(e).then(() => {
      if (updateCollection) {
        updateCollection();
      }
      setShowFileInputBox(false);
      setUploadingFile(false);
    });
  };

  return (
    <React.Fragment>
      {uploadingFile ? (
        <Button loading={true} type={buttonType}>
          Uploading...
        </Button>
      ) : showFileInputBox ? (
        <Input type="file" onChange={handleFileInputOnChange} />
      ) : (
        <AuthConfirmationPopover
          title="You need to sign up to upload files"
          onConfirm={handleUploadBtnOnClick}
          source={AUTH.SOURCE.UPLOAD_FILES}
        >
          <Button
            type={buttonType}
            icon={<CloudUploadOutlined />}
            onClick={handleUploadBtnOnClick}
          >
            Upload File
          </Button>
        </AuthConfirmationPopover>
      )}
    </React.Fragment>
  );
};

export default UploadFileBtn;
