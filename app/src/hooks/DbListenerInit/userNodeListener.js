import { onValue } from "firebase/database";
import Logger from "lib/logger";
import { getNodeRef } from "../../actions/FirebaseActions";
import { actions } from "../../store";

const userNodeListener = (dispatch, uid) => {
  if (uid) {
    try {
      const userNodeRef = getNodeRef(["users", uid, "profile"]);
      onValue(userNodeRef, async (snapshot) => {
        const userDetails = snapshot.val();
        if (userDetails) {
          dispatch(actions.updateUserProfile({ userProfile: userDetails }));
          // set isSyncEnabled in window so that it can be used in storageService
          window.isSyncEnabled = userDetails.isSyncEnabled || null;
        }
      });
    } catch (e) {
      Logger.log(e);
    }
  }
};

export default userNodeListener;
