export const getAvailableUserAgents = (pair) => {
  switch (pair.envType) {
    case "device":
      return [
        {
          label: "Android",
          options: [
            {
              label: "Android Phone",
              value: {
                env: "android.phone",
                userAgent:
                  "Mozilla/5.0 (Linux; Android 13; Pixel 6 Pro Build/TP1A.220624.021; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/104.0.5112.97 Mobile Safari/537.36",
              },
            },
            {
              label: "Android Tablet",
              value: {
                env: "android.tablet",
                userAgent:
                  "Mozilla/5.0 (Linux; Android 12; SM-X906C Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/80.0.3987.119 Mobile Safari/537.36",
              },
            },
          ],
        },
        {
          label: "Apple",
          options: [
            {
              label: "Apple iPhone",
              value: {
                env: "apple.iphone",
                userAgent:
                  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/92.0.4515.90 Mobile/15E148 Safari/604.1",
              },
            },
            {
              label: "Apple iPad",
              value: {
                env: "apple.ipad",
                userAgent:
                  "Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
              },
            },
          ],
        },
        {
          label: "Windows",
          options: [
            {
              label: "Windows Phone",
              value: {
                env: "windows.phone",
                userAgent:
                  "Mozilla/5.0 (Windows Phone 10.0; Android 6.0.1; WebView/3.0; Microsoft; Lumia 950) AppleWebKit/537.36 (KHTML, like Gecko) coc_coc_browser/70.130.340 Chrome/52.0.2743.116 Mobile Safari/537.36 Edge/15.15254",
              },
            },
            {
              label: "Windows Tablet",
              value: {
                env: "windows.tablet",
                userAgent:
                  "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; WOW64; Trident/6.0; Touch; NOKIA; Lumia 920)",
              },
            },
          ],
        },
        {
          label: "Blackberry",
          options: [
            {
              label: "Blackberry Phone",
              value: {
                env: "blackberry.phone",
                userAgent:
                  "Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en-US) AppleWebKit/534.11 (KHTML, like Gecko) Version/7.0.0.187 Mobile Safari/534.11",
              },
            },
            {
              label: "Blackberry Tablet",
              value: {
                env: "blackberry.tablet",
                userAgent:
                  "Mozilla/5.0 (PlayBook; U; RIM Tablet OS 2.0.0; en-US) AppleWebKit/535.8 (KHTML, like Gecko) Version/7.2.0.0 Safari/535.8",
              },
            },
          ],
        },
        {
          label: "Symbian",
          options: [
            {
              label: "Symbian Phone",
              value: {
                env: "symbian_phone",
                userAgent:
                  "Mozilla/5.0 (SymbianOS) AppleWebKit/533.4 (KHTML, like Gecko) NokiaBrowser/7.3.1.33 Mobile Safari/533.4 3gpp-gba",
              },
            },
          ],
        },
      ];
    case "browser":
      return [
        {
          label: "Google Chrome",
          options: [
            {
              label: "Chrome on Windows",
              value: {
                env: "chrome.windows",
                userAgent:
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
              },
            },
            {
              label: "Chrome on Macintosh",
              value: {
                env: "chrome.macintosh",
                userAgent:
                  "Mozilla/5.0 (Macintosh; Intel Mac OS X 12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
              },
            },
            {
              label: "Chrome on Linux",
              value: {
                env: "chrome.linux",
                userAgent:
                  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
              },
            },
          ],
        },
        {
          label: "Mozilla Firefox",
          options: [
            {
              label: "Firefox on Windows",
              value: {
                env: "firefox.windows",
                userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:104.0) Gecko/20100101 Firefox/104.0",
              },
            },
            {
              label: "Firfox on Macintosh",
              value: {
                env: "firefox.macintosh",
                userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 12.6; rv:104.0) Gecko/20100101 Firefox/104.0",
              },
            },
            {
              label: "Firfox on Linux",
              value: {
                env: "firefox.linux",
                userAgent: "Mozilla/5.0 (X11; Linux i686; rv:104.0) Gecko/20100101 Firefox/104.0",
              },
            },
          ],
        },
        {
          label: "Safari",
          options: [
            {
              label: "Safari",
              value: {
                env: "safari",
                userAgent:
                  "Mozilla/5.0 (Macintosh; Intel Mac OS X 12_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15",
              },
            },
          ],
        },
        {
          label: "Microsoft Internet Explorer",
          options: [
            {
              label: "Internet Explorer 11",
              value: {
                env: "msie.msie11",
                userAgent: "Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko",
              },
            },
          ],
        },
        {
          label: "Microsoft Edge",
          options: [
            {
              label: "Microsoft Edge",
              value: {
                env: "msedge",
                userAgent:
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 Edg/105.0.1343.42",
              },
            },
          ],
        },
        {
          label: "Opera",
          options: [
            {
              label: "Opera 68",
              value: {
                env: "opera",
                userAgent:
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 OPR/90.0.4480.107",
              },
            },
          ],
        },
      ];

    default:
      return [];
  }
};
