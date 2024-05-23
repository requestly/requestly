import removePreloader from "actions/UI/removePreloader";
import React, { useEffect, useState, useTransition } from "react";
import "./SeleniumImporterPage.css";
// import "https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css";
import "./vendor/tailwind.min.css";
import { clearStorage, isExtensionInstalled, saveStorageObject } from "actions/ExtensionActions";

const SeleniumImporterPage = () => {
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(null);
  const [error, setError] = useState(null);
  const [isAllDone, setIsAllDone] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const disableButton = (button) => {
    button.disabled = true;
    button.classList.add("bg-gray-500", "hover:bg-gray-500");
    button.classList.remove("bg-blue-500", "hover:bg-blue-700");
  };

  const checkRequestlyExtension = () => {
    setStep(1);
    notifySelenium("STEP_1_IN_PROGRESS");

    return new Promise((resolve, reject) => {
      const success = isExtensionInstalled();
      if (success) {
        notifySelenium("STEP_1_SUCCESS");
        resolve();
      } else {
        notifySelenium("STEP_1_FAIL");
        reject({ step: 1, message: "Requestly Extension is not installed" });
      }
    });
  };

  const fetchRules = (apiKey) => {
    setStep(2);
    notifySelenium("STEP_2_IN_PROGRESS");

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
            notifySelenium("STEP_2_SUCCESS");
            resolve(result.data);
          } else throw new Error("Failed");
        })
        .catch((error) => {
          console.error(error);
          notifySelenium("STEP_2_FAIL");
          reject({ step: 2, message: "Failed to fetch rules" });
        });
    });
  };

  const saveRulesToExtension = (rules) => {
    setStep(3);
    notifySelenium("STEP_3_IN_PROGRESS");

    return new Promise(async (resolve, reject) => {
      try {
        

        await clearStorage();

        const formattedObject = {};
        rules.forEach((object) => {
          if (object && object.id) formattedObject[object.id] = object;
        });
        await saveStorageObject(formattedObject);

        notifySelenium("STEP_3_SUCCESS");
        resolve();
      } catch (error) {
        console.error(error);
        notifySelenium("STEP_3_FAIL");
        reject({ step: 3, message: "Failed to save rules to extension storage" });
      }
    });
  };

  const startProcess = () => {
    const button = document.getElementById("load-rules-btn");
    disableButton(button);
    setIsButtonDisabled(true);

    const urlParams = new URLSearchParams(window.location.search);
    const apiKey = urlParams.get("apiKey");

    checkRequestlyExtension()
      .then(() => fetchRules(apiKey))
      .then((rules) => saveRulesToExtension(rules))
      .then(() => {
        setIsAllDone(true);
        notifySelenium("ALL_STEPS_DONE");
      })
      .catch((error) => {
        setError(error);
      })
      .finally(() => {
        setStep(null);
      });
  };

  const notifySelenium = (message) => {
    window.postMessage({ type: "RQ_IMPORT", message: message }, "*");
    displayToast(message);
  };

  const displayToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  useEffect(() => {
    startTransition(() => {
      try {
        removePreloader();
      } catch (error) {
        console.error(error);
      }
    });
  }, []);

  return (
    <div id="root2">
      <div className="main-content">
        <div id="container" className="container">
          <h1 id="page-title" className="text-3xl font-bold mb-4">
            Requestly for Selenium
          </h1>
          <button
            id="load-rules-btn"
            onClick={startProcess}
            disabled={isButtonDisabled}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
              isButtonDisabled ? "bg-gray-500 hover:bg-gray-500" : ""
            }`}
          >
            Load Requestly Rules
          </button>
          <div id="steps">
            <div id="step1" className={`step ${step === 1 ? "in-progress" : ""} ${error?.step === 1 ? "error" : ""}`}>
              <div className="step-icon-placeholder">
                {step === 1 ? "⏳" : error?.step === 1 ? "⚠️" : step === null ? "🕒" : "✅"}
              </div>
              <span className="icon step-icon">🔌</span>
              <span className="text-lg">Step 1: Checking if Requestly Extension is Installed</span>
              {error?.step === 1 && <p className="mt-2 text-sm">{error.message}</p>}
            </div>
            <div id="step2" className={`step ${step === 2 ? "in-progress" : ""} ${error?.step === 2 ? "error" : ""}`}>
              <div className="step-icon-placeholder">
                {step === 2 ? "⏳" : error?.step === 2 ? "⚠️" : step === null ? "🕒" : "✅"}
              </div>
              <span className="icon step-icon">🔍</span>
              <span className="text-lg">Step 2: Fetching your Requestly Rules</span>
              {error?.step === 2 && <p className="mt-2 text-sm">{error.message}</p>}
            </div>
            <div id="step3" className={`step ${step === 3 ? "in-progress" : ""} ${error?.step === 3 ? "error" : ""}`}>
              <div className="step-icon-placeholder">
                {step === 3 ? "⏳" : error?.step === 3 ? "⚠️" : step === null ? "🕒" : "✅"}
              </div>
              <span className="icon step-icon">💾</span>
              <span className="text-lg">Step 3: Saving Rules to Extension Storage</span>
              {error?.step === 3 && <p className="mt-2 text-sm">{error.message}</p>}
            </div>
            {isAllDone && (
              <div id="all-done" className="text-lg text-green-600 font-bold mt-4">
                ✅ All done!
              </div>
            )}
          </div>
          {toastMessage && <div className="toast">{toastMessage}</div>}
        </div>
      </div>
      <footer id="footer">
        <p id="footer-text">© 2024 RQ Labs, Inc.</p>
        <div id="footer-links">
          <a id="main-app-link" href="https://app.requestly.io">
            Go to Main App
          </a>{" "}
          |
          <a id="privacy-policy-link" href="/privacy-policy">
            {" "}
            Privacy Policy{" "}
          </a>{" "}
          |
          <a id="disclaimer-link" href="/disclaimer">
            {" "}
            Disclaimer{" "}
          </a>
        </div>
      </footer>
    </div>
  );
};

export default SeleniumImporterPage;
