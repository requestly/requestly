!(function () {
  "use strict";
  const e = "__REQUESTLY__";
  ((e) => {
    (window[e] = window[e] || {}), (window[e].responseRules = []), (window[e].requestRules = []);
    let t = !1;
    try {
      t = window && window.localStorage && localStorage.isDebugMode;
    } catch (e) {}
    const s = (e) => {
        const t = document.createElement("a");
        return (t.href = e), t.href;
      },
      r = (e, t) => {
        const r = (e, t) => {
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
          n = ((e, t) => {
            const r = new URL(s(e));
            switch (t) {
              case "Url":
                return e;
              case "host":
                return r.host;
              case "path":
                return r.pathname;
              default:
                return null;
            }
          })(t, e.key),
          o = e.value;
        if (!n) return !1;
        switch (e.operator) {
          case "Equals":
            if (o === n) return !0;
            break;
          case "Contains":
            if (n.includes(o)) return !0;
            break;
          case "Matches":
            return r(o, n);
          case "Wildcard_Matches":
            return ((e, t) => {
              const s = "/^" + e.replaceAll("*", ".*") + "$/";
              return r(s, t);
            })(o, n);
        }
        return !1;
      },
      n = (e) => !!a(e),
      o = ({ requestData: e, method: t }, s) => {
        const r = Array.isArray(s) ? s : [s];
        return (
          !r.length ||
          r.some((s) => {
            if (s?.requestMethod?.length && !s.requestMethod.includes(t)) return !1;
            let r = s?.requestPayload;
            if (!r) return !0;
            if ("object" == typeof r && 0 === Object.keys(r).length) return !0;
            if (!e || "object" != typeof e) return !1;
            if (0 === Object.keys(e).length) return !1;
            r = r || {};
            const n = r?.key,
              o = r?.value;
            if (n && void 0 !== typeof o) {
              const t = ((e, t) => {
                  if (!t) return;
                  const s = t.split(".");
                  try {
                    for (let t = 0; t < s.length - 1; t++) e = e[s[t]];
                    return e[s[s.length - 1]];
                  } catch (e) {}
                })(e, n),
                s = r?.operator;
              if (!s || "Equals" === s) return t === o;
              if ("Contains" === s) return t.includes(o);
            }
            return !1;
          })
        );
      },
      a = (t) => window[e].responseRules?.findLast((e) => r(e.source, t)),
      i = (t) => window[e].requestRules?.findLast((e) => r(e.source, t)),
      u = (e) => "static" === e.type && e.serveWithoutRequest,
      c = (e) => new Function("args", `return (${e})(args);`),
      l = (e, t) => {
        let s;
        return (
          (s = "static" === e.request.type ? e.request.value : c(e.request.value)(t)),
          "object" != typeof s ||
          ((r = s),
          [Blob, ArrayBuffer, Object.getPrototypeOf(Uint8Array), DataView, FormData, URLSearchParams].some(
            (e) => r instanceof e
          ))
            ? s
            : JSON.stringify(s)
        );
        var r;
      },
      p = (e) => {
        if ("string" != typeof e) return e;
        try {
          return JSON.parse(e);
        } catch (e) {}
        return e;
      },
      d = (e) => p(e) !== e,
      h = (e) => {
        window.top.postMessage(
          {
            source: "requestly:client",
            action: "response_rule_applied",
            ruleId: e.ruleDetails.id,
            requestDetails: e.requestDetails,
          },
          window.location.href
        );
      },
      f = (e) => {
        window.top.postMessage(
          {
            source: "requestly:client",
            action: "request_rule_applied",
            ruleId: e.ruleDetails.id,
            requestDetails: e.requestDetails,
          },
          window.location.href
        );
      },
      y = (e) => !!e && ("object" == typeof e || "function" == typeof e) && "function" == typeof e.then,
      w = (e) => !!e?.includes("application/json"),
      q = async function () {
        if (this.readyState === this.HEADERS_RECEIVED || this.readyState === this.DONE) {
          if (!this.responseRule) return;
          const e = this.requestURL,
            s = a(e),
            { response: r, source: n } = s,
            i = this.responseType,
            u = this.getResponseHeader("content-type");
          if (
            (t && console.log("RQ", "Inside the XHR onReadyStateChange block for url", { url: e, xhr: this }),
            !o({ requestData: p(this.requestData), method: this.method }, n?.filters))
          )
            return;
          if (this.readyState === this.HEADERS_RECEIVED) {
            const e = parseInt(r.statusCode || this.status) || 200,
              t = r.statusText || this.statusText;
            Object.defineProperty(this, "status", { get: () => e }),
              Object.defineProperty(this, "statusText", { get: () => t });
          }
          if (this.readyState === this.DONE) {
            let t =
              "code" === r.type
                ? c(s.response.value)({
                    method: this.method,
                    url: e,
                    requestHeaders: this.requestHeaders,
                    requestData: p(this.requestData),
                    responseType: u,
                    response: this.response,
                    responseJSON: p(this.response),
                  })
                : r.value;
            y(t) && (t = await t);
            const n = i && !["json", "text"].includes(i);
            "static" === r.type && n && (t = this.response),
              n || "object" != typeof t || t instanceof Blob || ("json" !== i && !w(u)) || (t = JSON.stringify(t)),
              Object.defineProperty(this, "response", {
                get: function () {
                  return "static" === r.type && "json" === i ? ("object" == typeof t ? t : p(t)) : t;
                },
              }),
              ("" !== i && "text" !== i) ||
                Object.defineProperty(this, "responseText", {
                  get: function () {
                    return t;
                  },
                });
            const o = { url: e, method: this.method, type: "xmlhttprequest", timeStamp: Date.now() };
            h({ ruleDetails: s, requestDetails: o });
          }
        }
      },
      R = (e, t) => {
        Object.defineProperty(e, "readyState", { writable: !0 });
        const s = (t) => {
            (e.readyState = t), e.dispatchEvent(new CustomEvent("readystatechange"));
          },
          r = (t) => {
            e.dispatchEvent(new ProgressEvent(t));
          };
        r("loadstart");
        const n = d(t) ? "application/json" : "text/plain";
        (e.getResponseHeader = (e) => ("content-type" === e.toLowerCase() ? n : null)),
          s(e.HEADERS_RECEIVED),
          s(e.DONE),
          r("load"),
          r("loadend");
      },
      g = XMLHttpRequest;
    (XMLHttpRequest = function () {
      const e = new g();
      return e.addEventListener("readystatechange", q.bind(e), !1), e;
    }),
      (XMLHttpRequest.prototype = g.prototype),
      Object.entries(g).map(([e, t]) => {
        XMLHttpRequest[e] = t;
      });
    const m = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (e, t) {
      (this.method = e), (this.requestURL = s(t)), m.apply(this, arguments);
    };
    const D = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (e) {
      this.requestData = e;
      const t = i(this.requestURL);
      t &&
        ((this.requestData = l(t.request, { method: this.method, url: this.requestURL, body: e, bodyAsJson: p(e) })),
        f({
          ruleDetails: t,
          requestDetails: { url: this.requestURL, method: this.method, type: "xmlhttprequest", timeStamp: Date.now() },
        })),
        (this.responseRule = a(this.requestURL)),
        this.responseRule && u(this.responseRule.response)
          ? R(this, this.responseRule.response.value)
          : D.apply(this, arguments);
    };
    let E = XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype.setRequestHeader = function (e, t) {
      (this.requestHeaders = this.requestHeaders || {}), (this.requestHeaders[e] = t), E.apply(this, arguments);
    };
    const b = fetch;
    fetch = async (e, r = {}) => {
      let q;
      q = e instanceof Request ? e.clone() : new Request(e.toString(), r);
      let R = s(q.url);
      const g = q.method,
        m = !["GET", "HEAD"].includes(g),
        D = m && i(R);
      if (D) {
        const e = await q.text(),
          t = l(D, { method: g, url: R, body: e, bodyAsJson: p(e) }) || {};
        (q = new Request(q.url, {
          method: g,
          body: t,
          headers: q.headers,
          referrer: q.referrer,
          referrerPolicy: q.referrerPolicy,
          mode: q.mode,
          credentials: q.credentials,
          cache: q.cache,
          redirect: q.redirect,
          integrity: q.integrity,
        })),
          f({ ruleDetails: D, requestDetails: { url: R, method: g, type: "fetch", timeStamp: Date.now() } });
      }
      let E, S, H, L;
      m && (E = p(await q.clone().text()));
      const j = a(R);
      if (j && u(j.response)) {
        const e = d(j.response.value) ? "application/json" : "text/plain";
        S = new Headers({ "content-type": e });
      } else
        try {
          if (((H = D ? await b(q) : await b(e, r)), !j)) return H;
          S = H?.headers;
        } catch (e) {
          L = e;
        }
      if (H && n(H.url)) R = H.url;
      else {
        if (!n(q.url)) return L ? Promise.reject(L) : H;
        R = q.url;
      }
      if (204 === H?.status) return H;
      if (
        (t &&
          console.log("RQ", "Inside the fetch block for url", {
            url: R,
            resource: e,
            initOptions: r,
            fetchedResponse: H,
          }),
        (E =
          "POST" === g
            ? p(await q.text())
            : ((e) => {
                const t = {};
                if (!e || "?" === e || -1 === e.indexOf("?")) return t;
                const s = e.split("?")[1],
                  r = Object.fromEntries(new URLSearchParams(s));
                for (let e in r) {
                  const t = r[e];
                  r[e] = p(t);
                }
                return r;
              })(R)),
        !o({ requestData: E, method: g }, j.source?.filters))
      )
        return H;
      let O;
      if ("code" === j.response.type) {
        let e = {
          method: g,
          url: R,
          requestHeaders: q.headers && Array.from(q.headers).reduce((e, [t, s]) => ((e[t] = s), e), {}),
          requestData: E,
        };
        if (H) {
          const t = await H.text(),
            s = H.headers.get("content-type"),
            r = p(t);
          e = { ...e, responseType: s, response: t, responseJSON: r };
        }
        (O = c(j.response.value)(e)),
          y(O) && (O = await O),
          "object" == typeof O && w(e?.responseType) && (O = JSON.stringify(O));
      } else O = j.response.value;
      const x = { url: R, method: g, type: "fetch", timeStamp: Date.now() };
      h({ ruleDetails: j, requestDetails: x });
      const v = parseInt(j.response.statusCode || H?.status) || 200,
        M = [204, 205, 304].includes(v);
      return new Response(M ? null : new Blob([O]), {
        status: v,
        statusText: j.response.statusText || H?.statusText,
        headers: S,
      });
    };
  })(e),
    ((e) => {
      window[e] = window[e] || {};
      window.addEventListener("message", function (t) {
        var s, r;
        t.source === window &&
          "requestly:extension" === t.data.source &&
          ("startRecording" === t.data.action
            ? ((window[e].sessionRecorder = new Requestly.SessionRecorder(t.data.payload)),
              window[e].sessionRecorder.start(),
              (s = "sessionRecordingStarted"),
              window.postMessage({ source: "requestly:client", action: s, payload: r }, window.location.href))
            : "getSessionData" === t.data.action &&
              ((e, t) => {
                window.postMessage(
                  { source: "requestly:client", response: !0, action: e, payload: t },
                  window.location.href
                );
              })(t.data.action, window[e].sessionRecorder.getSession()));
      });
    })(e);
})();
