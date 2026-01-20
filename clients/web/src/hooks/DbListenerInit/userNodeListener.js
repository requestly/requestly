import { onValue } from "firebase/database";
import Logger from "lib/logger";
import { getNodeRef } from "../../actions/FirebaseActions";
import { globalActions } from "store/slices/global/slice";
import { getUser } from "backend/user/getUser";

const userNodeListener = (dispatch, uid) => {
  if (uid) {
    try {
      const userNodeRef = getNodeRef(["users", uid, "profile"]);
      onValue(userNodeRef, async (snapshot) => {
        const userDetails = snapshot.val();
        if (userDetails) {
          getUser(uid).then((profile) => {
            dispatch(
              globalActions.updateUserProfile({
                userProfile: profile
                  ? {
                      ...(userDetails ?? {}),
                      displayName: profile.displayName,
                      isEmailVerified: profile.isVerified || userDetails.isEmailVerified,
                    }
                  : userDetails,
              })
            );
          });

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
