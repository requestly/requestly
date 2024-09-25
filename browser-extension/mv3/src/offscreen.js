fetch("http://localhost:3009/outside", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    refreshToken: "refreshToken",
    fired: "outside",
  }),
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "iframe") {
    const refreshToken = message.refreshToken;
    fetch("http://localhost:3009/inside", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken,
        fired: "inside",
      }),
    });
    const iframe = document.createElement("iframe");
    iframe.src = `http://localhost:3000?refreshToken=${refreshToken}`;
    iframe.onload = () => {
      console.log("!!!debug", "iframee checkk1", iframe.contentWindow);
      fetch("http://localhost:3009/onload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
          fired: "onload",
        }),
      });

      setTimeout(() => {
        console.log("!!!debug", "iframee checkk2", iframe.contentWindow);
        iframe.contentWindow?.postMessage(
          {
            action: "sendExtensionEvents",
            refreshToken,
            source: "content_script",
          },
          "*"
        );
      }, 3000);
    };
    document.body.appendChild(iframe);
  }
});
