!(function () {
  "use strict";
  const e = "getRulesAndGroups",
    t = "getTabSession",
    a = "handshakeClient",
    n = "getExecutedRules",
    r = "checkIfNoRulesPresent",
    s = "initSessionRecordingWithNewConfig",
    c = "checkIfExtensionEnabled",
    o = "toggleExtensionStatus",
    i = "initSessionRecording",
    u = "notifySessionRecordingStarted",
    l = "getTabSession",
    d = "getAppliedRequestResponseRules",
    E = "getAppliedScriptRules",
    m = "updateAppliedScriptRules",
    I = "local",
    h = async () => {
      const e = await (async () =>
        new Promise((e) => {
          chrome.storage.local.get(null, e);
        }))();
      return Object.values(e).filter((e) => !!e);
    },
    T = async (e, t) => {
      await (async (e) => {
        await chrome.storage.local.set(e);
      })({ [e]: t });
    },
    A = async (e) =>
      new Promise((t) => {
        chrome.storage.local.get(e, (a) => t(a[e]));
      });
  var S;
  !(function (e) {
    (e[(e.MODIFIED = 0)] = "MODIFIED"), (e[(e.CREATED = 1)] = "CREATED"), (e[(e.DELETED = 2)] = "DELETED");
  })(S || (S = {}));
  const R = (e, t) => {
    chrome.storage.onChanged.addListener((a, n) => {
      if (n === I) {
        const n = [];
        Object.entries(a).forEach(([t, a]) => {
          let r, s;
          if (void 0 !== a.newValue) (r = void 0 !== a.oldValue ? S.MODIFIED : S.CREATED), (s = a.newValue);
          else {
            if (void 0 === a.oldValue) return;
            (r = S.DELETED), (s = a.oldValue);
          }
          (e?.changeTypes?.length && !e.changeTypes.includes(r)) ||
            (e?.keyFilter && t !== e.keyFilter) ||
            (e?.valueFilter && !e.valueFilter(s)) ||
            n.push({ changeType: r, key: t, ...a });
        }),
          n.length && t(n);
      }
    });
  };
  var p;
  !(function (e) {
    (e.IS_EXTENSION_ENABLED = "isExtensionEnabled"),
      (e.EXTENSION_RULES_COUNT = "extensionRulesCount"),
      (e.TEST_SCRIPT = "testScript"),
      (e.ENABLED_RULE_IDS_MAP = "enabledRuleIdsMap");
  })(p || (p = {}));
  const g = (e) => `rq_var_${e}`,
    _ = async (e, t) => {
      await T(g(e), t);
    },
    y = async (e, t) => (await A(g(e))) ?? t,
    L = (e, t) => {
      R({ keyFilter: g(e), changeTypes: [S.MODIFIED] }, (e) => {
        t(e[e.length - 1].newValue, e[0].oldValue);
      });
    };
  var f,
    N = {
      browser: "chrome",
      storageType: "local",
      contextMenuContexts: ["browser_action"],
      env: "prod",
      WEB_URL: "https://app.requestly.io",
      OTHER_WEB_URLS: ["https://app.requestly.com"],
      logLevel: "info",
    };
  !(function (e) {
    (e.NORMAL = "/resources/images/48x48.png"),
      (e.DISABLED = "/resources/images/48x48_greyscale.png"),
      (e.ACTIVE = "/resources/images/48x48_green.png");
  })(f || (f = {}));
  var C, D;
  !(function (e) {
    e.TOGGLE_ACTIVATION_STATUS = "toggle-activation-status";
  })(C || (C = {})),
    (function (e) {
      (e.ACTIVATE = "Activate Requestly"), (e.DEACTIVATE = "Deactivate Requestly");
    })(D || (D = {}));
  const w = (e) => {
      chrome.contextMenus.update(C.TOGGLE_ACTIVATION_STATUS, { title: e ? D.DEACTIVATE : D.ACTIVATE }),
        e ? chrome.action.setIcon({ path: f.NORMAL }) : chrome.action.setIcon({ path: f.DISABLED });
    },
    O = (e) => {
      e.reason === chrome.runtime.OnInstalledReason.INSTALL &&
        chrome.tabs.create({ url: N.WEB_URL + "/extension-installed" });
    };
  var v, b, U, M, x, P, B, V, k;
  !(function (e) {
    (e.GROUP = "group"), (e.RULE = "rule");
  })(v || (v = {})),
    (function (e) {
      (e.ACTIVE = "Active"), (e.INACTIVE = "Inactive");
    })(b || (b = {})),
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
    })(U || (U = {})),
    (function (e) {
      (e.URL = "Url"), (e.HOST = "host"), (e.PATH = "path");
    })(M || (M = {})),
    (function (e) {
      (e.EQUALS = "Equals"),
        (e.CONTAINS = "Contains"),
        (e.MATCHES = "Matches"),
        (e.WILDCARD_MATCHES = "Wildcard_Matches");
    })(x || (x = {})),
    (function (e) {
      (e.CUSTOM = "custom"), (e.ALL_PAGES = "allPages");
    })(P || (P = {})),
    (function (e) {
      e.SESSION_RECORDING_CONFIG = "sessionRecordingConfig";
    })(B || (B = {})),
    (function (e) {
      (e.JS = "js"), (e.CSS = "css");
    })(V || (V = {})),
    (function (e) {
      (e.URL = "url"), (e.CODE = "code");
    })(k || (k = {}));
  const G = (e) => e && (!!e.ruleType || e.objectType === v.RULE),
    j = (e) => e && e.objectType === v.GROUP,
    q = async () => (await h()).filter(G),
    F = async () => (await h()).filter(j),
    H = async (e) => {
      const t = await q(),
        a = await F();
      return t.filter((t) => {
        if (!t.status || t.status === b.INACTIVE) return !1;
        if (e && t.ruleType !== e) return !1;
        if (!t.groupId) return !0;
        return a.find((e) => e.id === t.groupId).status === b.ACTIVE;
      });
    },
    W = (e, t) => {
      e.startsWith("/") || (e = `/${e}/`);
      return ((e) => {
        const t = e.match(new RegExp("^/(.+)/(|i|g|ig|gi)$"));
        if (!t) return null;
        try {
          return new RegExp(t[1], t[2]);
        } catch {
          return null;
        }
      })(e)?.test(t);
    },
    X = (e, t) => {
      const a = ((e, t) => {
          const a = new URL(e);
          switch (t) {
            case M.URL:
              return e;
            case M.HOST:
              return a.host;
            case M.PATH:
              return a.pathname;
          }
        })(t, e.key),
        n = e.value;
      if (!(e.isActive ?? !0)) return !1;
      if (!a) return !1;
      switch (e.operator) {
        case x.EQUALS:
          if (n === a) return !0;
          break;
        case x.CONTAINS:
          if (-1 !== a.indexOf(n)) return !0;
          break;
        case x.MATCHES:
          return W(n, a);
        case x.WILDCARD_MATCHES:
          return ((e, t) => {
            const a = "/^" + e.replaceAll("*", ".*") + "$/";
            return W(a, t);
          })(n, a);
      }
      return !1;
    },
    Q = (e, t = [], a = !1) => {
      const n = () => {
        const a = document.createElement("script");
        t.length
          ? t.forEach(({ name: e, value: t }) => {
              a.setAttribute(e, t ?? "");
            })
          : (a.type = "text/javascript"),
          a.classList.add("__RQ_SCRIPT__"),
          a.appendChild(document.createTextNode(e));
        (document.head || document.documentElement).appendChild(a);
      };
      a && "loading" === document.readyState ? document.addEventListener("DOMContentLoaded", n) : n();
    },
    $ = (e, t = [], a = !1) => {
      const n = () => {
        const a = document.createElement("script");
        t.length
          ? t.forEach(({ name: e, value: t }) => {
              a.setAttribute(e, t ?? "");
            })
          : (a.type = "text/javascript"),
          a.classList.add("__RQ_SCRIPT__"),
          (a.src = e);
        (document.head || document.documentElement).appendChild(a);
      };
      a && "loading" === document.readyState ? document.addEventListener("DOMContentLoaded", n) : n();
    },
    z = function (e, t = []) {
      var a = document.createElement("style");
      a.appendChild(document.createTextNode(e)),
        t.length &&
          t.forEach(({ name: e, value: t }) => {
            a.setAttribute(e, t ?? "");
          }),
        a.classList.add("__RQ_SCRIPT__");
      (document.head || document.documentElement).appendChild(a);
    },
    J = function (e, t = []) {
      var a = document.createElement("link");
      t.length
        ? t.forEach(({ name: e, value: t }) => {
            a.setAttribute(e, t ?? "");
          })
        : ((a.type = "text/css"), (a.rel = "stylesheet")),
        (a.href = e),
        a.classList.add("__RQ_SCRIPT__");
      (document.head || document.documentElement).appendChild(a);
    },
    Y = (e, t) =>
      new Promise((a) => {
        let n;
        n = e.codeType === V.JS ? (e.type === k.URL ? $ : Q) : e.type === k.URL ? J : z;
        const r = e.attributes ?? [];
        chrome.scripting.executeScript(
          {
            target: t,
            func: n,
            args: [e.value, r, "afterPageLoad" === e.loadTime],
            world: "MAIN",
            injectImmediately: !0,
          },
          a
        );
      }),
    K = async () => await y(p.IS_EXTENSION_ENABLED, !0),
    Z = Object.values(chrome.declarativeNetRequest.ResourceType),
    ee = async (e) => {
      const { rulesMatchedInfo: t } = await chrome.declarativeNetRequest.getMatchedRules({ tabId: e }),
        a = new Set(),
        n = await y(p.ENABLED_RULE_IDS_MAP, {});
      t.forEach((e) => "_dynamic" === e.rule.rulesetId && a.add(n[e.rule.ruleId]));
      const r = await (async (e) => await chrome.tabs.sendMessage(e, { action: d }))(e);
      r.forEach((e) => a.add(e));
      const s = await (async (e) => await chrome.tabs.sendMessage(e, { action: E }))(e);
      return (
        s.forEach((e) => a.add(e)),
        a.size > 0
          ? await (async (e) => {
              const t = await chrome.storage.local.get(e);
              return Object.values(t);
            })(Array.from(a))
          : []
      );
    },
    te = async (e) =>
      new Promise((t) => {
        chrome.declarativeNetRequest.updateDynamicRules(e, t);
      }),
    ae = async () => {
      await (async () => {
        const e = await chrome.declarativeNetRequest.getDynamicRules();
        await te({ removeRuleIds: e.map((e) => e.id) });
      })();
      (await y(p.IS_EXTENSION_ENABLED, !0)) &&
        (await (async () => {
          const e = await H(),
            t = [],
            a = await y(p.ENABLED_RULE_IDS_MAP, {});
          e.forEach((e) => {
            const n = e.extensionRules;
            n?.length &&
              n.forEach((n) => {
                n.condition.resourceTypes?.length || (n.condition.resourceTypes = Z);
                const r = t.length + 1;
                t.push({ ...n, id: r }), (a[r] = e.id), _(p.ENABLED_RULE_IDS_MAP, a);
              });
          }),
            await te({ addRules: t });
        })());
    },
    ne = async () => {
      var e;
      (e = ae),
        R({ valueFilter: G }, (t) => {
          t.some(
            ({ changeType: e, oldValue: t, newValue: a }) =>
              (e === S.CREATED && a.status === b.ACTIVE) ||
              (e === S.DELETED && t.status === b.ACTIVE) ||
              e === S.MODIFIED
          ) && e();
        }),
        R({ valueFilter: j, changeTypes: [S.MODIFIED] }, (t) => {
          t.some(({ oldValue: e, newValue: t }) => e.status !== t.status) && e();
        }),
        L(p.IS_EXTENSION_ENABLED, ae),
        ae();
    },
    re = async (e, t, a) => {
      if (
        ((e) =>
          [
            ...[...new Set([N.WEB_URL, ...N.OTHER_WEB_URLS])].map((e) => ({
              key: M.URL,
              operator: x.CONTAINS,
              value: e,
            })),
            { key: M.URL, operator: x.CONTAINS, value: "__rq" },
          ].some((t) => X(t, e)))(a)
      )
        return;
      const n = (await H()).filter((e) => e.ruleType === U.SCRIPT),
        r = [],
        s = new Set();
      n.forEach((e) => {
        e.pairs.forEach((t) => {
          X(t.source, a) &&
            (t.scripts.forEach((e) => {
              r.push(e);
            }),
            s.add(e.id));
        });
      });
      for (let a of r) await Y(a, { tabId: e, frameIds: [t] });
      s.size > 0 && chrome.tabs.sendMessage(e, { action: m, ruleIds: Array.from(s) });
    },
    se = "sessionRecordingConfig",
    ce = async (e, t, a, n = !1) => {
      if (n) {
        const e = { key: M.HOST, operator: x.CONTAINS, value: new URL(a).hostname },
          t = await A(se),
          n = t?.pageSources || [];
        await T(se, { ...t, pageSources: [e, ...n] });
      }
      const r = await (async (e) => {
        const t = await A(se);
        let a = t?.pageSources || [];
        if (await K()) {
          if ("autoRecording" in t) {
            if (!t?.autoRecording.isActive) return null;
            t?.autoRecording.mode === P.ALL_PAGES &&
              (a = [{ value: "*", key: M.URL, isActive: !0, operator: x.WILDCARD_MATCHES }]);
          }
          if (a.some((t) => X(t, e))) return t;
        }
        return null;
      })(a);
      var s, c;
      return (
        r &&
          (await ((s = "libs/requestly-web-sdk.js"),
          (c = { tabId: e, frameIds: [t] }),
          new Promise((e) => {
            chrome.scripting.executeScript({ target: c, files: [s], world: "MAIN", injectImmediately: !0 }, e);
          }))),
        r
      );
    },
    oe = () => {
      chrome.runtime.onMessage.addListener((d, E, m) => {
        switch (d.action) {
          case a:
            (h = { tabId: E.tab?.id, frameIds: [E.frameId] }),
              chrome.scripting.executeScript({ target: h, files: ["client.js"], world: "MAIN", injectImmediately: !0 }),
              re(E.tab?.id, E.frameId, E.url);
            break;
          case i:
            return ce(E.tab?.id, E.frameId, E.tab.url).then(m), !0;
          case s:
            return ce(E.tab?.id, E.frameId, E.tab.url, !0).then(m), !0;
          case u:
            (I = E.tab.id),
              chrome.action.setBadgeText({ tabId: I, text: "REC" }),
              chrome.action.setBadgeBackgroundColor({ tabId: I, color: "#e34850" });
            break;
          case t:
            return (
              ((e, t) => {
                chrome.tabs.sendMessage(e, { action: l }, { frameId: 0 }, t);
              })(d.tabId, m),
              !0
            );
          case e:
            return (
              (async () => {
                const [e, t] = await Promise.all([q(), F()]);
                return { rules: e, groups: t };
              })().then(m),
              !0
            );
          case n:
            return ee(d.tabId).then(m), !0;
          case r:
            return (async () => 0 === (await q()).length)().then(m), !0;
          case c:
            return K().then(m), !0;
          case o:
            return (
              (async () => {
                const e = !(await y(p.IS_EXTENSION_ENABLED, !0));
                return _(p.IS_EXTENSION_ENABLED, e), w(e), L(p.IS_EXTENSION_ENABLED, w), e;
              })().then(m),
              !0
            );
        }
        var I, h;
        return !1;
      });
    };
  (async () => {
    chrome.action.onClicked.addListener(() => {
      chrome.tabs.create({ url: N.WEB_URL });
    }),
      chrome.commands.onCommand.addListener((e) => {
        "reload" === e && chrome.runtime.reload();
      }),
      chrome.runtime.onInstalled.addListener(O),
      chrome.runtime.setUninstallURL(N.WEB_URL + "/goodbye/"),
      ne(),
      oe(),
      (async () => {
        chrome.contextMenus.removeAll(),
          chrome.contextMenus.create({ id: C.TOGGLE_ACTIVATION_STATUS, title: D.DEACTIVATE, contexts: ["action"] }),
          chrome.contextMenus.onClicked.addListener(async (e) => {
            if (e.menuItemId === C.TOGGLE_ACTIVATION_STATUS) {
              const e = await y(p.IS_EXTENSION_ENABLED, !0);
              _(p.IS_EXTENSION_ENABLED, !e);
            }
          });
        const e = await y(p.IS_EXTENSION_ENABLED, !0);
        w(e), L(p.IS_EXTENSION_ENABLED, w);
      })();
  })();
})();
