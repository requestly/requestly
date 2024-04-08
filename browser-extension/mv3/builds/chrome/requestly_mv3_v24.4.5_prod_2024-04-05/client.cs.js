!(function () {
  "use strict";
  const e = "handshakeClient",
    t = "initSessionRecordingWithNewConfig",
    n = "initSessionRecording",
    s = "notifySessionRecordingStarted",
    a = "isRecordingSession",
    o = "getTabSession",
    i = "getAppliedRequestResponseRules",
    r = "getAppliedScriptRules",
    c = "updateAppliedScriptRules",
    u = "startRecording",
    d = "executeScript",
    l = "local",
    E = {};
  let p = !1;
  const R = (e) => {
      if (e) {
        const t = window.top !== window;
        t || g(),
          w("startRecording", {
            relayEventsToTop: t,
            console: !0,
            network: !0,
            maxDuration: 60 * (e.maxDuration || 5) * 1e3,
          });
      }
    },
    g = () => {
      chrome.runtime.onMessage.addListener((e, t, n) => {
        switch (e.action) {
          case a:
            n(p);
            break;
          case o:
            return p && w("getSessionData", null, n), !0;
        }
        return !1;
      }),
        window.addEventListener("message", function (e) {
          e.source === window &&
            "requestly:client" === e.data.source &&
            (e.data.response
              ? m(e.data.action, e.data.payload)
              : "sessionRecordingStarted" === e.data.action && ((p = !0), chrome.runtime.sendMessage({ action: s })));
        });
    },
    m = (e, t) => {
      E[e]?.(t), delete E[e];
    },
    w = (e, t, n) => {
      window.postMessage({ source: "requestly:extension", action: e, payload: t }, window.location.href),
        n && (E[e] = n);
    },
    S = (e) => {
      const t = document.createElement("script");
      (t.src = chrome.runtime.getURL("libs/executeScript.js")),
        (t.onload = () => t.remove()),
        (t.dataset.params = JSON.stringify({ code: e })),
        (document.head || document.documentElement).appendChild(t);
    };
  var T, f, h, y, D, _, A, C, I;
  !(function (e) {
    (e.GROUP = "group"), (e.RULE = "rule");
  })(T || (T = {})),
    (function (e) {
      (e.ACTIVE = "Active"), (e.INACTIVE = "Inactive");
    })(f || (f = {})),
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
    })(h || (h = {})),
    (function (e) {
      (e.URL = "Url"), (e.HOST = "host"), (e.PATH = "path");
    })(y || (y = {})),
    (function (e) {
      (e.EQUALS = "Equals"),
        (e.CONTAINS = "Contains"),
        (e.MATCHES = "Matches"),
        (e.WILDCARD_MATCHES = "Wildcard_Matches");
    })(D || (D = {})),
    (function (e) {
      (e.CUSTOM = "custom"), (e.ALL_PAGES = "allPages");
    })(_ || (_ = {})),
    (function (e) {
      e.SESSION_RECORDING_CONFIG = "sessionRecordingConfig";
    })(A || (A = {})),
    (function (e) {
      (e.JS = "js"), (e.CSS = "css");
    })(C || (C = {})),
    (function (e) {
      (e.URL = "url"), (e.CODE = "code");
    })(I || (I = {}));
  const L = async () => {
    const e = await (async () =>
      new Promise((e) => {
        chrome.storage.local.get(null, e);
      }))();
    return Object.values(e).filter((e) => !!e);
  };
  var O;
  !(function (e) {
    (e[(e.MODIFIED = 0)] = "MODIFIED"), (e[(e.CREATED = 1)] = "CREATED"), (e[(e.DELETED = 2)] = "DELETED");
  })(O || (O = {}));
  const U = (e, t) => {
      chrome.storage.onChanged.addListener((n, s) => {
        if (s === l) {
          const s = [];
          Object.entries(n).forEach(([t, n]) => {
            let a, o;
            if (void 0 !== n.newValue) (a = void 0 !== n.oldValue ? O.MODIFIED : O.CREATED), (o = n.newValue);
            else {
              if (void 0 === n.oldValue) return;
              (a = O.DELETED), (o = n.oldValue);
            }
            (e?.changeTypes?.length && !e.changeTypes.includes(a)) ||
              (e?.keyFilter && t !== e.keyFilter) ||
              (e?.valueFilter && !e.valueFilter(o)) ||
              s.push({ changeType: a, key: t, ...n });
          }),
            s.length && t(s);
        }
      });
    },
    M = (e) => e && (!!e.ruleType || e.objectType === T.RULE),
    v = (e) => e && e.objectType === T.GROUP,
    N = async (e) => {
      const t = await (async () => (await L()).filter(M))(),
        n = await (async () => (await L()).filter(v))();
      return t.filter((t) => {
        if (!t.status || t.status === f.INACTIVE) return !1;
        if (e && t.ruleType !== e) return !1;
        if (!t.groupId) return !0;
        return n.find((e) => e.id === t.groupId).status === f.ACTIVE;
      });
    },
    V = (e) => {
      U({ valueFilter: M }, (t) => {
        t.some(
          ({ changeType: e, oldValue: t, newValue: n }) =>
            (e === O.CREATED && n.status === f.ACTIVE) || (e === O.DELETED && t.status === f.ACTIVE) || e === O.MODIFIED
        ) && e();
      }),
        U({ valueFilter: v, changeTypes: [O.MODIFIED] }, (t) => {
          t.some(({ oldValue: e, newValue: t }) => e.status !== t.status) && e();
        });
    },
    F = async () => {
      const e = await N(h.RESPONSE);
      e.length &&
        S(
          `\n    window.__REQUESTLY__=window.__REQUESTLY__||{};\n    window.__REQUESTLY__.responseRules=${JSON.stringify(
            e.map((e) => {
              const t = e.pairs[0];
              return { id: e.id, source: t.source, response: t.response };
            })
          )};\n    `
        );
    },
    P = async () => {
      const e = await N(h.REQUEST);
      e.length &&
        S(
          `\n    window.__REQUESTLY__=window.__REQUESTLY__||{};\n    window.__REQUESTLY__.requestRules=${JSON.stringify(
            e.map((e) => {
              const t = e.pairs[0];
              return { id: e.id, source: t.source, request: t.request };
            })
          )};\n    `
        );
    };
  console.log("Hello from Requestly!"),
    ("html" === document.doctype?.name || document.contentType?.includes("html")) &&
      (chrome.runtime.sendMessage({ action: e }),
      chrome.runtime.sendMessage({ action: n }, R),
      chrome.runtime.onMessage.addListener((e) => {
        e.action === u && chrome.runtime.sendMessage({ action: t }, R);
      }),
      (() => {
        const e = new Set(),
          t = new Set();
        window.addEventListener("message", function (t) {
          if (t.source === window && "requestly:client" === t.data.source)
            switch (t.data.action) {
              case "response_rule_applied":
              case "request_rule_applied":
                e.add(t.data.ruleId);
            }
        }),
          chrome.runtime.onMessage.addListener((n, s, a) => {
            switch (n.action) {
              case i:
                a(Array.from(e));
                break;
              case c:
                n.ruleIds.forEach((e) => t.add(e));
                break;
              case r:
                a(Array.from(t));
            }
            return !1;
          });
      })(),
      V(F),
      F(),
      V(P),
      P(),
      chrome.runtime.onMessage.addListener((e, t, n) => {
        if (e.action === d) S(e.code);
        return !1;
      }));
})();
