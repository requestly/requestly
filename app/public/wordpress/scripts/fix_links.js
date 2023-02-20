(function () {
  function redirectToRulesPage() {
    var newUrl = window.location.href.replace(
      "www.requestly.in/rules",
      "app.requestly.io/rules"
    );

    if (newUrl !== window.location.href) {
      window.location.href = newUrl;
    }
  }

  function redirectToLibraryPage() {
    var newUrl = window.location.href.replace(
      "www.requestly.in/library",
      "app.requestly.io/library"
    );

    if (newUrl !== window.location.href) {
      window.location.href = newUrl;
    }
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
    execute(redirectToRulesPage, function () {
      return window.location.pathname.indexOf("rules") !== -1;
    });

    execute(redirectToLibraryPage, function () {
      return window.location.pathname.indexOf("library") !== -1;
    });
  }

  init();
})();
