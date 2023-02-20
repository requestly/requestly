window.RQ = window.RQ || {};

RQ.DATASTORE = {
  ACTIONS: {
    CHECK_USER_AUTH: "check:userAuthenticated",
    AUTHENTICATE: "authenticate",
    FETCH_USER_DETAILS: "fetchUserDetails",
    GETVALUE: "getValue",
    SETVALUE: "setValue",
  },
};

RQ.DataStoreUtils = {
  isUserAuthenticated: function (callback) {
    RQ.ContentScriptMessageHandler.sendMessage(
      {
        action: RQ.DATASTORE.ACTIONS.CHECK_USER_AUTH,
      },
      callback
    );
  },

  fetchUserDetails: function () {
    return new Promise((resolve, reject) => {
      try {
        RQ.ContentScriptMessageHandler.sendMessage(
          { action: RQ.DATASTORE.ACTIONS.FETCH_USER_DETAILS },
          resolve
        );
      } catch (e) {
        reject(e);
      }
    });
  },

  authenticate: function (callback) {
    RQ.ContentScriptMessageHandler.sendMessage(
      { action: RQ.DATASTORE.ACTIONS.AUTHENTICATE },
      callback
    );
  },

  getValue: function (pathArray) {
    return new Promise((resolve, reject) => {
      try {
        RQ.ContentScriptMessageHandler.sendMessage(
          { action: RQ.DATASTORE.ACTIONS.GETVALUE, pathArray: pathArray },
          resolve
        );
      } catch (e) {
        reject(e);
      }
    });
  },

  setValue: function (pathArray, value, callback) {
    RQ.ContentScriptMessageHandler.sendMessage(
      {
        action: RQ.DATASTORE.ACTIONS.SETVALUE,
        pathArray: pathArray,
        value: value,
      },
      callback
    );
  },
};
