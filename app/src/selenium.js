document.addEventListener("DOMContentLoaded", () => {
  const loadRulesButton = document.getElementById("load-rules-btn");
  loadRulesButton.addEventListener("click", startProcess);

  function startProcess() {
    loadRulesButton.disabled = true;
    loadRulesButton.classList.add("bg-gray-500", "hover:bg-gray-500");
    loadRulesButton.classList.remove("bg-blue-500", "hover:bg-blue-700");

    const urlParams = new URLSearchParams(window.location.search);
    const apiKey = urlParams.get("apiKey");
    const workspaceId = urlParams.get("workspaceId");

    checkRequestlyExtension()
      .then(() => fetchRules(apiKey, workspaceId))
      .then((rules) => saveRulesToExtension(rules))
      .then(() => {
        displayAllDone();
        notifySelenium("All done!");
      })
      .catch((error) => {
        displayError(error.step, error.message);
      });
  }

  function checkRequestlyExtension() {
    markStepInProgress(1);
    notifySelenium("Checking if Requestly Extension is Installed");

    // Placeholder for checking if Requestly extension is installed
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const success = true; // Change to false to simulate error
        if (success) {
          resolve();
          markStepCompleted(1);
        } else {
          reject({ step: 1, message: "Requestly Extension is not installed" });
        }
      }, 1000);
    });
  }

  function fetchRules(apiKey, workspaceId) {
    markStepInProgress(2);
    notifySelenium("Fetching your Requestly Rules");

    // Placeholder for API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate API call
        const success = true; // Change to false to simulate error
        if (success) {
          resolve([
            // Example rules
            { id: 1, name: "Rule 1" },
            { id: 2, name: "Rule 2" },
          ]);
          markStepCompleted(2);
        } else {
          reject({ step: 2, message: "Failed to fetch rules" });
        }
      }, 1000);
    });
  }

  function saveRulesToExtension(rules) {
    markStepInProgress(3);
    notifySelenium("Saving Rules to Extension Storage");

    // Placeholder for saving rules to Requestly extension storage
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate saving rules
        const success = true; // Change to false to simulate error
        if (success) {
          resolve();
          markStepCompleted(3);
        } else {
          reject({ step: 3, message: "Failed to save rules to extension storage" });
        }
      }, 1000);
    });
  }

  function markStepInProgress(stepNumber) {
    const stepElement = document.getElementById(`step${stepNumber}`);
    stepElement.classList.add("in-progress");
    stepElement.querySelector(".step-icon-placeholder").innerHTML = '<i class="fas fa-spinner"></i>';
  }

  function markStepCompleted(stepNumber) {
    const stepElement = document.getElementById(`step${stepNumber}`);
    stepElement.classList.remove("in-progress");
    stepElement.classList.add("completed");
    stepElement.querySelector(".step-icon-placeholder").innerHTML = '<i class="fas fa-check"></i>';
  }

  function displayError(stepNumber, message) {
    const stepElement = document.getElementById(`step${stepNumber}`);
    stepElement.classList.remove("in-progress");
    stepElement.classList.add("error");
    stepElement.querySelector(".step-icon-placeholder").innerHTML = '<i class="fas fa-exclamation-circle"></i>';
    stepElement.innerHTML += `<p class="mt-2 text-sm">${message}</p>`;
    notifySelenium(`Error: ${message}`);
  }

  function displayAllDone() {
    const allDoneElement = document.getElementById("all-done");
    allDoneElement.classList.remove("hidden");
  }

  function notifySelenium(message) {
    window.postMessage({ type: "TASK_COMPLETE", message: message }, "*");
  }
});
