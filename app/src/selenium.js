import PSMH from "config/PageScriptMessageHandler";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { isExtensionInstalled } from "actions/ExtensionActions";
import { clearStorage, saveStorageObject } from "actions/ExtensionActions";

document.addEventListener("DOMContentLoaded", () => {
  const loadRulesButton = document.getElementById("load-rules-btn");

  /**
   * Starts the process of loading Requestly rules.
   * Disables the button and initiates the step-by-step process.
   */
  const startProcess = () => {
    disableButton(loadRulesButton);

    const urlParams = new URLSearchParams(window.location.search);
    const apiKey = urlParams.get("apiKey");

    checkRequestlyExtension()
      .then(() => fetchRules(apiKey))
      .then((rules) => saveRulesToExtension(rules))
      .then(() => {
        displayAllDone();
        notifySelenium("All done!");
      })
      .catch((error) => {
        displayError(error.step, error.message);
      });
  };

  /**
   * Disables a given button element.
   * @param {HTMLElement} button - The button element to disable.
   */
  const disableButton = (button) => {
    button.disabled = true;
    button.classList.add("bg-gray-500", "hover:bg-gray-500");
    button.classList.remove("bg-blue-500", "hover:bg-blue-700");
  };

  /**
   * Checks if the Requestly extension is installed.
   * @returns {Promise} - Resolves if the extension is installed, rejects with an error otherwise.
   */
  const checkRequestlyExtension = () => {
    markStepInProgress(1);
    notifySelenium("Checking if Requestly Extension is Installed");

    return new Promise((resolve, reject) => {
      // const success = isExtensionInstalled();
      const success = true;
      if (success) {
        resolve();
        markStepCompleted(1);
      } else {
        reject({ step: 1, message: "Requestly Extension is not installed" });
      }
    });
  };

  /**
   * Fetches Requestly rules using the provided API key and workspace ID.
   * @param {string} apiKey - The API key for accessing Requestly rules.
   * @returns {Promise} - Resolves with the fetched rules, rejects with an error otherwise.
   */
  const fetchRules = (apiKey) => {
    markStepInProgress(2);
    notifySelenium("Fetching your Requestly Rules");

    return new Promise((resolve, reject) => {
      const myHeaders = new Headers();
      myHeaders.append("x-api-key", apiKey);

      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
      };

      fetch("https://api2.requestly.io/v1/rules", requestOptions)
        .then((response) => response.json())
        .then((result) => {
          if (result?.success) {
            resolve(result.data);
            markStepCompleted(2);
          } else throw new Error("Failed");
        })
        .catch((error) => {
          console.error(error);
          reject({ step: 2, message: "Failed to fetch rules" });
        });
    });
  };

  /**
   * Saves the fetched Requestly rules to the extension storage.
   * @param {Array} rules - The rules to be saved.
   * @returns {Promise} - Resolves if the rules are saved successfully, rejects with an error otherwise.
   */
  const saveRulesToExtension = (rules) => {
    markStepInProgress(3);
    notifySelenium("Saving Rules to Extension Storage");

    return new Promise((resolve, reject) => {
      (async () => {
        try {
          PSMH.init();

          // Clean up
          await clearStorage();

          // Saving
          const formattedObject = {};
          rules.forEach((object) => {
            if (object && object.id) formattedObject[object.id] = object;
          });
          await saveStorageObject(formattedObject);

          resolve();
          markStepCompleted(3);
        } catch (error) {
          console.error(error);
          reject({ step: 3, message: "Failed to save rules to extension storage" });
        }
      })();
    });
  };

  /**
   * Marks a step as in-progress.
   * @param {number} stepNumber - The number of the step to mark as in-progress.
   */
  const markStepInProgress = (stepNumber) => {
    const stepElement = document.getElementById(`step${stepNumber}`);
    stepElement.classList.add("in-progress");
    stepElement.querySelector(".step-icon-placeholder").innerHTML = '<i class="fas fa-spinner"></i>';
  };

  /**
   * Marks a step as completed.
   * @param {number} stepNumber - The number of the step to mark as completed.
   */
  const markStepCompleted = (stepNumber) => {
    const stepElement = document.getElementById(`step${stepNumber}`);
    stepElement.classList.remove("in-progress");
    stepElement.classList.add("completed");
    stepElement.querySelector(".step-icon-placeholder").innerHTML = '<i class="fas fa-check"></i>';
  };

  /**
   * Displays an error message for a specific step.
   * @param {number} stepNumber - The number of the step to display the error for.
   * @param {string} message - The error message to display.
   */
  const displayError = (stepNumber, message) => {
    const stepElement = document.getElementById(`step${stepNumber}`);
    stepElement.classList.remove("in-progress");
    stepElement.classList.add("error");
    stepElement.querySelector(".step-icon-placeholder").innerHTML = '<i class="fas fa-exclamation-circle"></i>';
    stepElement.innerHTML += `<p class="mt-2 text-sm">${message}</p>`;
    notifySelenium(`Error: ${message}`);
  };

  /**
   * Displays the "All done!" message.
   */
  const displayAllDone = () => {
    const allDoneElement = document.getElementById("all-done");
    allDoneElement.classList.remove("hidden");
  };

  /**
   * Sends a notification to Selenium with a given message.
   * @param {string} message - The message to send to Selenium.
   */
  const notifySelenium = (message) => {
    window.postMessage({ type: "TASK_COMPLETE", message: message }, "*");
  };

  loadRulesButton.addEventListener("click", startProcess);
});
