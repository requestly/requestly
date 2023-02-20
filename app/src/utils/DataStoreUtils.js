import * as FirebaseActions from "../actions/FirebaseActions";

const DataStoreUtils = {
  isUserAuthenticated: function (callback) {
    FirebaseActions.checkUserAuthState(callback);
  },

  authenticate: function () {
    return FirebaseActions.googleSignIn();
  },

  getValue: function (pathArray) {
    return new Promise((resolve, reject) => {
      try {
        FirebaseActions.getValue(pathArray, resolve);
      } catch (e) {
        reject(e);
      }
    });
  },

  setValue: function (pathArray, value) {
    return FirebaseActions.setValue(pathArray, value);
  },

  updateValueAsPromise: function (pathArray, value) {
    return FirebaseActions.updateValueAsPromise(pathArray, value);
  },
  updateValue: function (pathArray, value) {
    return FirebaseActions.updateValue(pathArray, value);
  },
};

export default DataStoreUtils;
