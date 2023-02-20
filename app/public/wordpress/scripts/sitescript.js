var chromeStoreUrl =
  "https://chrome.google.com/webstore/detail/requestly/mdnleldcmiljblolnjhpnblkcekpdkpa";
var firefoxInstallationUrl =
  "https://app.requestly.io/firefox/builds/requestly-latest.xpi";

var isFirefox = typeof InstallTrigger !== "undefined";

function updateInstallButtonUrl() {
  var $installButton = jQuery(".page-header a.btn-primary");

  if (isFirefox) {
    $installButton.attr("href", firefoxInstallationUrl);
    $installButton.removeAttr("target");
  }
}

function hideFooter() {
  jQuery("footer.footer").remove();
}

/**
 * Execute func based only if conditionFunc returns true
 */
function execute(func, conditionFunc) {
  if (typeof conditionFunc === "function" && !conditionFunc()) {
    return;
  }

  func();
}

function init() {
  execute(updateInstallButtonUrl, function () {
    return window.location.pathname === "/";
  });

  execute(hideFooter);
}

init();
