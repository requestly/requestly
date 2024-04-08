!(function () {
  "use strict";
  var e = {
    browser: "chrome",
    storageType: "local",
    contextMenuContexts: ["browser_action"],
    env: "prod",
    WEB_URL: "https://app.requestly.io",
    OTHER_WEB_URLS: ["https://app.requestly.com"],
    logLevel: "info",
  };
  const t = "GET_STORAGE_INFO",
    a = "GET_STORAGE_SUPER_OBJECT",
    n = "GET_STORAGE_OBJECT",
    o = "SAVE_STORAGE_OBJECT",
    s = "REMOVE_STORAGE_OBJECT",
    c = "CLEAR_STORAGE",
    r = "getTabSession",
    i = "local",
    E = async () =>
      new Promise((e) => {
        chrome.storage.local.get(null, e);
      });
  var d, u, l, R, T, S, m, A, _, C;
  !(function (e) {
    (e[(e.MODIFIED = 0)] = "MODIFIED"), (e[(e.CREATED = 1)] = "CREATED"), (e[(e.DELETED = 2)] = "DELETED");
  })(d || (d = {})),
    (function (e) {
      (e.GROUP = "group"), (e.RULE = "rule");
    })(u || (u = {})),
    (function (e) {
      (e.ACTIVE = "Active"), (e.INACTIVE = "Inactive");
    })(l || (l = {})),
    (function (e) {
      (e.REDIRECT = "Redirect"),
        (e.CANCEL = "Cancel"),
        (e.REPLACE = "Replace"),
        (e.HEADERS = "Headers"),
        (e.USERAGENT = "UserAgent"),
        (e.SCRIPT = "Script"),
        (e.QUERYPARAM = "QueryParam"),
        (e.RESPONSE = "Response"),
        (e.REQUEST = "Request"),
        (e.DELAY = "Delay");
    })(R || (R = {})),
    (function (e) {
      (e.URL = "Url"), (e.HOST = "host"), (e.PATH = "path");
    })(T || (T = {})),
    (function (e) {
      (e.EQUALS = "Equals"),
        (e.CONTAINS = "Contains"),
        (e.MATCHES = "Matches"),
        (e.WILDCARD_MATCHES = "Wildcard_Matches");
    })(S || (S = {})),
    (function (e) {
      (e.CUSTOM = "custom"), (e.ALL_PAGES = "allPages");
    })(m || (m = {})),
    (function (e) {
      e.SESSION_RECORDING_CONFIG = "sessionRecordingConfig";
    })(A || (A = {})),
    (function (e) {
      (e.JS = "js"), (e.CSS = "css");
    })(_ || (_ = {})),
    (function (e) {
      (e.URL = "url"), (e.CODE = "code");
    })(C || (C = {}));
  const O = (t) => !!t && [...new Set([e.WEB_URL, ...e.OTHER_WEB_URLS])].some((e) => t.includes(e)),
    g = {};
  const p = "content_script",
    w = "page_script",
    I = "source",
    f = (e, t) => {
      e.action &&
        (t &&
          ((e, t) => {
            if (!t) return;
            (g[e.action + "_1"] = t), (e.requestId = 1);
          })(e, t),
        (e[I] = p),
        window.postMessage(e, window.origin));
    },
    v = (e, t) => {
      f({ action: e.action, requestId: e.requestId, response: t });
    };
  document.documentElement.setAttribute("rq-ext-version", chrome.runtime.getManifest().version),
    document.documentElement.setAttribute("rq-ext-mv", "3"),
    document.documentElement.setAttribute("rq-ext-id", chrome.runtime.id),
    window.addEventListener("message", async (e) => {
      var d;
      if ((!e || O(e.origin)) && e && e.data && e.data.source === w)
        switch (
          (void 0 !== e.data.response &&
            ((e) => {
              const t = g[e.data.action + "_" + e.data.requestId];
              "function" == typeof t && (delete g[e.data.action], t(e.data.response));
            })(e),
          e.data.action)
        ) {
          case t: {
            const t = await (async () => {
              const e = await E();
              return Object.values(e).filter((e) => !!e);
            })();
            return void v(e.data, { storageType: i, numItems: t.length, bytesUsed: JSON.stringify(t).length });
          }
          case a: {
            const t = await E();
            return void v(e.data, t);
          }
          case n: {
            const t = await (async (e) =>
              new Promise((t) => {
                chrome.storage.local.get(e, (a) => t(a[e]));
              }))(e.data.key);
            return void v(e.data, t);
          }
          case o:
            return (
              await (async (e) => {
                await chrome.storage.local.set(e);
              })(e.data.object),
              void v(e.data)
            );
          case s:
            return (
              await (async (e) => {
                await chrome.storage.local.remove(e);
              })(e.data.key),
              void v(e.data)
            );
          case c:
            return (
              await (async () => {
                await chrome.storage.local.clear();
              })(),
              void v(e.data)
            );
          case r:
            (d = e.data),
              chrome.runtime.sendMessage(d, (e) => {
                v(d, e);
              });
        }
    });
})();
