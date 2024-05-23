import React, { useEffect, useState, useTransition } from "react";
import "./SeleniumImporterPage.css";
import "./vendor/tailwind.min.css";
import { clearStorage, isExtensionInstalled, saveStorageObject } from "actions/ExtensionActions";
import removePreloader from "actions/UI/removePreloader";

const SeleniumImporterPage = () => {
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [error, setError] = useState(null);
  const [isAllDone, setIsAllDone] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const steps = [
    "Checking if Requestly Extension is Installed",
    "Fetching your Requestly Rules",
    "Clearing Extension Storage",
    "Saving Rules to Extension Storage",
  ];

  const disableButton = () => {
    setIsButtonDisabled(true);
  };

  const notifySelenium = (message) => {
    window.postMessage({ type: "RQ_IMPORT", message }, "*");
    displayToast(message);
  };

  const displayToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const checkRequestlyExtension = () => {
    notifySelenium("STEP_1_IN_PROGRESS");
    return new Promise((resolve, reject) => {
      if (isExtensionInstalled()) {
        notifySelenium("STEP_1_SUCCESS");
        resolve();
      } else {
        notifySelenium("STEP_1_FAIL");
        reject(new Error("Requestly Extension is not installed"));
      }
    });
  };

  const fetchRules = (apiKey) => {
    notifySelenium("STEP_2_IN_PROGRESS");
    return new Promise((resolve, reject) => {
      fetch("https://api2.requestly.io/v1/rules", {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
        },
      })
        .then((response) => response.json())
        .then((result) => {
          if (result?.success) {
            notifySelenium("STEP_2_SUCCESS");
            resolve(result.data);
          } else {
            throw new Error("Failed to fetch rules");
          }
        })
        .catch((error) => {
          notifySelenium("STEP_2_FAIL");
          reject(error);
        });
    });
  };

  const clearExtensionStorage = () => {
    notifySelenium("STEP_3_IN_PROGRESS");
    return new Promise((resolve, reject) => {
      clearStorage()
        .then(() => {
          notifySelenium("STEP_3_SUCCESS");
          resolve();
        })
        .catch((error) => {
          notifySelenium("STEP_3_FAIL");
          reject(new Error("Failed to clear extension storage"));
        });
    });
  };

  const saveRulesToExtension = (rules) => {
    notifySelenium("STEP_4_IN_PROGRESS");
    return new Promise((resolve, reject) => {
      const formattedObject = rules.reduce((acc, rule) => {
        if (rule && rule.id) {
          acc[rule.id] = rule;
        }
        return acc;
      }, {});

      saveStorageObject(formattedObject)
        .then(() => {
          notifySelenium("STEP_4_SUCCESS");
          resolve();
        })
        .catch((error) => {
          notifySelenium("STEP_4_FAIL");
          reject(new Error("Failed to save rules to extension storage"));
        });
    });
  };

  const startProcess = () => {
    disableButton();
    const urlParams = new URLSearchParams(window.location.search);
    const apiKey = urlParams.get("apiKey");

    setStep(1);
    checkRequestlyExtension()
      .then(() => {
        setStep(2);
        return fetchRules(apiKey);
      })
      .then((rules) => {
        setStep(3);
        return clearExtensionStorage().then(() => rules);
      })
      .then((rules) => {
        setStep(4);
        return saveRulesToExtension(rules);
      })
      .then(() => {
        setIsAllDone(true);
        notifySelenium("ALL_STEPS_DONE");
      })
      .catch((error) => {
        setError({ step, message: error.message });
      })
      .finally(() => {
        setStep(5); // Ensure all steps are marked as completed
      });
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
    <div className="container">
      <div className="main-content">
        <h1 className="text-3xl font-bold mb-4">Requestly for Selenium</h1>
        <button
          onClick={startProcess}
          disabled={isButtonDisabled}
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
            isButtonDisabled ? "bg-gray-500 hover:bg-gray-500" : ""
          }`}
        >
          Load Requestly Rules
        </button>
        <div id="steps">
          {steps.map((stepText, index) => (
            <div
              key={index}
              className={`step ${step === index + 1 ? "in-progress" : ""} ${error?.step === index + 1 ? "error" : ""}`}
            >
              <div className="step-icon-placeholder">
                {step === index + 1
                  ? "⏳"
                  : error?.step === index + 1
                  ? "⚠️"
                  : step > index + 1 || (isAllDone && step === 5)
                  ? "✅"
                  : "🕒"}
              </div>
              <span className="icon step-icon">
                {index === 0 ? "🔌" : index === 1 ? "🔍" : index === 2 ? "🗑️" : "💾"}
              </span>
              <span className="text-lg">{stepText}</span>
              {error?.step === index + 1 && <p className="mt-2 text-sm">{error.message}</p>}
            </div>
          ))}
          {isAllDone && <div className="text-lg text-green-600 font-bold mt-4">✅ All done!</div>}
        </div>
        {toastMessage && <div className="toast">{toastMessage}</div>}
      </div>
      <footer className="footer">
        <p>© 2024 RQ Labs, Inc.</p>
        <div className="footer-links">
          <a href="/">Go to Main App</a> | <a href="https://requestly.com/privacy/">Privacy Policy</a> |{" "}
          <a href="https://requestly.com/terms/">Disclaimer</a>
        </div>
      </footer>
    </div>
  );
};

export default SeleniumImporterPage;
