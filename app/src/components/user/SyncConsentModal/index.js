import React from "react";
import { Button, Modal } from "antd";
//STORE
// import { store } from "store";
// import { updateRefreshPendingStatus } from "store/action-objects";
// import { getUserAuthDetails } from "store/slices/global/user/selectors";

// import { toast } from "../../../utils/Toast";

const SyncConsentModal = ({ isOpen, toggle, appMode }) => {
  //Global State
  // const globalState = useContext(store);
  // const { state } = globalState;
  // const user = getUserAuthDetails(state);

  const update = async () => {
    // const callback = () => {
    //   dispatch(updateRefreshPendingStatus("rules"));
    // };
    // await syncRulesToLocalStorage(user.details.profile.uid, appMode, callback);
    toggle();
  };

  const denyConsent = async () => {
    toggle();
  };

  return (
    <Modal
      className="modal-dialog-centered modal-danger"
      contentClassName="bg-gradient-danger bg-gradient-blue"
      visible={isOpen}
      onCancel={denyConsent}
      footer={null}
      title="Enable rules syncing"
    >
      <div className="modal-body">
        <div className="py-3 text-center">
          <h4 className="heading mt-4">Update rules in your instance</h4>
          <p>
            You have unsynced rules in your system. Do you wish your local rules to be merged with your synced up rules
            ?
          </p>
          {/* <p>
            <span style={{ textTransform: "uppercase" }}>Warning!</span> Your
            local rules might get lost!{" "}
            <Link onClick={exportRules}>Export to JSON</Link>
          </p> */}
        </div>
      </div>
      <div className="modal-footer" style={{ textAlign: "left" }}>
        <Button
          style={{ marginRight: "1rem" }}
          className="text-white"
          type="primary"
          data-dismiss="modal"
          onClick={denyConsent}
        >
          Disable Syncing
        </Button>
        <Button onClick={update} className="btn-white ml-auto" color="link" type="button">
          Enable and Merge with Current Rules
        </Button>
      </div>
    </Modal>
  );
};

export default SyncConsentModal;
