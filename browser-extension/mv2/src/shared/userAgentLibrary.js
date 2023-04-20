window.RQ = window.RQ || {};
RQ.UserAgentLibrary = RQ.UserAgentLibrary || {};

RQ.UserAgentLibrary = {
  USER_AGENT: {
    device: {
      android: {
        name: "Android",
        values: {
          phone: {
            name: "Android Phone",
            value:
              "Mozilla/5.0 (Linux; Android 13; Pixel 6 Pro Build/TP1A.220624.021; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/104.0.5112.97 Mobile Safari/537.36", // Pixel 6
          },
          tablet: {
            name: "Android Tablet",
            value:
              "Mozilla/5.0 (Linux; Android 12; SM-X906C Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/80.0.3987.119 Mobile Safari/537.36", // SM Tab S8 ultra
          },
        },
      },
      apple: {
        name: "Apple",
        values: {
          iphone: {
            name: "Apple iPhone",
            value:
              "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/92.0.4515.90 Mobile/15E148 Safari/604.1", // iPhone 12
          },
          ipad: {
            name: "Apple iPad",
            value:
              "Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
          },
        },
      },
      windows: {
        name: "Windows",
        values: {
          phone: {
            name: "Windows Phone",
            value:
              "Mozilla/5.0 (Windows Phone 10.0; Android 6.0.1; WebView/3.0; Microsoft; Lumia 950) AppleWebKit/537.36 (KHTML, like Gecko) coc_coc_browser/70.130.340 Chrome/52.0.2743.116 Mobile Safari/537.36 Edge/15.15254",
          },
          tablet: {
            name: "Windows Tablet",
            value: "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; WOW64; Trident/6.0; Touch; NOKIA; Lumia 920)",
          },
        },
      },
      blackberry: {
        name: "Blackberry",
        values: {
          phone: {
            name: "Blackberry Phone",
            value:
              "Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en-US) AppleWebKit/534.11 (KHTML, like Gecko) Version/7.0.0.187 Mobile Safari/534.11",
          },
          tablet: {
            name: "Blackberry Tablet",
            value:
              "Mozilla/5.0 (PlayBook; U; RIM Tablet OS 2.0.0; en-US) AppleWebKit/535.8 (KHTML, like Gecko) Version/7.2.0.0 Safari/535.8",
          },
        },
      },
      symbian_phone: {
        name: "Symbian Phone",
        value:
          "Mozilla/5.0 (SymbianOS) AppleWebKit/533.4 (KHTML, like Gecko) NokiaBrowser/7.3.1.33 Mobile Safari/533.4 3gpp-gba",
      },
    },
    browser: {
      chrome: {
        name: "Google Chrome",
        values: {
          windows: {
            name: "Chrome on Windows",
            value:
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
          },
          macintosh: {
            name: "Chrome on Macintosh",
            value:
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
          },
          linux: {
            name: "Chrome on Linux",
            value:
              "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
          },
        },
      },
      firefox: {
        name: "Mozilla Firefox",
        values: {
          windows: {
            name: "Firefox on Windows",
            value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:104.0) Gecko/20100101 Firefox/104.0",
          },
          macintosh: {
            name: "Firfox on Macintosh",
            value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 12.6; rv:104.0) Gecko/20100101 Firefox/104.0",
          },
          linux: {
            name: "Firefox on Linux",
            value: "Mozilla/5.0 (X11; Linux i686; rv:104.0) Gecko/20100101 Firefox/104.0",
          },
        },
      },
      safari: {
        name: "Safari",
        value:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 12_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15",
      },
      msie: {
        name: "Microsoft Internet Explorer",
        values: {
          msie11: {
            name: "Internet Explorer 11",
            value: "Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko",
          },
        },
      },
      msedge: {
        name: "Microsoft Edge",
        value:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 Edg/105.0.1343.42",
      },
      opera: {
        name: "Opera",
        value:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 OPR/90.0.4480.107",
      },
    },
  },

  getDefaultUserAgent: function () {
    return (navigator && navigator.userAgent) || "";
  },
};
