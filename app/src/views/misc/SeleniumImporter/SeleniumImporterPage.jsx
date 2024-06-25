import React, { useEffect, useState, useTransition } from "react";
import "./SeleniumImporterPage.css";
import "./vendor/tailwind.min.css";
import { clearStorage, isExtensionInstalled, saveStorageObject } from "actions/ExtensionActions";
import removePreloader from "actions/UI/removePreloader";

const SeleniumImporterPage = () => {
  const [isPending, startTransition] = useTransition();
  const [step1, setStep1] = useState({ inProgress: false, success: false, error: null });
  const [step2, setStep2] = useState({ inProgress: false, success: false, error: null });
  const [step3, setStep3] = useState({ inProgress: false, success: false, error: null });
  const [step4, setStep4] = useState({ inProgress: false, success: false, error: null });
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
    setStep1({ inProgress: true, success: false, error: null });
    notifySelenium("STEP_1_IN_PROGRESS");

    return new Promise((resolve, reject) => {
      if (isExtensionInstalled()) {
        notifySelenium("STEP_1_SUCCESS");
        setStep1({ inProgress: false, success: true, error: null });
        resolve();
      } else {
        notifySelenium("STEP_1_FAIL");
        const error = new Error("Requestly Extension is not installed");
        setStep1({ inProgress: false, success: false, error });
        reject(error);
      }
    });
  };

  const fetchRules = (apiKey) => {
    setStep2({ inProgress: true, success: false, error: null });
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
            setStep2({ inProgress: false, success: true, error: null });
            resolve(result.data);
          } else {
            throw new Error("Failed to fetch rules");
          }
        })
        .catch((error) => {
          notifySelenium("STEP_2_FAIL");
          setStep2({ inProgress: false, success: false, error });
          reject(error);
        });
    });
  };

  const clearExtensionStorage = () => {
    setStep3({ inProgress: true, success: false, error: null });
    notifySelenium("STEP_3_IN_PROGRESS");
    return new Promise((resolve, reject) => {
      clearStorage()
        .then(() => {
          notifySelenium("STEP_3_SUCCESS");
          setStep3({ inProgress: false, success: true, error: null });
          resolve();
        })
        .catch((error) => {
          notifySelenium("STEP_3_FAIL");
          setStep3({ inProgress: false, success: false, error });
          reject(new Error("Failed to clear extension storage"));
        });
    });
  };

  const saveRulesToExtension = (rules) => {
    setStep4({ inProgress: true, success: false, error: null });
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
          setStep4({ inProgress: false, success: true, error: null });
          resolve();
        })
        .catch((error) => {
          notifySelenium("STEP_4_FAIL");
          setStep4({ inProgress: false, success: false, error });
          reject(new Error("Failed to save rules to extension storage"));
        });
    });
  };

  const startProcess = () => {
    disableButton();
    const urlParams = new URLSearchParams(window.location.search);
    const apiKey = urlParams.get("apiKey");

    checkRequestlyExtension()
      .then(() => fetchRules(apiKey))
      .then((rules) => clearExtensionStorage().then(() => rules))
      .then((rules) => saveRulesToExtension(rules))
      .then(() => {
        setIsAllDone(true);
        notifySelenium("ALL_STEPS_DONE");
      })
      .catch((error) => {
        console.error("Error in process:", error);
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
          {steps.map((stepText, index) => {
            const stepState = index === 0 ? step1 : index === 1 ? step2 : index === 2 ? step3 : step4;
            return (
              <div
                key={index}
                className={`step ${stepState.inProgress ? "in-progress" : ""} ${stepState.error ? "error" : ""}`}
              >
                <div className="step-icon-placeholder">
                  {stepState.inProgress
                    ? "⏳"
                    : stepState.error
                    ? "⚠️"
                    : stepState.success || (isAllDone && index === 3)
                    ? "✅"
                    : "🕒"}
                </div>
                <span className="icon step-icon">
                  {index === 0 ? "🔌" : index === 1 ? "🔍" : index === 2 ? "🗑️" : "💾"}
                </span>
                <span className="text-lg">{stepText}</span>
                {stepState.error && <p className="mt-2 text-sm">{stepState.error.message}</p>}
              </div>
            );
          })}
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
